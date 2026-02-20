'use client';

import { Assignment, Construction, PlaylistAddCheck, RocketLaunch } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { useTabs } from '@/hooks/common';
import RtmTabs from '@/lib/common/tabs';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { AddProjectDrawer, ProjectTable } from '@/modules/projects';
import { AddTaskDrawer, TaskTab } from '@/modules/tasks';

const PROJECT_TABS = [
	{
		label: 'Active Projects',
		step: 'projects',
		icon: <PlaylistAddCheck sx={{ fontSize: 18 }} />,
	},
	{
		label: 'All Operational Tasks',
		step: 'tasks',
		icon: <Assignment sx={{ fontSize: 18 }} />,
	},
];

const ProjectTasksPage = () => {
	const dispatch = useDispatch();
	const theme = useTheme();

	// Access the current tab state from Redux (managed by RtmTabs internally)
	const { currentTab } = useTabs('operationsHub', { currentTab: 'projects' });

	// Configuration for dynamic header action
	const tabActions = {
		projects: {
			label: 'Initiate Project',
			icon: <RocketLaunch />,
			drawer: 'addProjectDrawer',
		},
		tasks: {
			label: 'Dispatch Work',
			icon: <Assignment />,
			drawer: 'addTaskDrawer',
		},
	};

	const currentAction = tabActions[currentTab] || tabActions.projects;

	const handleActionClick = () => {
		dispatch(openDrawer({ drawerName: currentAction.drawer }));
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				width: '100%',
				bgcolor: 'background.default',
			}}
		>
			{/* 1. Header Section */}
			<Box
				sx={{
					px: 3,
					pt: 3,
					pb: 2,
					display: 'flex',
					justifyContent: 'space-between',
					bgcolor: 'background.paper',
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box
						sx={{
							p: 1,
							bgcolor: 'action.hover',
							borderRadius: 2,
							display: 'flex',
						}}
					>
						<Construction sx={{ color: 'text.secondary' }} />
					</Box>
					<Box>
						<Typography
							variant="h5"
							sx={{
								fontWeight: 900,
								color: 'text.primary',
								letterSpacing: '-0.02em',
							}}
						>
							Operations & Projects
						</Typography>
						<Typography
							variant="caption"
							sx={{
								color: 'text.secondary',
								fontWeight: 700,
								textTransform: 'uppercase',
								letterSpacing: '1px',
							}}
						>
							Ratlam Division • Work Management
						</Typography>
					</Box>
				</Stack>

				<Button
					variant="contained"
					disableElevation
					startIcon={currentAction.icon}
					onClick={handleActionClick}
					sx={{
						bgcolor: 'primary.main',
						borderRadius: 2.5,
						textTransform: 'none',
						fontWeight: 800,
						px: 3,
						py: 1.2,
						fontSize: '0.85rem',
						boxShadow: `0 4px 12px ${theme.palette.primary.main}33`,
						'&:hover': {
							bgcolor: 'primary.main',
							filter: 'brightness(0.9)',
							boxShadow: `0 6px 16px ${theme.palette.primary.main}44`,
						},
					}}
				>
					{currentAction.label}
				</Button>
			</Box>

			{/* 2. URL-Synced Navigation Tabs */}
			<Box sx={{ px: 3, bgcolor: 'background.paper' }}>
				<RtmTabs
					tabs={PROJECT_TABS}
					tabsName="operationsHub"
					initialState={{ currentTab: 'projects' }}
				/>
			</Box>

			{/* 3. Content Area */}
			<Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
				{/* Global Drawers */}
				<AddProjectDrawer />
				<AddTaskDrawer />

				{/* Conditional Rendering based on Redux/URL state */}
				{currentTab === 'projects' && <ProjectTable />}
				{currentTab === 'tasks' && <TaskTab />}
			</Box>
		</Box>
	);
};

export default ProjectTasksPage;
