import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Protected routes that require authentication
// Any route starting with these paths will be protected
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/courses',
];

// Routes that should bypass the auth check completely
const BYPASS_ROUTES = [
  '/login',
  '/signup',
  '/api/auth', // Better Auth API routes
  '/_next',
  '/static',
  '/favicon.ico',
];

// Get main app URL for fallback when no origin is provided
const getMainAppUrl = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (appUrl) {
    return appUrl;
  }
  
  // Fallback based on environment
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://potatix.com';
};

// Main app URL
const MAIN_APP_URL = getMainAppUrl();

/**
 * Extract course slug from host header
 * Supports formats:
 * - [slug].potatix.com
 * - [slug].potatix.com:5005 (development)
 */
function extractSubdomain(host: string): string | null {
  console.log(`[Middleware] Extracting subdomain from: ${host}`);
  
  // Remove port if present
  const hostWithoutPort = host.split(':')[0];
  
  // Check if it's a subdomain
  if (hostWithoutPort === 'potatix.com' || hostWithoutPort === 'www.potatix.com') {
    return null; // Main domain, no subdomain
  }
  
  // Check for subdomains like: something.potatix.com
  if (hostWithoutPort.endsWith('.potatix.com')) {
    const subdomain = hostWithoutPort.split('.')[0];
    console.log(`[Middleware] Found subdomain: ${subdomain}`);
    return subdomain;
  }
  
  // For local development when using /etc/hosts like: 
  // 127.0.0.1 mycourse.potatix.com
  // This will appear as just "mycourse.potatix.com" or "mycourse.potatix.com:5005"
  if (hostWithoutPort.includes('potatix.com') && !hostWithoutPort.startsWith('www.')) {
    const parts = hostWithoutPort.split('.');
    if (parts.length > 0) {
      const potentialSubdomain = parts[0];
      if (potentialSubdomain !== 'potatix') {
        console.log(`[Middleware] Found local dev subdomain: ${potentialSubdomain}`);
        return potentialSubdomain;
      }
    }
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const origin = request.headers.get('origin') || '';
  
  console.log(`[Middleware] Processing request: ${host}${pathname}`);
  console.log(`[Middleware] Request origin: ${origin}`);
  
  // Try to extract course slug from host
  const courseSlug = extractSubdomain(host);
  
  // CRITICAL FIX: Intercept redirects to /dashboard when on a course subdomain
  // This happens after successful authentication
  if (courseSlug && pathname === '/dashboard') {
    console.log(`[Middleware] Intercepting dashboard redirect for course: ${courseSlug}`);
    
    // For subdomain access, just redirect to the root URL of the subdomain
    // The middleware will handle converting this to the internal path format
    const url = new URL('/', request.url);
    console.log(`[Middleware] Redirecting from dashboard to root URL: ${url.href}`);
    return NextResponse.redirect(url);
  }
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    console.log(`[Middleware] Handling CORS preflight for ${pathname}`);
    
    const response = new NextResponse(null, { status: 204 });
    
    // Allow ANY origin - set the actual origin from the request
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', MAIN_APP_URL);
    }
    
    // Set other CORS headers
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    response.headers.set('Vary', 'Origin'); // Important when origin changes
    
    return response;
  }
  
  // Skip API routes and static assets early - these should never be rewritten
  if (pathname.startsWith('/api/') || 
      BYPASS_ROUTES.some(route => pathname.startsWith(route))) {
    console.log(`[Middleware] Skipping rewrite for API/static path: ${pathname}`);
    
    // For API routes, we need to handle CORS headers for cross-subdomain requests
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.next();
      
      // Set CORS headers for ANY origin
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Vary', 'Origin');
      }
      
      return response;
    }
    
    return NextResponse.next();
  }
  
  if (courseSlug) {
    // Check for authentication when accessing course subdomains
    const sessionToken = getSessionCookie(request);
    const isAuthenticated = !!sessionToken;
    
    console.log(`[Middleware] Course subdomain access: ${courseSlug}, Auth: ${isAuthenticated}`);
    
    // Create the new URL, preserving any path after the domain
    const url = request.nextUrl.clone();
    
    // If user is not authenticated and trying to access a course, 
    // route to auth page for the course, unless they're already on it
    if (!isAuthenticated && !pathname.startsWith(`/viewer/${courseSlug}/auth`)) {
      // Map the requested path to the internal path structure for redirect
      let redirectPath;
      
      // Handle clean paths based on the user's current location
      if (pathname === '/') {
        // Root path maps to course overview
        redirectPath = `/viewer/${courseSlug}`;
      } else if (pathname.startsWith('/lesson/')) {
        // Clean lesson URLs
        const lessonId = pathname.replace('/lesson/', '');
        redirectPath = `/viewer/${courseSlug}/lesson/${lessonId}`;
      } else {
        // Any other path
        redirectPath = pathname.startsWith('/viewer/') 
          ? pathname 
          : `/viewer/${courseSlug}${pathname}`;
      }
      
      // Set the auth page and store the redirect path
      url.pathname = `/viewer/${courseSlug}/auth`;
      url.searchParams.set('redirectTo', redirectPath);
      console.log(`[Middleware] Redirecting to auth with redirect: ${redirectPath}`);
      return NextResponse.rewrite(url);
    }
    
    // For authenticated users, rewrite the clean URLs to internal paths
    
    // Root path -> course overview
    if (pathname === '/' || pathname === '') {
      url.pathname = `/viewer/${courseSlug}`;
      console.log(`[Middleware] Rewriting root to course overview: ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
    
    // Lesson path -> internal lesson path
    if (pathname.startsWith('/lesson/')) {
      const lessonId = pathname.replace('/lesson/', '');
      url.pathname = `/viewer/${courseSlug}/lesson/${lessonId}`;
      console.log(`[Middleware] Rewriting lesson URL ${pathname} to ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
    
    // Check if this is already a viewer route with the correct slug
    if (pathname.startsWith(`/viewer/${courseSlug}`)) {
      console.log(`[Middleware] Already on correct viewer route: ${pathname}`);
      return NextResponse.next();
    }
    
    // Other paths get prefixed with viewer/courseSlug
    url.pathname = `/viewer/${courseSlug}${pathname}`;
    console.log(`[Middleware] Rewriting ${pathname} to ${url.pathname}`);
    return NextResponse.rewrite(url);
  }
  
  // Check if the path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // Get the session token from cookie
    const sessionToken = getSessionCookie(request);
    
    if (!sessionToken) {
      console.warn(`[Auth] No session token for protected route: ${pathname}`);
      
      // Redirect to login with callback URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      return NextResponse.redirect(loginUrl);
    }
    
    // Session exists, proceed
    console.log(`[Auth] Session exists for protected route: ${pathname}`);
  }
  
  // For everything else, add the CORS headers and continue
  const response = NextResponse.next();
  
  // Allow ANY origin - set the actual origin from the request
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  }
  
  return response;
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Apply to all routes except some specific paths
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
  
