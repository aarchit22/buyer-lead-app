// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // If trying to access a protected route without a token
  if (!token && pathname.startsWith('/buyers')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the token for protected routes
  if (token && pathname.startsWith('/buyers')) {
    try {
      verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch (e) {
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};