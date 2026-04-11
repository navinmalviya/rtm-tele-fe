'use client';

import {
	AccountTree,
	Assessment,
	AssignmentTurnedIn,
	BuildCircle,
	Forum,
	Dashboard,
	Hub,
	Inventory,
	// LibraryBooks,
	WorkOutline,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import { SideMenu } from '@/modules/testroom';

export default function Layout({ children }) {
	const menuItems = [
		{ text: 'Dashboard', icon: <Dashboard />, path: '/field-engineer/dashboard' },
		{ text: 'Topology', icon: <Hub />, path: '/field-engineer/topology' },
		{ text: 'Reports', icon: <Assessment />, path: '/field-engineer/reports' },
		{ text: 'Maintenance', icon: <BuildCircle />, path: '/field-engineer/maintenance' },
		{ text: 'Work Execution', icon: <WorkOutline />, path: '/field-engineer/work-execution' },
		{ text: 'Asset Management', icon: <Inventory />, path: '/field-engineer/assets' },
		// { text: 'Equipment Library', icon: <LibraryBooks />, path: '/testroom/equipment-library' },
		{
			text: 'Projects & Tasks',
			icon: <AssignmentTurnedIn />,
			path: '/field-engineer/projects-tasks',
		},
		{ text: 'Chat', icon: <Forum />, path: '/field-engineer/chat' },
		{
			text: 'Sections & Sub-sections',
			icon: <AccountTree />,
			path: '/field-engineer/sections-subsections',
		},
	];

	return (
		<Box
			sx={{
				display: 'flex',
				bgcolor: 'background.default',
				minHeight: '100vh',
				width: '100%',
				overflowX: 'hidden',
			}}
		>
			<SideMenu menuItems={menuItems} />

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					ml: { xs: 0, md: '280px' },
					width: { xs: '100%', md: 'calc(100% - 280px)' },
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'background.default',
					pt: { xs: '64px', md: 0 },
					minWidth: 0,
				}}
			>
				{children}
			</Box>
		</Box>
	);
}
