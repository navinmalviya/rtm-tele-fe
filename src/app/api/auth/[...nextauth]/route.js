import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const nextAuthSecret =
	process.env.NEXTAUTH_SECRET ||
	process.env.AUTH_SECRET ||
	process.env.API_SECRET ||
	'rtm-tele-fallback-secret-change-me';

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
	console.warn(
		'NEXTAUTH_SECRET is missing; using fallback secret. Set NEXTAUTH_SECRET in container env.'
	);
}

export const authOptions = {
	secret: nextAuthSecret,
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'username' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				const candidates = [
					process.env.BASE_URL,
					process.env.INTERNAL_BASE_URL,
					process.env.NEXT_PUBLIC_BASE_URL,
					'http://backend:3001',
					'http://rtm_tele_be:3001',
				].filter(Boolean);

				if (!candidates.length) {
					console.error('Missing auth backend URL. Set BASE_URL or INTERNAL_BASE_URL.');
					return null;
				}

				for (const backendUrl of candidates) {
					try {
						const { data } = await axios.post(`${backendUrl}/auth/login`, credentials, {
							timeout: 10000,
						});
						if (data?.user) {
							return {
								id: data.user.id,
								username: data.user.username,
								name: data.user.fullName || data.user.name || '',
								designation: data.user.designation || null,
								unit: data.user.unit || null,
								role: data.user.role,
								accessToken: data.accessToken,
								divisionId: data.user.divisionId,
								divisionCode: data.user.divisionCode,
								divisionName: data.user.divisionName,
							};
						}
					} catch (error) {
						const status = error?.response?.status;
						if (status === 401) return null;
						console.error(
							`Auth authorize failed via ${backendUrl}:`,
							status || 'NO_RESPONSE',
							error?.message
						);
					}
				}

				return null;
			},
		}),
	],

	session: {
		strategy: 'jwt',
	},

	callbacks: {
		async jwt({ token, user }) {
			return { ...token, ...user };
		},

		async session({ session, token }) {
			session.user = token;
			return session;
		},
	},

	pages: {
		signIn: '/',
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
