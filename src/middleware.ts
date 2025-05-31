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
  
  console.log(`[Middleware] Processing request: ${host}${pathname}`);
  
  // Skip API routes and static assets early - these should never be rewritten
  if (pathname.startsWith('/api/') || 
      BYPASS_ROUTES.some(route => pathname.startsWith(route))) {
    console.log(`[Middleware] Skipping rewrite for API/static path: ${pathname}`);
    return NextResponse.next();
  }
  
  // Try to extract course slug from host
  const courseSlug = extractSubdomain(host);
  
  if (courseSlug) {
    // Create the new URL, preserving any path after the domain
    const url = request.nextUrl.clone();
    
    // Handle clean lesson URLs (/lesson/[id])
    if (pathname.startsWith('/lesson/')) {
      url.pathname = `/viewer/${courseSlug}${pathname}`;
      console.log(`[Middleware] Rewriting clean lesson URL ${pathname} to ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
    
    // Check if this is already a viewer route with the correct slug
    if (pathname.startsWith(`/viewer/${courseSlug}`)) {
      console.log(`[Middleware] Already on correct viewer route: ${pathname}`);
      return NextResponse.next();
    }
    
    // If we're at root path, go to viewer/courseSlug
    if (pathname === '/' || pathname === '') {
      url.pathname = `/viewer/${courseSlug}`;
    } else {
      // Otherwise, we need to prefix the path with /viewer/courseSlug
      url.pathname = `/viewer/${courseSlug}${pathname}`;
    }
    
    console.log(`[Middleware] Rewriting ${pathname} to ${url.pathname}`);
    
    // Return as a rewrite (preserves original URL in browser)
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
  
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Apply to all routes except some specific paths
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
  
