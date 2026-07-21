import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect the dashboard routes
  if (!pathname.startsWith('/admin/dashboard')) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
