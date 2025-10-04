import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;

  if (
    pathname === "/" ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup")
  ) {
    if (token && pathname.startsWith("/signin")) {
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }
  return NextResponse.next();
}
