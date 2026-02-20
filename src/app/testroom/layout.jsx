'use client';

import {
	AccountTree,
	Assessment,
	AssignmentTurnedIn,
	BuildCircle,
	Dashboard,
	Hub,
	Inventory,
	LibraryBooks,
} from '@mui/icons-material';
import { Box } from '@mui/material';
// import { Navbar } from '@/lib/common/layout';
// import { ADMIN_NAV_LINKS } from '@/lib/constants';
import { SideMenu } from '@/modules/testroom';
import { store } from '../../lib/store';
export default function Layout({ children }) {
	store.subscribe(() => {
		console.log('Store=>', store.getState());
	});

	const menuItems = [
		{ text: 'Dashboard', icon: <Dashboard />, path: '/testroom/dashboard' },
		{ text: 'Topology', icon: <Hub />, path: '/testroom/topology' },
		{ text: 'Reports', icon: <Assessment />, path: '/testroom/reports' },
		{ text: 'Maintenance', icon: <BuildCircle />, path: '/testroom/maintenance' },
		{ text: 'Asset Management', icon: <Inventory />, path: '/testroom/assets' },
		{ text: 'Equipment Library', icon: <LibraryBooks />, path: '/testroom/equipment-library' },
		{ text: 'Projects & Tasks', icon: <AssignmentTurnedIn />, path: '/testroom/projects-tasks' },
		{
			text: 'Sections & Sub-sections',
			icon: <AccountTree />,
			path: '/testroom/sections-subsections',
		},
	];

	return (
		<Box
			sx={{
				display: 'flex',
				bgcolor: 'background.default',
				minHeight: '100vh',
				width: '100vw', // Occupy full viewport width
				overflowX: 'hidden',
			}}
		>
			<SideMenu menuItems={menuItems} />

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					// p: 4,
					ml: '280px', // Fixed Sidebar width
					width: `calc(100% - 280px)`, // Dynamic calculation for the rest
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'background.default',
				}}
			>
				{children}
			</Box>
		</Box>
	);
}
