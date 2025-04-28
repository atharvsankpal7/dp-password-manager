import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth/jwt";

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/login", "/api/auth/login"];

  // Check if the path is public
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Verify authentication
  const cookie = await request.cookies;
  const token = cookie.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If token verification fails, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Apply middleware to all paths except public ones
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
