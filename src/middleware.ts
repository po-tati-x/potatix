import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/projects',
];

// Public routes that should be accessible without auth
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth',
  '/',
  '/about',
  '/faq',
];

// Debug function to inspect cookie contents
const debugCookies = (request: NextRequest) => {
  const cookieNames = [...request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' }))];
  console.log('All cookies:', cookieNames);
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public assets
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') // Skip files like favicon.ico, etc.
  ) {
    return NextResponse.next();
  }
  
  // Check if path needs protection
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Skip middleware for public routes
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  // Only check auth for protected routes
  if (isProtectedRoute) {
    const session = getSessionCookie(request);
    
    if (!session) {
      // Redirect to login with return URL for better UX
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Apply to all routes except public assets and API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
  
