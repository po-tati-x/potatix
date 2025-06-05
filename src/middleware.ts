import { NextRequest, NextResponse } from "next/server";

// Import utility functions
import {
  extractSubdomain,
  addCorsHeaders,
  handlePreflight,
  mapPathToViewerPath,
  getBaseDomain,
  logger
} from "@/lib/utils/middleware";

import {
  getSessionToken,
  isPublicPath,
  isProtectedPath,
  isApiRoute
} from "@/lib/auth/middleware-auth";

// Environment validation at build time
const MAIN_APP_URL = (() => {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error('NEXT_PUBLIC_APP_URL env variable is required');
  return url;
})();

// Log startup info
logger.info(`Base domain: ${getBaseDomain()}`);
logger.info(`Main app URL: ${MAIN_APP_URL}`);

/**
 * Handle course subdomain access and rewrites
 */
function handleCourseSubdomain(
  request: NextRequest, 
  pathname: string, 
  courseSlug: string, 
  isAuthenticated: boolean
): NextResponse {
  try {
    // Always let API routes pass through without rewriting
    if (isApiRoute(pathname)) {
      logger.info(`Bypassing API route: ${pathname}`);
      const response = NextResponse.next();
      const origin = request.headers.get('origin');
      return addCorsHeaders(response, origin, MAIN_APP_URL);
    }
    
    const url = request.nextUrl.clone();
    logger.info(`Processing course subdomain: ${courseSlug}, path: ${pathname}`);
    
    // Intercept redirects to /dashboard when on course subdomain
    if (pathname === '/dashboard') {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    
    // Auth handling for course access
    if (!isAuthenticated && !pathname.startsWith(`/viewer/${courseSlug}/auth`)) {
      url.pathname = `/viewer/${courseSlug}/auth`;
      url.searchParams.set('redirectTo', mapPathToViewerPath(pathname, courseSlug));
      logger.info(`Redirecting unauthenticated user to: ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
    
    // URL rewriting for authenticated users
    if (pathname === '/' || pathname === '') {
      url.pathname = `/viewer/${courseSlug}`;
      logger.info(`Rewriting root path to: ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
    
    if (pathname.startsWith('/lesson/')) {
      url.pathname = `/viewer/${courseSlug}/lesson/${pathname.replace('/lesson/', '')}`;
      logger.info(`Rewriting lesson path to: ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
    
    if (pathname.startsWith(`/viewer/${courseSlug}`)) {
      return NextResponse.next();
    }
    
    url.pathname = `/viewer/${courseSlug}${pathname}`;
    logger.info(`Rewriting path to: ${url.pathname}`);
    return NextResponse.rewrite(url);
  } catch (error) {
    logger.error(`Course handling error: ${(error as Error).message}`);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const host = request.headers.get('host') || '';
    const origin = request.headers.get('origin');
    
    logger.info(`Incoming request: ${host}${pathname}`);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handlePreflight(origin, MAIN_APP_URL);
    }
    
    // Skip public routes early (including all API routes)
    if (isPublicPath(pathname)) {
      const response = NextResponse.next();
      
      if (isApiRoute(pathname)) {
        addCorsHeaders(response, origin, MAIN_APP_URL);
      }
      
      return response;
    }
    
    // Authentication check
    const sessionToken = getSessionToken(request);
    const isAuthenticated = Boolean(sessionToken);
    
    // Try to extract course slug from host
    const courseSlug = extractSubdomain(host);
    logger.info(`Extracted subdomain: ${courseSlug || 'none'} from host: ${host}`);
    
    // Course subdomain handling
    if (courseSlug) {
      return handleCourseSubdomain(request, pathname, courseSlug, isAuthenticated);
    }
    
    // Protected route handling on main domain
    if (isProtectedPath(pathname) && !isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Default case
    const response = NextResponse.next();
    return addCorsHeaders(response, origin, MAIN_APP_URL);
  } catch (error) {
    logger.error(`Middleware error: ${(error as Error).message}`);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Configure which paths this middleware will run on - exclude asset paths
export const config = {
  matcher: [
    // Match all paths except NextJS internals and static files
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ],
};
  
