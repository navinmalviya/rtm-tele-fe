'use client';

import { Assignment, FolderSpecial, Timer } from '@mui/icons-material';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { useTabs } from '@/hooks/common';
import { useTasks } from '@/hooks/task';
import RtmTabs from '@/lib/common/tabs';
import TaskBoard from '@/lib/common/task-board';

const tabs = [
	{ label: 'Daily Tasks', step: 'daily', icon: <Assignment sx={{ fontSize: 18 }} /> },
	{ label: 'Major Projects', step: 'projects', icon: <FolderSpecial sx={{ fontSize: 18 }} /> },
	{ label: 'Completed', step: 'completed', icon: <Timer sx={{ fontSize: 18 }} /> },
];

export default function ProjectsTasksPage() {
	const { currentTab } = useTabs('fieldProjectsTasks', { currentTab: 'daily' });
	const { data: session } = useSession();
	const { data: allTasks = [], isLoading } = useTasks();

	const myTasks = useMemo(() => {
		const id = session?.user?.id;
		if (!id) return [];
		return allTasks.filter((task) => task.assignedToId === id);
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

	return (
		<Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
			<Box>
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
				<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
					Assigned work items for field execution and closure
				</Typography>
			</Box>

			<RtmTabs tabs={tabs} tabsName="fieldProjectsTasks" initialState={{ currentTab: 'daily' }} />

			<Box sx={{ flex: 1, minHeight: 0 }}>
				<TaskBoard tasks={rows} isLoading={isLoading} />
			</Box>
		</Box>
	);
}
