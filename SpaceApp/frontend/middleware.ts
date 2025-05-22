import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that should be accessible without authentication
const publicPaths = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isRootPath = request.nextUrl.pathname === '/';

  // Allow API routes to pass through
  if (isApiRoute) {
     NextResponse.next();
  }

  // Redirect root path to 404
  if (isRootPath) {
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  // Redirect to login if accessing protected route without token
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing auth pages with token
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/satellites', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 