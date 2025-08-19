import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const apiUrl = new URL('/api/auth/signout', request.url).toString();

  await fetch(apiUrl, {
    method: 'POST',
    headers: {
      cookie: request.headers.get('cookie') ?? ''
    },
    cache: 'no-store'
  });

  return NextResponse.redirect(new URL('/login', request.url));
}