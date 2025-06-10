import { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

/**
 * Get session token from request with error handling
 */
export function getSessionToken(request: NextRequest): string | null {
  try {
    return getSessionCookie(request);
  } catch (error) {
    console.error('Session extraction failed:', error);
    return null;
  }
}

// Regex patterns for path-based authentication checks
export const PROTECTED_PATTERNS = [
  /^\/dashboard(\/.*)?$/,
  /^\/profile(\/.*)?$/,
  /^\/settings(\/.*)?$/,
  /^\/courses(\/.*)?$/
];

// Route categories for middleware processing
export const ROUTE_PATTERNS = {
  // Routes that bypass auth check completely
  PUBLIC: [
    '/login',
    '/signup',
    '/api/auth',
    '/api/courses/slug', // Course data by slug (public)
    '/_next',
    '/static',
    '/favicon.ico'
  ],
  
  // API routes that should always bypass subdomain rewriting
  API: ['/api/'],
  
  // Static assets that should always bypass all middleware processing
  ASSETS: [
    '/_next/static',
    '/_next/image',
    '/favicon.ico'
  ]
};

/**
 * Check if a path matches any protected pattern
 */
export function isProtectedPath(path: string): boolean {
  return PROTECTED_PATTERNS.some(pattern => pattern.test(path));
}

/**
 * Check if a path should bypass auth checks
 */
export function isPublicPath(path: string): boolean {
  return ROUTE_PATTERNS.PUBLIC.some(route => path.startsWith(route));
}

/**
 * Check if a path is an API route
 */
export function isApiRoute(path: string): boolean {
  return ROUTE_PATTERNS.API.some(route => path.startsWith(route));
}

/**
 * Check if path is a static asset
 */
export function isAssetPath(path: string): boolean {
  return ROUTE_PATTERNS.ASSETS.some(route => path.startsWith(route));
} 