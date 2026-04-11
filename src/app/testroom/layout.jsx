'use client';

import {
	AccountTree,
	Assessment,
	AssignmentTurnedIn,
	BuildCircle,
	Forum,
	Dashboard,
	ElectricalServices,
	Hub,
	Inventory,
	LibraryBooks,
	WorkOutline,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import { SideMenu } from '@/modules/testroom';

export default function Layout({ children }) {
	const menuItems = [
		{ text: 'Dashboard', icon: <Dashboard />, path: '/testroom/dashboard' },
		{ text: 'Topology', icon: <Hub />, path: '/testroom/topology' },
		{ text: 'Reports', icon: <Assessment />, path: '/testroom/reports' },
		{ text: 'Maintenance', icon: <BuildCircle />, path: '/testroom/maintenance' },
		{ text: 'Work Execution', icon: <WorkOutline />, path: '/testroom/work-execution' },
		{ text: 'Circuits', icon: <ElectricalServices />, path: '/testroom/circuits' },
		{ text: 'Asset Management', icon: <Inventory />, path: '/testroom/assets' },
		{ text: 'Equipment Library', icon: <LibraryBooks />, path: '/testroom/equipment-library' },
		{ text: 'Projects & Tasks', icon: <AssignmentTurnedIn />, path: '/testroom/projects-tasks' },
		{ text: 'Chat', icon: <Forum />, path: '/testroom/chat' },
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
