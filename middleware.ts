// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  console.log('MIDDLEWARE FIRED!', request.nextUrl.pathname);
  
  const token = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  console.log(`Middleware: ${pathname}, Token: ${token ? 'exists' : 'none'}`);

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If trying to access a protected route without a token
  if (!token && !isPublicRoute) {
    console.log(`Redirecting to login from: ${pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the token for protected routes
  if (token && !isPublicRoute) {
    try {
      verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch (e) {
      // If token is invalid, redirect to login
      console.log(`Invalid token, redirecting to login from: ${pathname}`);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // If user hits root and is authenticated, send them to buyers list for convenience
  if (pathname === '/' && token) {
    try {
      verify(token, process.env.JWT_SECRET!);
      return NextResponse.redirect(new URL('/buyers', request.url));
    } catch {}
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};