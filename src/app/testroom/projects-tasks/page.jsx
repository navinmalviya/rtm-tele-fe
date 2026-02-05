'use client';

import { Assignment, Construction, PlaylistAddCheck, RocketLaunch } from '@mui/icons-material';
import { Box, Button, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { AddProjectDrawer, ProjectTable } from '@/modules/projects';

// Sub-components (Assuming these locations based on your pattern)

// import { AddTaskForm, TaskTable } from '../tasks';

export default function ProjectTasksPage() {
	const dispatch = useDispatch();
	const [tabValue, setTabValue] = useState(0);

	const THEME_COLOR = '#3B82F6'; // Ratlam Blue

	const tabActions = {
		0: {
			label: 'Initiate Project',
			icon: <RocketLaunch />,
			drawer: 'addProjectDrawer',
		},
		1: {
			label: 'Create New Task',
			icon: <Assignment />,
			drawer: 'addTaskDrawer',
		},
	};

	const currentAction = tabActions[tabValue];

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				width: '100%',
				bgcolor: '#F8FAFC',
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
					bgcolor: 'white',
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box
						sx={{
							p: 1,
							bgcolor: '#F1F5F9',
							borderRadius: 2,
							display: 'flex',
						}}
					>
						<Construction sx={{ color: '#64748B' }} />
					</Box>
					<Box>
						<Typography
							variant="h5"
							sx={{
								fontWeight: 900,
								color: '#0F172A',
								letterSpacing: '-0.02em',
							}}
						>
							Operations & Projects
						</Typography>
						<Typography
							variant="caption"
							sx={{
								color: '#64748B',
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
					onClick={() => dispatch(openDrawer({ drawerName: currentAction.drawer }))}
					sx={{
						bgcolor: THEME_COLOR,
						borderRadius: 2.5,
						textTransform: 'none',
						fontWeight: 800,
						px: 3,
						py: 1.2,
						fontSize: '0.85rem',
						boxShadow: `0 4px 12px ${THEME_COLOR}33`,
						'&:hover': {
							bgcolor: THEME_COLOR,
							filter: 'brightness(0.9)',
							boxShadow: `0 6px 16px ${THEME_COLOR}44`,
						},
					}}
				>
					{currentAction.label}
				</Button>
			</Box>

			{/* 2. Navigation Tabs */}
			<Box sx={{ px: 3, bgcolor: 'white' }}>
				<Tabs
					value={tabValue}
					onChange={(_, val) => setTabValue(val)}
					sx={{
						minHeight: 48,
						'& .MuiTabs-indicator': {
							height: 3,
							borderRadius: '3px 3px 0 0',
							bgcolor: THEME_COLOR,
						},
						'& .MuiTab-root': {
							fontWeight: 700,
							fontSize: '0.8rem',
							minWidth: 160,
							textTransform: 'uppercase',
							color: '#94A3B8',
							transition: 'color 0.2s ease',
							'&.Mui-selected': {
								color: THEME_COLOR,
							},
						},
					}}
				>
					<Tab
						icon={<PlaylistAddCheck sx={{ fontSize: 18 }} />}
						iconPosition="start"
						label="Active Projects"
					/>
					<Tab
						icon={<Assignment sx={{ fontSize: 18 }} />}
						iconPosition="start"
						label="All Operational Tasks"
					/>
				</Tabs>
				<Divider sx={{ borderColor: '#F1F5F9' }} />
			</Box>

			{/* 3. Content Area */}
			<Box
				sx={{
					flex: 1,
					minHeight: 0,
					overflowY: 'auto',
					p: 3,
				}}
			>
				{/* Modals/Drawers */}
				<AddProjectDrawer />
				{/* <AddTaskForm /> */}

				<Box
					sx={{
						bgcolor: 'white',
						borderRadius: 3,
						border: '1px solid #E2E8F0',
						overflow: 'hidden',
					}}
				>
					{tabValue === 0 && <ProjectTable />}
					{/* {tabValue === 1 && <TaskTable />} */}
					{tabValue === 1 && <div>tasks</div>}
				</Box>
			</Box>
		</Box>
	);
}
