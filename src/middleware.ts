import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Debug function to inspect cookie contents
const debugCookies = (request: NextRequest) => {
  const cookieNames = [...request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' }))];
  console.log('All cookies:', cookieNames);
};

// Protect routes that require authentication
export function middleware(request: NextRequest) {
  // Define protected routes that require authentication
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/settings') ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/courses');
  
  if (isProtectedRoute) {
    console.log(`Checking auth for protected route: ${request.nextUrl.pathname}`);
    debugCookies(request);
    
    // Get the cookie name from env or use default
    const cookieName = process.env.BETTER_AUTH_COOKIE_NAME || 'ba:session';
    
    // Check for session cookie with the same name as in auth.ts
    const sessionCookie = getSessionCookie(request, {
      cookieName: cookieName,
    });
    
    console.log(`Using cookie name: ${cookieName}, cookie exists: ${!!sessionCookie}`);
    
    if (!sessionCookie) {
      // Redirect to login if no session found
      console.log('No valid session found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    console.log('Valid session found, allowing access to', request.nextUrl.pathname);
  }
  
  return NextResponse.next();
}

export const config = {
  // Define which routes the middleware applies to
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/courses/:path*',
  ]
};