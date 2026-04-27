import { NextResponse } from 'next/server';

const ADMIN_EMAILS = new Set([
  'diba.makki@theflybottle.org',
  'shadi.seyedi@theflybottle.org',
  'pouya@theflybottle.org',
]);

function isValidAdminToken(token) {
  if (!token?.startsWith('static-admin:')) return false;

  const email = token.slice('static-admin:'.length);
  return ADMIN_EMAILS.has(email);
}

export async function proxy(request) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/admin/login' || path === '/admin/register';
  
  if (path.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    const hasValidToken = isValidAdminToken(token);
    
    if (!hasValidToken && !isPublicPath) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
    
    if (hasValidToken && isPublicPath) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    if (token && !hasValidToken) {
      const response = NextResponse.next();
      response.cookies.delete('admin_token');
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
