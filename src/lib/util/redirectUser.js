export const redirectUser = (session, router) => {
	const { role } = session.user;
	switch (role) {
		case 'SUPER_ADMIN':
			router.push('/super-admin/dashboard');
			break;
		case 'TESTROOM':
			router.push('/testroom/dashboard');
			break;
		case 'VIEWER':
			router.push('/viewer/home');
			break;
		default:
			router.push('/employee/home');
	}
};
