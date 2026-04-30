import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const proxy = auth((request) => {
  const path = request.nextUrl.pathname;
  const isLoginPage = path === '/admin/login';
  const isLoggedIn = Boolean(request.auth?.user);

  if (path.startsWith('/admin') && !isLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
