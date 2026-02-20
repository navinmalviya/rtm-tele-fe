'use client';

import { Engineering, MyLocation, Schedule } from '@mui/icons-material';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useTasks } from '@/hooks/task';
import StatCard from '@/lib/common/stat-card';
import TaskBoard from '@/lib/common/task-board';

export default function FieldEngineerDashboard() {
	const { data: session } = useSession();

	const { data: allTasks = [], isLoading } = useTasks();

	const myTasks = allTasks.filter((t) => t.assignedToId === session?.user?.id);

	const criticalMyTasks = myTasks.filter((t) => t.priority === 'CRITICAL').length;

	return (
		<Box sx={{ p: 4, bgcolor: 'transparent' }}>
			<Stack spacing={1} sx={{ mb: 4 }}>
				<Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
					My Field View
				</Typography>
				<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
					Hello {session?.user?.name || 'Engineer'}, here is your active agenda.
				</Typography>
			</Stack>

			<Grid container spacing={3} sx={{ width: '100%', ml: 0 }}>
				<Grid item xs={12} md={4}>
					<StatCard
						label="Pending My Action"
						value={myTasks.length.toString()}
						trend={criticalMyTasks > 0 ? `${criticalMyTasks} Urgent` : 'On Track'}
						icon={<Engineering />}
						color={criticalMyTasks > 0 ? 'error.main' : 'primary.main'}
					/>
				</Grid>
				<Grid item xs={12} md={4}>
					<StatCard
						label="Next Inspection"
						value={myTasks[0]?.station?.name || 'None'} // Dynamic station name
						trend={
							myTasks[0]?.dueDate
								? `Due ${new Date(myTasks[0].dueDate).toLocaleTimeString()}`
								: 'No deadline'
						}
						icon={<Schedule />}
						color="warning.main"
					/>
				</Grid>
				<Grid item xs={12} md={4}>
					<StatCard
						label="Personal MTTR"
						value="1h 45m"
						trend="Better than Avg"
						icon={<MyLocation />}
						color="success.main"
					/>
				</Grid>
			</Grid>

			<Box sx={{ mt: 6 }}>
				<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
					<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Active Work Orders
					</Typography>
					<Box sx={{ px: 1.5, py: 0.5, bgcolor: 'action.hover', borderRadius: 2 }}>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'text.secondary' }}>
							{myTasks.length} ASSIGNED
						</Typography>
					</Box>
				</Stack>

				<TaskBoard tasks={myTasks} isLoading={isLoading} />
			</Box>
		</Box>
	);
}
