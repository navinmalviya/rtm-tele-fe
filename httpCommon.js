'use client';

import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const instance = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}`,
	headers: {
		'Content-type': 'application/json',
	},
});

instance.interceptors.request.use(async (config) => {
	const session = await getSession();
	const token = session?.user.accessToken;
	// const email = session?.user.email;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
		// config.headers['X-USER-TOKEN'] = token;
		// config.headers['X-USER-EMAIL'] = email;
	}
	return config;
});

instance.interceptors.response.use(
	(response) => response,
	(error) => {
		// Check if the error response has a status code of 401 (session expired)
		if (error.response && error.response.status === 401) {
			signOut();
		}
		return Promise.reject(error);
	}
);

export default instance;
