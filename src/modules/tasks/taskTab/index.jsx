'use client';

import { Refresh } from '@mui/icons-material';
import { Box, Button, IconButton, MenuItem, Select, Stack, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useProjects } from '@/hooks/project/useProjects';
import { useTasks } from '@/hooks/task/useTasks';
import { useUsers } from '@/hooks/user/useUsers';
import TaskBoard from '@/lib/common/task-board';

const SELECT_STYLES = {
	bgcolor: 'background.paper',
	height: 36,
	fontSize: '0.75rem',
	fontWeight: 700,
	borderRadius: 2,
	'& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
};

const isFailureDetailsPending = (task) =>
	task.type === 'FAILURE' &&
	(!task.failure || !task.failure.type || !task.failure.cause || !task.failure.failureInTime);

const TaskTab = () => {
	const { data: tasks = [], isLoading, refetch, isFetching } = useTasks();
	const { data: users = [] } = useUsers();
	const { data: projects = [] } = useProjects();

	// 1. Filter States
	const [filters, setFilters] = useState({
		type: 'ALL',
		assigneeId: 'ALL',
		projectId: 'ALL',
		failureDetails: 'ALL',
		todayOnly: false,
	});

	const handleFilterChange = (field) => (event) => {
		setFilters((prev) => ({ ...prev, [field]: event.target.value }));
	};

	// 2. Overlapping Filter Logic
	const filteredTasks = useMemo(() => {
		return tasks.filter((task) => {
			const matchType = filters.type === 'ALL' || task.type === filters.type;
			const matchAssignee =
				filters.assigneeId === 'ALL' || task.assignedToId === filters.assigneeId;
			const matchProject = filters.projectId === 'ALL' || task.projectId === filters.projectId;
			const matchFailureDetails =
				filters.failureDetails === 'ALL' ||
				(filters.failureDetails === 'PENDING' && isFailureDetailsPending(task)) ||
				(filters.failureDetails === 'COMPLETED' &&
					task.type === 'FAILURE' &&
					!isFailureDetailsPending(task));
			let matchToday = true;
			if (filters.todayOnly) {
				const taskDate = task?.createdAt ? new Date(task.createdAt) : null;
				if (!taskDate || Number.isNaN(taskDate.getTime())) {
					matchToday = false;
				} else {
					const now = new Date();
					matchToday =
						taskDate.getFullYear() === now.getFullYear() &&
						taskDate.getMonth() === now.getMonth() &&
						taskDate.getDate() === now.getDate();
				}
			}

			return matchType && matchAssignee && matchProject && matchFailureDetails && matchToday;
		});
	}, [tasks, filters]);

	return (
		<>
			{/* 1. Header & Overlapping Filters */}
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				justifyContent="space-between"
				alignItems={{ xs: 'flex-start', md: 'center' }}
				sx={{ mb: 3, px: 1, gap: 2 }}
			>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>
						Workload Overview
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
						Showing {filteredTasks.length} of {tasks.length} active tasks
					</Typography>
				</Box>

				<Stack direction="row" spacing={1.5} alignItems="center">
					{/* Type Filter */}
					<Select
						value={filters.type}
						onChange={handleFilterChange('type')}
						sx={{ ...SELECT_STYLES, width: 120 }}
						displayEmpty
					>
						<MenuItem value="ALL">All Types</MenuItem>
						<MenuItem value="FAILURE">Failure</MenuItem>
						<MenuItem value="MAINTENANCE">Maintenance</MenuItem>
						<MenuItem value="TRC">TRC Request</MenuItem>
						<MenuItem value="PLANNED">Planned</MenuItem>
					</Select>

					{/* Assignee Filter */}
					<Select
						value={filters.assigneeId}
						onChange={handleFilterChange('assigneeId')}
						sx={{ ...SELECT_STYLES, width: 160 }}
					>
						<MenuItem value="ALL">All Staff</MenuItem>
						{users.map((u) => (
							<MenuItem key={u.id} value={u.id}>
								{u.name}
							</MenuItem>
						))}
					</Select>

					{/* Project Filter */}
					<Select
						value={filters.projectId}
						onChange={handleFilterChange('projectId')}
						sx={{ ...SELECT_STYLES, width: 160 }}
					>
						<MenuItem value="ALL">All Projects</MenuItem>
						<MenuItem value="">Standalone</MenuItem>
						{projects.map((p) => (
							<MenuItem key={p.id} value={p.id}>
								{p.name}
							</MenuItem>
						))}
					</Select>

					<Select
						value={filters.failureDetails}
						onChange={handleFilterChange('failureDetails')}
						sx={{ ...SELECT_STYLES, width: 170 }}
					>
						<MenuItem value="ALL">All Failures</MenuItem>
						<MenuItem value="PENDING">Details Pending</MenuItem>
						<MenuItem value="COMPLETED">Details Added</MenuItem>
					</Select>

					<Button
						variant={filters.todayOnly ? 'contained' : 'outlined'}
						disableElevation
						onClick={() =>
							setFilters((prev) => ({
								...prev,
								todayOnly: !prev.todayOnly,
							}))
						}
						sx={{
							height: 36,
							borderRadius: 2,
							fontSize: '0.75rem',
							fontWeight: 800,
							textTransform: 'none',
							minWidth: 84,
						}}
					>
						Today
					</Button>

					<Tooltip title="Refresh Board">
						<IconButton
							onClick={() => refetch()}
							disabled={isFetching}
							sx={{
								bgcolor: 'background.paper',
								border: '1px solid',
								borderColor: 'divider',
								'&:hover': { bgcolor: 'action.hover' },
							}}
						>
							<Refresh
								fontSize="small"
								sx={{
									color: 'text.secondary',
									animation: isFetching ? 'spin 1s linear infinite' : 'none',
									'@keyframes spin': {
										'0%': { transform: 'rotate(0deg)' },
										'100%': { transform: 'rotate(360deg)' },
									},
								}}
							/>
						</IconButton>
					</Tooltip>
				</Stack>
			</Stack>

			{/* 2. The Kanban Board Area */}
			<TaskBoard tasks={filteredTasks} isLoading={isLoading} />
		</>
	);
};

export default TaskTab;
