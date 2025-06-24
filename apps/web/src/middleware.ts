import { NextRequest, NextResponse } from "next/server";
import { env } from "./env";

/**
 * Extract subdomain from host
 */
function getSubdomain(host: string, baseDomain: string): string | null {
  if (!host) return null;

  const hostWithoutPort = host.split(":")[0]!;

  // Main domain or www
  if (
    hostWithoutPort === baseDomain ||
    hostWithoutPort === `www.${baseDomain}`
  ) {
    return null;
  }

  // Production subdomain
  if (hostWithoutPort.endsWith(`.${baseDomain}`)) {
    return hostWithoutPort.replace(`.${baseDomain}`, "");
  }

  // Local development
  if (hostWithoutPort.endsWith(".localhost")) {
    return hostWithoutPort.replace(".localhost", "");
  }

  return null;
}

/**
 * Get rewritten path for course subdomain
 */
function getRewrittenPath(pathname: string, courseSlug: string): string {
  // Don't rewrite API routes
  if (pathname.startsWith("/api/")) {
    return pathname;
  }

  // Don't double-rewrite viewer paths
  if (pathname.startsWith(`/viewer/${courseSlug}`)) {
    return pathname;
  }

  // Rewrite patterns
  if (pathname === "/") {
    return `/viewer/${courseSlug}`;
  }

  if (pathname.startsWith("/lesson/")) {
    const lessonPath = pathname.replace("/lesson/", "");
    return `/viewer/${courseSlug}/lesson/${lessonPath}`;
  }

  // All other paths
  return `/viewer/${courseSlug}${pathname}`;
}

/**
 * Basic auth middleware for Next.js
 */
function authMiddleware(
  request: NextRequest,
  options?: {
    publicPaths?: string[];
    authRedirectUrl?: string;
  }
) {
  // Default public paths that don't require auth
  const publicPaths = options?.publicPaths || [
    "/",
    "/signin",
    "/login",
    "/signup",
    "/api/auth",
  ];

  // Skip auth check for public paths
  const path = request.nextUrl.pathname;
  if (publicPaths.some((p) => path.startsWith(p) || path === p)) {
    return NextResponse.next();
  }

  // Check for auth cookie - better-auth uses prefixed session_token by default
  // Try both with and without prefix to be safe
  const authCookie = request.cookies.get("better-auth.session_token") || 
                     request.cookies.get("session_token");
  if (!authCookie) {
    // Redirect to auth page if no token
    const url = new URL(options?.authRedirectUrl || "/login", request.url);
    url.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(url);
  }

  // Let the request continue
  return NextResponse.next();
}

/**
 * Main middleware - handles subdomain routing and auth
 */
export default function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const baseDomain = env.NEXT_PUBLIC_APP_URL
    ? new URL(env.NEXT_PUBLIC_APP_URL).hostname
    : "localhost";

  const courseSlug = getSubdomain(host, baseDomain);

  // If course subdomain, handle rewrite and auth
  if (courseSlug) {
    const originalPath = request.nextUrl.pathname;
    const rewrittenPath = getRewrittenPath(originalPath, courseSlug);

    // If path needs rewriting
    if (rewrittenPath !== originalPath) {
      // Create rewritten URL for auth check
      const rewrittenUrl = request.nextUrl.clone();
      rewrittenUrl.pathname = rewrittenPath;

      // Create new request for auth middleware to check
      const rewriteRequest = new NextRequest(rewrittenUrl, {
        method: request.method,
        headers: request.headers,
      });

      // Run auth middleware on rewritten path
      const authResponse = authMiddleware(rewriteRequest);

      // If auth wants to redirect, respect that
      if (authResponse.headers.has("Location")) {
        return authResponse;
      }

      // Otherwise, return the rewrite
      return NextResponse.rewrite(rewrittenUrl);
    }
  }

  // No subdomain or no rewrite needed - just run auth
  return authMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
