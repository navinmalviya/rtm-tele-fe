export const redirectUser = (session, router) => {
	const { role } = session.user;
	switch (role) {
		case 'ADMIN':
			router.push('/admin/dashboard');
			break;
		case 'EDITOR':
			router.push('/editor/home');
			break;
		case 'VIEWER':
			router.push('/viewer/home');
			break;
		default:
			router.push('/employee/home');
	}
};
