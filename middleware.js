import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
	// eslint-disable-next-line prefer-arrow-callback
	function middleware(req) {
		const role = req.nextauth.token?.role;
		const pathname = req.nextUrl.pathname;

		const accessRules = [
			{ prefix: '/admin', roles: ['ADMIN'] },
			{ prefix: '/sr-dste-co', roles: ['SR_DSTE_CO'] },
			{ prefix: '/dste', roles: ['DSTE'] },
			{ prefix: '/adste', roles: ['ADSTE'] },
			{ prefix: '/sse-ic', roles: ['SSE_INCHARGE'] },
			{ prefix: '/sse-sectional', roles: ['SSE_SECTIONAL'] },
			{ prefix: '/je-sectional', roles: ['JE_SECTIONAL'] },
			{ prefix: '/technician', roles: ['TECHNICIAN'] },
			{ prefix: '/audit', roles: ['AUDIT_USER'] },
			{ prefix: '/testroom', roles: ['TESTROOM'] },
			{
				prefix: '/field-engineer',
				roles: [
					'FIELD_ENGINEER',
					'JE_SSE_TELE_SECTIONAL',
					'SSE_SECTIONAL',
					'JE_SECTIONAL',
					'SSE_TELE_INCHARGE',
				],
			},
			{ prefix: '/sse-tele-incharge', roles: ['SSE_TELE_INCHARGE'] },
			{ prefix: '/super-admin', roles: ['SUPER_ADMIN'] },
			{ prefix: '/viewer', roles: ['VIEWER'] },
			{
				prefix: '/cable',
				roles: [
					'SUPER_ADMIN',
					'ADMIN',
					'SR_DSTE_CO',
					'SR_DSTE',
					'DSTE',
					'ADSTE',
					'SSE_INCHARGE',
					'SSE_TELE_INCHARGE',
					'SSE_SECTIONAL',
					'JE_SECTIONAL',
					'JE_SSE_TELE_SECTIONAL',
					'FIELD_ENGINEER',
					'TECHNICIAN',
					'TCM',
					'TRC',
					'AUDIT_USER',
					'TESTROOM',
					'VIEWER',
					'SSE_SNT_OFFICE',
					'SSE_TECH',
				],
			},
		];

		const matchedRule = accessRules.find((rule) => pathname.startsWith(rule.prefix));

		if (matchedRule && !matchedRule.roles.includes(role)) {
			return NextResponse.rewrite(new URL('/?message=You Are Not Authorized!', req.url));
		}
	},
	{
		callbacks: {
			authorized: ({ token }) => !!token,
		},
	}
);

export const config = {
	matcher: [
		'/admin/:path*',
		'/sr-dste-co/:path*',
		'/dste/:path*',
		'/adste/:path*',
		'/sse-ic/:path*',
		'/sse-sectional/:path*',
		'/je-sectional/:path*',
		'/technician/:path*',
		'/audit/:path*',
		'/testroom/:path*',
		'/field-engineer/:path*',
		'/sse-tele-incharge/:path*',
		'/super-admin/:path*',
		'/viewer/:path*',
		'/cable/:path*',
	],
};
