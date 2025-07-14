import { NextRequest, NextResponse } from "next/server";
import { clientEnv } from '@/env.client';

// Hoisted constants – computed once at boot, not on every request
const BASE_DOMAIN = clientEnv.NEXT_PUBLIC_APP_URL
  ? new URL(clientEnv.NEXT_PUBLIC_APP_URL).hostname
  : "localhost";

// Paths that should *never* be rewritten on course subdomains – they belong to the root app scope.
const EXCLUDED_PATH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

/**
 * Extract sub-domain (course slug) for potatix.* or *.localhost.
 */
function getSubdomain(hostHeader: string): string | undefined {
  if (!hostHeader) return undefined;

  const host = hostHeader.split(":" )[0] as string; // strip port

  // root domain or www – no slug
  if (host === BASE_DOMAIN || host === `www.${BASE_DOMAIN}`) return undefined;

  if (host.endsWith(`.${BASE_DOMAIN}`)) return host.replace(`.${BASE_DOMAIN}`, "");
  if (host.endsWith(".localhost")) return host.replace(".localhost", "");

  return undefined;
}

/**
 * Map original pathname to its viewer-aware counterpart.
 */
function rewriteViewerPath(pathname: string, courseSlug: string): string {
  // Never rewrite API routes
  if (pathname.startsWith("/api/")) return pathname;

  // Do not rewrite auth-related pages – they live on the root domain
  if (EXCLUDED_PATH_PREFIXES.some((p) => pathname.startsWith(p))) {
    return pathname;
  }

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
  // Determine effective host & protocol accounting for reverse proxies
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = forwardedHost ?? request.headers.get("host") ?? "";
  const courseSlug = getSubdomain(hostHeader);
  
  const originalPath = request.nextUrl.pathname;
  const rewrittenPath = courseSlug
    ? rewriteViewerPath(originalPath, courseSlug)
    : originalPath;

  // If we produced a rewritten viewer path, hand it off to Next.
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
