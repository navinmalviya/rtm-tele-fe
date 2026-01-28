'use client';

import { Box } from '@mui/material';
// import { Navbar } from '@/lib/common/layout';
// import { ADMIN_NAV_LINKS } from '@/lib/constants';
import { SideMenu } from '@/modules/testroom';
import { store } from '../../lib/store';
export default function Layout({ children }) {
	store.subscribe(() => {
		console.log('Store=>', store.getState());
	});
	return (
		<Box
			sx={{
				display: 'flex',
				bgcolor: '#F8FAFC', // Light background for main content
				minHeight: '100vh',
				width: '100vw', // Occupy full viewport width
				overflowX: 'hidden',
			}}
		>
			<SideMenu />

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					// p: 4,
					ml: '280px', // Fixed Sidebar width
					width: `calc(100% - 280px)`, // Dynamic calculation for the rest
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{children}
			</Box>
		</Box>
	);
}
