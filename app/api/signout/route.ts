import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(
    new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"),
  );

  // Clear common next-auth cookies (names may vary depending on config)
  res.cookies.set("next-auth.session-token", "", { path: "/", maxAge: 0 });
  res.cookies.set("__Secure-next-auth.session-token", "", {
    path: "/",
    maxAge: 0,
  });
  res.cookies.set("next-auth.csrf-token", "", { path: "/", maxAge: 0 });

  return res;
}
