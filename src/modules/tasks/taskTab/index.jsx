'use client';

import { Refresh } from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useTasks } from '@/hooks/task/useTasks';
import TaskBoard from '@/lib/common/task-board';

const TaskTab = () => {
	const { data: tasks = [], isLoading, refetch, isFetching } = useTasks();

	return (
		<>
			{/* 1. Header & Actions */}
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ mb: 3, px: 1 }}
			>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
						Workload Overview
					</Typography>
					<Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
						{tasks.length} Total tasks currently active in the division
					</Typography>
				</Box>

				<Tooltip title="Refresh Board">
					<IconButton
						onClick={() => refetch()}
						disabled={isFetching}
						sx={{
							bgcolor: 'white',
							border: '1px solid #E2E8F0',
							'&:hover': { bgcolor: '#F8FAFC' },
						}}
					>
						<Refresh
							fontSize="small"
							sx={{
								color: '#64748B',
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

			{/* 2. The Kanban Board Area */}
			<TaskBoard tasks={tasks} isLoading={isLoading} />
		</>
	);
};

export default TaskTab;
