'use client';

import { Bolt, Construction, WifiTetheringError } from '@mui/icons-material';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useTasks } from '@/hooks/task';
import StatCard from '@/lib/common/stat-card';
import TaskBoard from '@/lib/common/task-board';
import { openDrawer } from '@/lib/store/slices/drawer-slice';

export default function DashboardPage() {
	const dispatch = useDispatch();

	// Fetching tasks which includes failures, inspections, etc.
	const { data: allTasks = [], isLoading: loadingTasks } = useTasks();
	// const { data: schedules = [] } = useMaintenanceSchedules();

	// Logic: Filter for 'FAILURE' types specifically for the Test Room view
	const failures = allTasks.filter((t) => t.type === 'FAILURE');
	const activeFailures = failures.filter((f) => f.status !== 'RESOLVED');

	// Priority logic for the trend labels
	const criticalCount = activeFailures.filter(
		(f) => f.priority === 'CRITICAL' || f.priority === 'HIGH'
	).length;

	// FR-3: Maintenance Compliance logic
	const overdueMaint = [].filter(
		(s) => new Date(s.nextDueDate) < new Date() && s.status === 'PENDING'
	).length;

	return (
		<Box sx={{ bgcolor: 'transparent', p: 4 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
				<Box>
					<Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Overview
					</Typography>
					<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
						Division Telecom Maintenance Status
					</Typography>
				</Box>
				<Button
					variant="contained"
					disableElevation
					onClick={() => dispatch(openDrawer({ drawerName: 'createTicketDrawer' }))}
					sx={{
						borderRadius: 2,
						px: 3,
						py: 1.2,
						fontWeight: 800,
						textTransform: 'none',
						bgcolor: 'primary.main',
						'&:hover': { bgcolor: 'primary.dark' },
					}}
				>
					+ Create Ticket
				</Button>
			</Stack>

			<Grid
				container
				spacing={4}
				sx={{
					width: '100%',
					ml: 0,
					mt: 0,
					'& > .MuiGrid-item': { pl: 0 }, // Fixes left-padding alignment
				}}
			>
				<Grid item xs={12} md={4}>
					<StatCard
						label="Active Failures"
						value={activeFailures.length.toString()}
						trend={criticalCount > 0 ? `${criticalCount} Critical` : 'Normal'}
						icon={<WifiTetheringError />}
						color={criticalCount > 0 ? 'error.main' : 'primary.main'}
					/>
				</Grid>

				<Grid item xs={12} md={4}>
					<StatCard
						label="Overdue Maintenance"
						value={overdueMaint.toString()}
						trend="Needs Attention"
						icon={<Construction />}
						color="warning.main"
					/>
				</Grid>

				<Grid item xs={12} md={4}>
					<StatCard
						label="Avg. MTTR"
						value="2h 15m"
						trend="-5% vs Weekly"
						icon={<Bolt />}
						color="success.main"
					/>
				</Grid>
			</Grid>

			<Box sx={{ mt: 6 }}>
				<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
					<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Active Faults
					</Typography>
					<Box sx={{ px: 1.5, py: 0.5, bgcolor: 'action.hover', borderRadius: 2 }}>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'text.secondary' }}>
							{activeFailures.length} ACTIVE
						</Typography>
					</Box>
				</Stack>

				{/* Passing the filtered failures to the task board */}
				<TaskBoard tasks={activeFailures} isLoading={loadingTasks} />
			</Box>
		</Box>
	);
}
