import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAuthPage = ['/auth/signin', '/auth/register'].includes(req.nextUrl.pathname);

    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/profile', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = ['/auth/signin', '/auth/register'].includes(req.nextUrl.pathname);
        
        // Разрешаем доступ к публичным API маршрутам без авторизации
        const isPublicApiRoute = req.nextUrl.pathname.startsWith('/api') && 
          (req.nextUrl.pathname.includes('/public') || 
           req.nextUrl.pathname.startsWith('/api/properties/public') || 
           req.nextUrl.pathname.startsWith('/api/complexes/public') || 
           req.nextUrl.pathname.startsWith('/api/agents/public'));
        
        return !!token || isAuthPage || isPublicApiRoute;
      },
    },
  }
);

export const config = {
  matcher: [
    '/profile/:path*',
    '/protected/:path*',
    '/api/:path*',
    '/auth/signin',
    '/auth/register',
  ]
}; 