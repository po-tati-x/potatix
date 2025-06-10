import { NextResponse } from 'next/server';

type LogParams = 
  | string
  | number
  | boolean
  | null
  | undefined
  | Error
  | Record<string, unknown>
  | readonly LogParams[];

/**
 * Simple logger with kill switch
 */
const SHOW_LOGS = false;

export const logger = {
  info: (message: string, ...args: LogParams[]): void => {
    if (SHOW_LOGS) {
      console.log(`[Middleware] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: LogParams[]): void => {
    // Always log errors
    console.error(`[Middleware Error] ${message}`, ...args);
  }
};

/**
 * Get base domain from env, with validation
 */
export function getBaseDomain(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!appUrl) {
    logger.error('Missing NEXT_PUBLIC_APP_URL environment variable');
    return 'localhost'; // Safe fallback
  }
  
  try {
    const url = new URL(appUrl);
    return url.hostname;
  } catch (e) {
    logger.error(`Invalid NEXT_PUBLIC_APP_URL: ${appUrl}`, e as Error);
    // Attempt to extract domain without protocol
    if (appUrl.includes('.')) {
      const parts = appUrl.split('.');
      if (parts.length >= 2) {
        // Return last 2 parts if there are multiple
        return parts.slice(-2).join('.');
      }
    }
    return 'localhost'; // Ultimate fallback
  }
}

// Main domain resolved once
const BASE_DOMAIN = getBaseDomain();
logger.info(`Base domain resolved as: ${BASE_DOMAIN}`);

/**
 * Extract course slug from host header
 */
export function extractSubdomain(host: string): string | null {
  if (!host) return null;
  
  // Remove port if present
  const hostWithoutPort = host.split(':')[0];
  
  // Main domain checks
  if (hostWithoutPort === BASE_DOMAIN || hostWithoutPort === `www.${BASE_DOMAIN}`) {
    return null;
  }
  
  // Normal subdomain format: something.domain.com
  if (hostWithoutPort.endsWith(`.${BASE_DOMAIN}`)) {
    return hostWithoutPort.split('.')[0];
  }
  
  // Local development with .localhost TLD
  if (hostWithoutPort.includes('.localhost')) {
    return hostWithoutPort.split('.')[0];
  }
  
  return null;
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: NextResponse, 
  origin: string | null, 
  mainAppUrl: string
): NextResponse {
  if (!response) {
    logger.error('Attempted to add CORS headers to null response');
    return new NextResponse(null, { status: 500 });
  }
  
  try {
    response.headers.set('Access-Control-Allow-Origin', origin || mainAppUrl);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  } catch (e) {
    logger.error('Failed to set CORS headers', e as Error);
  }
  
  return response;
}

/**
 * Handle CORS preflight requests
 */
export function handlePreflight(origin: string | null, mainAppUrl: string): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  
  addCorsHeaders(response, origin, mainAppUrl);
  
  try {
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  } catch (e) {
    logger.error('Failed to set preflight headers', e as Error);
  }
  
  return response;
}

/**
 * Maps a path to its corresponding viewer path for course subdomains
 */
export function mapPathToViewerPath(pathname: string, courseSlug: string): string {
  if (!pathname) return `/viewer/${courseSlug}`;
  
  if (pathname === '/' || pathname === '') {
    return `/viewer/${courseSlug}`;
  }
  
  if (pathname.startsWith('/lesson/')) {
    return `/viewer/${courseSlug}/lesson/${pathname.replace('/lesson/', '')}`;
  }
  
  if (pathname.startsWith('/viewer/')) {
    return pathname;
  }
  
  return `/viewer/${courseSlug}${pathname}`;
} 