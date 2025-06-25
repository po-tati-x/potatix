import { NextRequest, NextResponse } from "next/server";
import { env } from "./env";

// Hoisted constants – computed once at boot, not on every request
const BASE_DOMAIN = env.NEXT_PUBLIC_APP_URL
  ? new URL(env.NEXT_PUBLIC_APP_URL).hostname
  : "localhost";

// Paths that must never trigger auth or rewrites
const PUBLIC_PATHS: readonly string[] = [
  "/",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/manifest.json",
  "/signin",
  "/login",
  "/signup",
  "/api/auth",
];

/**
 * Determines whether the incoming request path is considered public.
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`)
  );
}

/**
 * Check for presence of either Better Auth cookie variant.
 */
function hasAuthCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("session_token")
  );
}

/**
 * Extract sub-domain (course slug) for potatix.* or *.localhost.
 */
function getSubdomain(hostHeader: string): string | null {
  if (!hostHeader) return null;

  const host = hostHeader.split(":" )[0] as string; // strip port

  // root domain or www – no slug
  if (host === BASE_DOMAIN || host === `www.${BASE_DOMAIN}`) return null;

  if (host.endsWith(`.${BASE_DOMAIN}`)) return host.replace(`.${BASE_DOMAIN}`, "");
  if (host.endsWith(".localhost")) return host.replace(".localhost", "");

  return null;
}

/**
 * Map original pathname to its viewer-aware counterpart.
 */
function rewriteViewerPath(pathname: string, courseSlug: string): string {
  // Never rewrite API routes
  if (pathname.startsWith("/api/")) return pathname;

  // Idempotency – already rewritten
  if (pathname.startsWith(`/viewer/${courseSlug}`)) return pathname;

  if (pathname === "/") return `/viewer/${courseSlug}`;

  if (pathname.startsWith("/lesson/")) {
    return pathname.replace("/lesson/", `/viewer/${courseSlug}/lesson/`);
  }

  return `/viewer/${courseSlug}${pathname}`;
}

/**
 * Unified middleware – handles sub-domain rewrites and auth gatekeeping.
 */
export default function middleware(request: NextRequest) {
  const courseSlug = getSubdomain(request.headers.get("host") ?? "");

  const originalPath = request.nextUrl.pathname;
  const rewrittenPath = courseSlug
    ? rewriteViewerPath(originalPath, courseSlug)
    : originalPath;

  // Public paths short-circuit ASAP
  if (isPublicPath(rewrittenPath)) return NextResponse.next();

  // Auth gate – redirect to /login with callback
  if (!hasAuthCookie(request)) {
    const loginURL = new URL("/login", request.url);
    loginURL.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginURL);
  }

  // Perform the actual rewrite if necessary
  if (rewrittenPath !== originalPath) {
    const url = request.nextUrl.clone();
    url.pathname = rewrittenPath;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // keep existing exclusions
  ],
};
