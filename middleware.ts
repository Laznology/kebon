import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function  middleware(request: NextRequest) {
    const token = await getToken({ req:request, secret: process.env.NEXTAUTH_SECRET})
    const { pathname } = request.nextUrl

    if (
        pathname === '/' ||
        pathname.startsWith('/docs') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/register')
    )

    if (pathname.startsWith('/dashboard') || pathname.startsWith('/editor')) {
        if (!token){
            const loginUrl = new URL('/login', request.url)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}