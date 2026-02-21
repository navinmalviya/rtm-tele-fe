'use client';

import { Bolt, Construction, Timeline, WifiTetheringError } from '@mui/icons-material';
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useTasks } from '@/hooks/task';
import StatCard from '@/lib/common/stat-card';
import { openDrawer } from '@/lib/store/slices/drawer-slice';

export default function DashboardPage() {
	const dispatch = useDispatch();
	const theme = useTheme();

	// Fetching tasks which includes failures, inspections, etc.
	const { data: allTasks = [] } = useTasks();
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

const failureTrend = useMemo(() => {
		const now = new Date();
		const start = new Date(now);
		start.setDate(now.getDate() - 6);
		const days = Array.from({ length: 7 }, (_, index) => {
			const date = new Date(start);
			date.setDate(start.getDate() + index);
			const key = date.toISOString().slice(0, 10);
			return {
				key,
				label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
				count: 0,
			};
		});
		const dayMap = new Map(days.map((day) => [day.key, day]));
		failures.forEach((task) => {
			const dateValue = task.createdAt || task.updatedAt;
			if (!dateValue) return;
			const key = new Date(dateValue).toISOString().slice(0, 10);
			const day = dayMap.get(key);
			if (day) day.count += 1;
		});
		return days;
	}, [failures]);

	const durationToHours = (ms) => (Number.isFinite(ms) ? ms / (1000 * 60 * 60) : 0);

	const formatDuration = (ms) => {
		if (!Number.isFinite(ms) || ms <= 0) return 'N/A';
		const totalMinutes = Math.round(ms / (1000 * 60));
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return `${hours}h ${minutes}m`;
	};

	const mttrValues = useMemo(() => {
		return failures
			.map((task) => {
				const start = task.failure?.failureReportedAt || task.createdAt;
				const end = task.failure?.restorationTime;
				if (!start || !end) return null;
				const duration = new Date(end).getTime() - new Date(start).getTime();
				return duration > 0 ? duration : null;
			})
			.filter(Boolean);
	}, [failures]);

	const avgMttrMs = useMemo(() => {
		if (!mttrValues.length) return null;
		return mttrValues.reduce((sum, value) => sum + value, 0) / mttrValues.length;
	}, [mttrValues]);

	const avgMtbfMs = useMemo(() => {
		const points = failures
			.map((task) => task.failure?.failureReportedAt || task.createdAt)
			.filter(Boolean)
			.map((value) => new Date(value).getTime())
			.sort((a, b) => a - b);
		if (points.length < 2) return null;
		const gaps = points.slice(1).map((value, index) => value - points[index]).filter((gap) => gap > 0);
		if (!gaps.length) return null;
		return gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
	}, [failures]);

	const mttrTrend = useMemo(() => {
		const now = new Date();
		const start = new Date(now);
		start.setDate(now.getDate() - 6);
		const days = Array.from({ length: 7 }, (_, index) => {
			const date = new Date(start);
			date.setDate(start.getDate() + index);
			const key = date.toISOString().slice(0, 10);
			return {
				key,
				label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
				values: [],
			};
		});
		const dayMap = new Map(days.map((day) => [day.key, day]));
		failures.forEach((task) => {
			const startDate = task.failure?.failureReportedAt || task.createdAt;
			const endDate = task.failure?.restorationTime;
			if (!startDate || !endDate) return;
			const key = new Date(endDate).toISOString().slice(0, 10);
			const day = dayMap.get(key);
			if (!day) return;
			const duration = new Date(endDate).getTime() - new Date(startDate).getTime();
			if (duration > 0) day.values.push(duration);
		});
		return days.map((day) => ({
			label: day.label,
			value: day.values.length
				? durationToHours(day.values.reduce((sum, value) => sum + value, 0) / day.values.length)
				: 0,
		}));
	}, [failures]);

	const mtbfTrend = useMemo(() => {
		const now = new Date();
		const start = new Date(now);
		start.setDate(now.getDate() - 6);
		const days = Array.from({ length: 7 }, (_, index) => {
			const date = new Date(start);
			date.setDate(start.getDate() + index);
			const key = date.toISOString().slice(0, 10);
			return {
				key,
				label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
				values: [],
			};
		});
		const dayMap = new Map(days.map((day) => [day.key, day]));
		const points = failures
			.map((task) => task.failure?.failureReportedAt || task.createdAt)
			.filter(Boolean)
			.map((value) => new Date(value).getTime())
			.sort((a, b) => a - b);
		points.forEach((value, index) => {
			if (index === 0) return;
			const gap = value - points[index - 1];
			if (gap <= 0) return;
			const key = new Date(value).toISOString().slice(0, 10);
			const day = dayMap.get(key);
			if (!day) return;
			day.values.push(gap);
		});
		return days.map((day) => ({
			label: day.label,
			value: day.values.length
				? durationToHours(day.values.reduce((sum, value) => sum + value, 0) / day.values.length)
				: 0,
		}));
	}, [failures]);

	const priorityChart = useMemo(() => {
		const priorityBuckets = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
		return priorityBuckets.map((priority) => ({
			label: priority,
			value: failures.filter((task) => task.priority === priority).length,
		}));
	}, [failures]);

	const typeChart = useMemo(() => {
		const typeCounts = new Map();
		failures.forEach((task) => {
			const type = task.type || 'UNKNOWN';
			typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
		});
		const sorted = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]);
		const top = sorted.slice(0, 5);
		const rest = sorted.slice(5);
		if (rest.length > 0) {
			top.push(['OTHER', rest.reduce((sum, [, count]) => sum + count, 0)]);
		}
		return top.map(([label, value], index) => ({
			id: index,
			label,
			value,
		}));
	}, [failures]);

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
				<Grid item xs={12} md={3}>
					<StatCard
						label="Active Failures"
						value={activeFailures.length.toString()}
						trend={criticalCount > 0 ? `${criticalCount} Critical` : 'Normal'}
						icon={<WifiTetheringError />}
						color={criticalCount > 0 ? 'error.main' : 'primary.main'}
					/>
				</Grid>

				<Grid item xs={12} md={3}>
					<StatCard
						label="Overdue Maintenance"
						value={overdueMaint.toString()}
						trend="Needs Attention"
						icon={<Construction />}
						color="warning.main"
					/>
				</Grid>

				<Grid item xs={12} md={3}>
					<StatCard
						label="Avg. MTTR"
						value={formatDuration(avgMttrMs)}
						trend="Mean Time to Repair"
						icon={<Bolt />}
						color="success.main"
					/>
				</Grid>
				<Grid item xs={12} md={3}>
					<StatCard
						label="Avg. MTBF"
						value={formatDuration(avgMtbfMs)}
						trend="Mean Time Between Failures"
						icon={<Timeline />}
						color="info.main"
					/>
				</Grid>
			</Grid>

			<Box sx={{ mt: 6 }}>
				<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
					<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Failure Analytics
					</Typography>
					<Box sx={{ px: 1.5, py: 0.5, bgcolor: 'action.hover', borderRadius: 2 }}>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'text.secondary' }}>
							{activeFailures.length} ACTIVE
						</Typography>
					</Box>
				</Stack>

				<Grid
					container
					spacing={3}
					sx={{
						width: '100%',
						ml: 0,
						mt: 0,
						'& > .MuiGrid-item': { pl: 0 },
					}}
				>
					<Grid item xs={12} lg={6}>
						<Paper
							variant="outlined"
							sx={{
								p: 3,
								borderRadius: 3,
								borderColor: 'divider',
								bgcolor: 'background.paper',
								minHeight: 320,
							}}
						>
							<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
								<Timeline sx={{ color: 'primary.main' }} />
								<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
									Failure Trend (Last 7 Days)
								</Typography>
							</Stack>
							<LineChart
								height={240}
								series={[
									{
										data: failureTrend.map((item) => item.count),
										label: 'Failures',
										color: theme.palette.primary.main,
										area: true,
									},
								]}
								xAxis={[
									{
										scaleType: 'point',
										data: failureTrend.map((item) => item.label),
									},
								]}
								grid={{ vertical: false, horizontal: true }}
							/>
						</Paper>
					</Grid>

					<Grid item xs={12} lg={3}>
						<Paper
							variant="outlined"
							sx={{
								p: 3,
								borderRadius: 3,
								borderColor: 'divider',
								bgcolor: 'background.paper',
								minHeight: 320,
							}}
						>
							<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
								<WifiTetheringError sx={{ color: 'error.main' }} />
								<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
									Failures by Priority
								</Typography>
							</Stack>
							<BarChart
								height={240}
								series={[
									{
										data: priorityChart.map((item) => item.value),
										color: theme.palette.warning.main,
									},
								]}
								xAxis={[
									{
										scaleType: 'band',
										data: priorityChart.map((item) => item.label),
									},
								]}
							/>
						</Paper>
					</Grid>

					<Grid item xs={12} lg={3}>
						<Paper
							variant="outlined"
							sx={{
								p: 3,
								borderRadius: 3,
								borderColor: 'divider',
								bgcolor: 'background.paper',
								minHeight: 320,
							}}
						>
							<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
								<Bolt sx={{ color: 'success.main' }} />
								<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
									Failure Types
								</Typography>
							</Stack>
							<PieChart
								height={240}
								series={[
									{
										data: typeChart,
										innerRadius: 48,
										paddingAngle: 2,
										cornerRadius: 4,
									},
								]}
								legend={{ hidden: false }}
							/>
						</Paper>
					</Grid>
				</Grid>

				<Grid
					container
					spacing={3}
					sx={{
						width: '100%',
						ml: 0,
						mt: 3,
						'& > .MuiGrid-item': { pl: 0 },
					}}
				>
					<Grid item xs={12} lg={6}>
						<Paper
							variant="outlined"
							sx={{
								p: 3,
								borderRadius: 3,
								borderColor: 'divider',
								bgcolor: 'background.paper',
								minHeight: 280,
							}}
						>
							<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
								<Bolt sx={{ color: 'success.main' }} />
								<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
									MTTR Trend (Hours)
								</Typography>
							</Stack>
							<LineChart
								height={200}
								series={[
									{
										data: mttrTrend.map((item) => item.value),
										label: 'MTTR',
										color: theme.palette.success.main,
									},
								]}
								xAxis={[
									{
										scaleType: 'point',
										data: mttrTrend.map((item) => item.label),
									},
								]}
								grid={{ vertical: false, horizontal: true }}
							/>
						</Paper>
					</Grid>

					<Grid item xs={12} lg={6}>
						<Paper
							variant="outlined"
							sx={{
								p: 3,
								borderRadius: 3,
								borderColor: 'divider',
								bgcolor: 'background.paper',
								minHeight: 280,
							}}
						>
							<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
								<Timeline sx={{ color: 'info.main' }} />
								<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
									MTBF Trend (Hours)
								</Typography>
							</Stack>
							<LineChart
								height={200}
								series={[
									{
										data: mtbfTrend.map((item) => item.value),
										label: 'MTBF',
										color: theme.palette.info.main,
									},
								]}
								xAxis={[
									{
										scaleType: 'point',
										data: mtbfTrend.map((item) => item.label),
									},
								]}
								grid={{ vertical: false, horizontal: true }}
							/>
						</Paper>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
}
