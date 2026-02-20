export const redirectUser = (session, router) => {
	const { role } = session.user;
	switch (role) {
		case 'ADMIN':
			router.push('/admin/dashboard');
			break;
		case 'SR_DSTE_CO':
			router.push('/sr-dste-co/dashboard');
			break;
		case 'DSTE':
			router.push('/dste/dashboard');
			break;
		case 'ADSTE':
			router.push('/adste/dashboard');
			break;
		case 'SSE_INCHARGE':
			router.push('/sse-ic/dashboard');
			break;
		case 'SSE_SECTIONAL':
			router.push('/sse-sectional/dashboard');
			break;
		case 'JE_SECTIONAL':
			router.push('/je-sectional/dashboard');
			break;
		case 'TECHNICIAN':
			router.push('/technician/dashboard');
			break;
		case 'AUDIT_USER':
			router.push('/audit/dashboard');
			break;
		case 'SUPER_ADMIN':
			router.push('/super-admin/dashboard');
			break;
		case 'TESTROOM':
			router.push('/testroom/dashboard');
			break;
		case 'FIELD_ENGINEER':
			router.push('/field-engineer/dashboard');
			break;
		case 'VIEWER':
			router.push('/viewer/home');
			break;
		default:
			router.push('/employee/home');
	}
};
