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
				position: 'relative',
				width: '100vw',
				height: '100vh',
				overflow: 'hidden',
				bgcolor: '#fff', // This ensures the base is clean
			}}
		>
			{/* LAYER 1: The Topology Canvas (Background) */}
			{/* We use a plain Box instead of Container to allow 100% width */}
			<Box
				sx={{
					position: 'absolute',
					inset: 0,
					zIndex: 1,
					'& .react-flow__pane': { cursor: 'grab' }, // UI Polish
				}}
			>
				{children}
			</Box>

			{/* LAYER 2: Floating UI Overlay (Foreground) */}
			<Box
				sx={{
					position: 'absolute',
					inset: 0,
					zIndex: 10,
					pointerEvents: 'none', // Allows clicking the canvas behind
					display: 'flex',
					justifyContent: 'center', // Centers the 1350px zone
				}}
			>
				<Box
					sx={{
						width: '100%',
						maxWidth: '1350px', // Your Navbar stays within this
						px: 3, // Side padding so it doesn't touch the screen edge
						mt: 4,
						pointerEvents: 'none',
					}}
				>
					<Box sx={{ pointerEvents: 'auto', width: 'fit-content' }}>
						<Navbar navLinks={ADMIN_NAV_LINKS} />
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
