'use client';

import { Assignment, FolderSpecial, RocketLaunch, Timer } from '@mui/icons-material';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTabs } from '@/hooks/common';
import { useBulkTaskAction, useTasks } from '@/hooks/task';
import RtmTabs from '@/lib/common/tabs';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { AddProjectDrawer } from '@/modules/projects';
import { AddTaskDrawer } from '@/modules/tasks';
import TaskBoard from '@/lib/common/task-board';

const tabs = [
	{ label: 'Daily Tasks', step: 'daily', icon: <Assignment sx={{ fontSize: 18 }} /> },
	{ label: 'Major Projects', step: 'projects', icon: <FolderSpecial sx={{ fontSize: 18 }} /> },
	{ label: 'Completed', step: 'completed', icon: <Timer sx={{ fontSize: 18 }} /> },
];

export default function ProjectsTasksPage() {
	const dispatch = useDispatch();
	const theme = useTheme();
	const { currentTab } = useTabs('fieldProjectsTasks', { currentTab: 'daily' });
	const { data: session } = useSession();
	const { data: allTasks = [], isLoading } = useTasks();
	const { mutate: runBulkTaskAction, isLoading: isRunningBulkTaskAction } = useBulkTaskAction();
	const [selectionMode, setSelectionMode] = useState(false);
	const [selectedTaskIds, setSelectedTaskIds] = useState([]);

	const myTasks = useMemo(() => {
		const id = session?.user?.id;
		if (!id) return [];
		return allTasks.filter((task) => task.assignedToId === id || task.ownerId === id);
	}, [allTasks, session?.user?.id]);

	const dailyTasks = useMemo(
		() => myTasks.filter((task) => ['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(task.status)),
		[myTasks]
	);
	const projectTasks = useMemo(
		() => myTasks.filter((task) => Boolean(task.projectId) && task.status !== 'CLOSED'),
		[myTasks]
	);
	const completedTasks = useMemo(
		() => myTasks.filter((task) => task.status === 'CLOSED'),
		[myTasks]
	);

	const rows =
		currentTab === 'daily' ? dailyTasks : currentTab === 'projects' ? projectTasks : completedTasks;

	useEffect(() => {
		if (!selectionMode) {
			setSelectedTaskIds([]);
			return;
		}
		const visibleIds = new Set(rows.map((task) => task.id));
		setSelectedTaskIds((prev) => prev.filter((id) => visibleIds.has(id)));
	}, [rows, selectionMode]);

	const toggleTaskSelection = (taskId) => {
		setSelectedTaskIds((prev) =>
			prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
		);
	};

	const handleBulkDelete = () => {
		if (!selectedTaskIds.length) return;
		const confirmed = window.confirm(`Delete ${selectedTaskIds.length} selected task(s)?`);
		if (!confirmed) return;
		runBulkTaskAction(
			{ taskIds: selectedTaskIds, action: 'DELETE' },
			{
				onSuccess: () => {
					setSelectedTaskIds([]);
					setSelectionMode(false);
				},
			},
		);
	};

	const handleBulkPublish = () => {
		if (!selectedTaskIds.length) return;
		runBulkTaskAction(
			{ taskIds: selectedTaskIds, action: 'PUBLISH' },
			{
				onSuccess: () => {
					setSelectedTaskIds([]);
					setSelectionMode(false);
				},
			},
		);
	};

	return (
		<Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: { xs: 'flex-start', md: 'center' },
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2,
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Execution Hub
					</Typography>
					<Chip
						size="small"
						label={`${rows.length} tasks`}
						sx={{ fontWeight: 700 }}
					/>
				</Stack>

				<Stack direction="row" spacing={1.5}>
					<Button
						variant="contained"
						disableElevation
						startIcon={<Assignment />}
						onClick={() => dispatch(openDrawer({ drawerName: 'addTaskDrawer' }))}
						sx={{
							borderRadius: 2.5,
							textTransform: 'none',
							fontWeight: 800,
							px: 3,
							py: 1.2,
							fontSize: '0.85rem',
							boxShadow: `0 4px 12px ${theme.palette.primary.main}33`,
							'&:hover': {
								boxShadow: `0 6px 16px ${theme.palette.primary.main}44`,
							},
						}}
					>
						Create Task
					</Button>
					<Button
						variant="contained"
						disableElevation
						startIcon={<RocketLaunch />}
						onClick={() => dispatch(openDrawer({ drawerName: 'addProjectDrawer' }))}
						sx={{
							borderRadius: 2.5,
							textTransform: 'none',
							fontWeight: 800,
							px: 3,
							py: 1.2,
							fontSize: '0.85rem',
							boxShadow: `0 4px 12px ${theme.palette.primary.main}33`,
							'&:hover': {
								boxShadow: `0 6px 16px ${theme.palette.primary.main}44`,
							},
						}}
					>
						Initiate Project
					</Button>
				</Stack>
			</Box>

			<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
				Assigned work items for field execution and closure
			</Typography>

			<Stack direction="row" spacing={1.5} alignItems="center">
				<Button
					variant={selectionMode ? 'contained' : 'outlined'}
					disableElevation
					onClick={() => {
						if (isRunningBulkTaskAction) return;
						setSelectionMode((prev) => !prev);
					}}
					sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
				>
					{selectionMode ? 'Cancel Selection' : 'Select Tasks'}
				</Button>

				{selectionMode && (
					<>
						<Chip label={`${selectedTaskIds.length} selected`} size="small" sx={{ fontWeight: 700 }} />
						<Button
							variant="contained"
							disableElevation
							onClick={handleBulkPublish}
							disabled={!selectedTaskIds.length || isRunningBulkTaskAction}
							sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
						>
							Publish Selected
						</Button>
						<Button
							variant="outlined"
							color="error"
							onClick={handleBulkDelete}
							disabled={!selectedTaskIds.length || isRunningBulkTaskAction}
							sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
						>
							Delete Selected
						</Button>
					</>
				)}
			</Stack>

			<AddTaskDrawer />
			<AddProjectDrawer />

			<RtmTabs tabs={tabs} tabsName="fieldProjectsTasks" initialState={{ currentTab: 'daily' }} />

			<Box sx={{ flex: 1, minHeight: 0 }}>
				<TaskBoard
					tasks={rows}
					isLoading={isLoading}
					selectionMode={selectionMode}
					selectedTaskIds={selectedTaskIds}
					onToggleSelectTask={toggleTaskSelection}
				/>
			</Box>
		</Box>
	);
}
