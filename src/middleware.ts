import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Debug function to inspect cookie contents
const debugCookies = (request: NextRequest) => {
  const cookieNames = [...request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' }))];
  console.log('All cookies:', cookieNames);
};

// Protect routes that require authentication
export function middleware(request: NextRequest) {
  const session = getSessionCookie(request);
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}
  
