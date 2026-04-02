'use client';

import { Assignment, Construction, PlaylistAddCheck, RocketLaunch } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTabs } from '@/hooks/common';
import { useDeleteProject } from '@/hooks/project';
import RtmTabs from '@/lib/common/tabs';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import {
	AddProjectDrawer,
	DeleteProjectDialog,
	EditProjectDrawer,
	ProjectTable,
} from '@/modules/projects';
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
	const { mutate: deleteProject, isLoading: isDeletingProject } = useDeleteProject();
	const [editingProject, setEditingProject] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);

	// Access the current tab state from Redux (managed by RtmTabs internally)
	const { currentTab, goTo } = useTabs('operationsHub', { currentTab: 'projects' });

	// Configuration for dynamic header action
	const tabActions = {
		projects: {
			label: 'Initiate Project',
			icon: <RocketLaunch />,
			drawer: 'addProjectDrawer',
		},
		tasks: {
			label: 'Create Task',
			icon: <Assignment />,
			drawer: 'addTaskDrawer',
		},
	};

	const currentAction = tabActions[currentTab] || tabActions.projects;

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const params = new URLSearchParams(window.location.search);
		const tab = params.get('tab');
		const action = params.get('action');

		if (tab === 'tasks') {
			goTo('tasks');
		}

		if (action === 'create-task') {
			dispatch(openDrawer({ drawerName: 'addTaskDrawer' }));
			params.delete('action');
			const nextQuery = params.toString();
			window.history.replaceState(
				{},
				'',
				nextQuery ? `${window.location.pathname}?${nextQuery}` : window.location.pathname
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch]);

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
				<EditProjectDrawer project={editingProject} />
				<AddTaskDrawer />
				<DeleteProjectDialog
					open={!!deleteTarget}
					project={deleteTarget}
					isLoading={isDeletingProject}
					onClose={() => setDeleteTarget(null)}
					onConfirm={() => {
						if (!deleteTarget?.id) return;
						deleteProject(deleteTarget.id, {
							onSuccess: () => setDeleteTarget(null),
						});
					}}
				/>

				{/* Conditional Rendering based on Redux/URL state */}
				{currentTab === 'projects' && (
					<ProjectTable
						onEdit={(project) => {
							setEditingProject(project);
							dispatch(openDrawer({ drawerName: 'editProjectDrawer' }));
						}}
						onDelete={(project) => setDeleteTarget(project)}
					/>
				)}
				{currentTab === 'tasks' && <TaskTab />}
			</Box>
		</Box>
	);
};

export default ProjectTasksPage;
