import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'username' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					const backendUrl = process.env.BASE_URL;
					if (!backendUrl) {
						console.error('Missing BASE_URL for auth backend');
						return null;
					}
					const { data } = await axios.post(`${backendUrl}/auth/login`, credentials);
					if (data?.user) {
						return {
							id: data.user.id,
							username: data.user.username,
							name: data.user.fullName,
							designation: data.user.designation || null,
							unit: data.user.unit || null,
							role: data.user.role,
							accessToken: data.accessToken, // This remains at the top level
							// Fix: Access these from data.user
							divisionId: data.user.divisionId,
							divisionCode: data.user.divisionCode,
							divisionName: data.user.divisionName,
						};
					}
					return null;
				} catch (error) {
					const status = error?.response?.status;
					console.error('Auth authorize failed:', status || 'NO_RESPONSE', error?.message);
					if (status === 401) return null;
					return null;
				}
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
