import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
	// eslint-disable-next-line prefer-arrow-callback
	function middleware(req) {
		if (
			req.nextUrl.pathname.startsWith('/admin') &&
			req.nextauth.token?.role !== 'ADMIN' &&
			req.nextauth.token?.role !== 'VIEWER' &&
			req.nextauth.token?.role !== 'EDITOR'
		) {
			return NextResponse.rewrite(
				new URL('/?message=You Are Not Authorized!', req.url)
			);
		}
		if (
			req.nextUrl.pathname.startsWith('/viewer') &&
			req.nextauth.token?.role !== 'VIEWER' &&
			req.nextauth.token?.role !== 'ADMIN' &&
			req.nextauth.token?.role !== 'EDITOR'
		) {
			return NextResponse.rewrite(
				new URL('/?message=You Are Not Authorized!', req.url)
			);
		}
	},
	{
		callbacks: {
			authorized: ({ token }) => !!token,
		},
	}
);

export const config = {
	matcher: ['/admin/:path*', '/employee/:path*'],
};
