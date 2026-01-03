export const getNavbarTitle = (pathname) => {
	switch (pathname) {
		case '/admin/topology':
			return 'Topology'; // Use 'return' to send the value back
		case '/admin/dashboard':
			return 'Dashboard';
		default:
			return 'Home'; // Fallback value
	}
};
