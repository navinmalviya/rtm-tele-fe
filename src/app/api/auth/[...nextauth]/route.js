import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'username' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					const { data } = await axios.post(
						`${process.env.BASE_URL}/auth/login`,
						credentials
					);
					console.log('userdata', data);
					if (data?.user) {
						return {
							id: data.user.id,
							username: data.user.username,
							name: data.user.fullName,
							role: data.user.role,
							accessToken: data.accessToken,
						};
					}
					return null;
				} catch ({ response }) {
					if (response.status === 401)
						throw new Error('unauthorized');
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
