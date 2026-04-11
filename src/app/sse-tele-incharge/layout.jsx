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
	WorkOutline,
} from '@mui/icons-material';
import { Box } from '@mui/material';
import { SideMenu } from '@/modules/testroom';

export default function Layout({ children }) {
	const menuItems = [
		{ text: 'Dashboard', icon: <Dashboard />, path: '/sse-tele-incharge/dashboard' },
		{ text: 'Topology', icon: <Hub />, path: '/sse-tele-incharge/topology' },
		{ text: 'Reports', icon: <Assessment />, path: '/sse-tele-incharge/reports' },
		{ text: 'Maintenance', icon: <BuildCircle />, path: '/sse-tele-incharge/maintenance' },
		{ text: 'Work Execution', icon: <WorkOutline />, path: '/sse-tele-incharge/work-execution' },
		{ text: 'Asset Management', icon: <Inventory />, path: '/sse-tele-incharge/assets' },
		{
			text: 'Projects & Tasks',
			icon: <AssignmentTurnedIn />,
			path: '/sse-tele-incharge/projects-tasks',
		},
		{ text: 'Chat', icon: <Forum />, path: '/sse-tele-incharge/chat' },
		{
			text: 'Sections & Sub-sections',
			icon: <AccountTree />,
			path: '/sse-tele-incharge/sections-subsections',
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
