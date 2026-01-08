'use client';

import { Box } from '@mui/material';
import { Navbar } from '@/lib/common/layout';
import { ADMIN_NAV_LINKS } from '@/lib/constants';
import { store } from '../../lib/store';

export default function Layout({ children }) {
	store.subscribe(() => {
		console.log('Store=>', store.getState());
	});
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100vh',
				width: '100%',
			}}
		>
			{/* Navbar Header: Naturally stays left-aligned in the 1400px box */}
			<Box sx={{ px: 2, py: 2, borderBottom: '1px solid #f0f0f0' }}>
				<Navbar navLinks={ADMIN_NAV_LINKS} />
			</Box>

			{/* Content Area: Fills the remaining vertical space */}
			<Box component="main" sx={{ flex: 1, minHeight: 0, width: '100%' }}>
				{children}
			</Box>
		</Box>
	);
}
