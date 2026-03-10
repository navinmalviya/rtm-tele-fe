'use client';

import { Bolt, Construction, Timeline, WifiTetheringError } from '@mui/icons-material';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart, PieChart } from '@mui/x-charts';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTasks } from '@/hooks/task';
import { useStations } from '@/hooks/stations';
import { useSubsections } from '@/hooks/sub-sections';
import StatCard from '@/lib/common/stat-card';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

export default function DashboardPage() {
	const dispatch = useDispatch();
	const theme = useTheme();
	const [drilldown, setDrilldown] = useState({ open: false, title: '', items: [] });
	const [dateRange, setDateRange] = useState({
		start: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().slice(0, 10),
		end: new Date().toISOString().slice(0, 10),
	});

	// Fetching tasks which includes failures, inspections, etc.
	const { data: allTasks = [] } = useTasks();
	const { data: stations = [] } = useStations();
	const { data: subsections = [] } = useSubsections();
	// const { data: schedules = [] } = useMaintenanceSchedules();

	// Logic: Filter for 'FAILURE' types specifically for the Test Room view
	const failures = allTasks.filter((t) => t.type === 'FAILURE');
	const filteredFailures = useMemo(() => {
		const start = dateRange.start ? new Date(dateRange.start) : null;
		const end = dateRange.end ? new Date(dateRange.end) : null;
		return failures.filter((task) => {
			const dateValue = task.createdAt || task.updatedAt;
			if (!dateValue) return false;
			const dt = new Date(dateValue);
			if (start && dt < start) return false;
			if (end) {
				const endOfDay = new Date(end);
				endOfDay.setHours(23, 59, 59, 999);
				if (dt > endOfDay) return false;
			}
			return true;
		});
	}, [failures, dateRange]);
	const activeFailures = filteredFailures.filter((f) => f.status !== 'RESOLVED');

	// Priority logic for the trend labels
	const criticalCount = activeFailures.filter(
		(f) => f.priority === 'CRITICAL' || f.priority === 'HIGH'
	).length;

	// FR-3: Maintenance Compliance logic
	const overdueMaint = [].filter(
		(s) => new Date(s.nextDueDate) < new Date() && s.status === 'PENDING'
	).length;

	const formatDuration = (ms) => {
		if (!Number.isFinite(ms) || ms <= 0) return 'N/A';
		const totalMinutes = Math.round(ms / (1000 * 60));
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return `${hours}h ${minutes}m`;
	};

	const mttrValues = useMemo(() => {
		return filteredFailures
			.map((task) => {
				const start = task.failure?.failureReportedAt || task.createdAt;
				const end = task.failure?.restorationTime;
				if (!start || !end) return null;
				const duration = new Date(end).getTime() - new Date(start).getTime();
				return duration > 0 ? duration : null;
			})
			.filter(Boolean);
	}, [filteredFailures]);

	const avgMttrMs = useMemo(() => {
		if (!mttrValues.length) return null;
		return mttrValues.reduce((sum, value) => sum + value, 0) / mttrValues.length;
	}, [mttrValues]);

	const avgMtbfMs = useMemo(() => {
		const points = filteredFailures
			.map((task) => task.failure?.failureReportedAt || task.createdAt)
			.filter(Boolean)
			.map((value) => new Date(value).getTime())
			.sort((a, b) => a - b);
		if (points.length < 2) return null;
		const gaps = points.slice(1).map((value, index) => value - points[index]).filter((gap) => gap > 0);
		if (!gaps.length) return null;
		return gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
	}, [filteredFailures]);


	const stationChart = useMemo(() => {
		const stationMap = new Map();
		stations.forEach((station) => {
			stationMap.set(station.id, station.data?.label || station.name);
		});

		const counts = new Map();
		filteredFailures.forEach((task) => {
			const stationId = task.failure?.stationId || task.failure?.location?.stationId;
			if (!stationId) return;
			const key = stationMap.get(stationId) || 'Unknown';
			if (!counts.has(key)) counts.set(key, []);
			counts.get(key).push(task);
		});

		return Array.from(counts.entries()).map(([label, items]) => ({
			label,
			value: items.length,
			items,
		}));
	}, [filteredFailures, stations]);

	const subsectionChart = useMemo(() => {
		const subsectionMap = new Map();
		subsections.forEach((sub) => {
			subsectionMap.set(sub.id, sub.name || sub.code);
		});

		const counts = new Map();
		filteredFailures.forEach((task) => {
			const subsectionId = task.failure?.subsectionId;
			if (!subsectionId) return;
			const key = subsectionMap.get(subsectionId) || 'Unknown';
			if (!counts.has(key)) counts.set(key, []);
			counts.get(key).push(task);
		});

		return Array.from(counts.entries()).map(([label, items]) => ({
			label,
			value: items.length,
			items,
		}));
	}, [filteredFailures, subsections]);

	const failureTypeChart = useMemo(() => {
		const counts = new Map();
		filteredFailures.forEach((task) => {
			const key = task.failure?.type || 'UNKNOWN';
			if (!counts.has(key)) counts.set(key, []);
			counts.get(key).push(task);
		});
		return Array.from(counts.entries()).map(([label, items], index) => ({
			id: index,
			label,
			value: items.length,
			items,
		}));
	}, [filteredFailures]);

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
					<Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 'auto' }}>
						<TextField
							type="date"
							label="Start Date"
							value={dateRange.start}
							onChange={(event) => setDateRange((prev) => ({ ...prev, start: event.target.value }))}
							InputLabelProps={{ shrink: true }}
							onFocus={openNativeDateTimePicker}
							onClick={openNativeDateTimePicker}
							size="small"
						/>
						<TextField
							type="date"
							label="End Date"
							value={dateRange.end}
							onChange={(event) => setDateRange((prev) => ({ ...prev, end: event.target.value }))}
							InputLabelProps={{ shrink: true }}
							onFocus={openNativeDateTimePicker}
							onClick={openNativeDateTimePicker}
							size="small"
						/>
					</Stack>
				</Stack>

				

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
								minHeight: 320,
							}}
						>
							<Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
								Failures by Station
							</Typography>
							<BarChart
								height={240}
								series={[
									{
										data: stationChart.map((item) => item.value),
										color: theme.palette.primary.main,
									},
								]}
								xAxis={[
									{
										scaleType: 'band',
										data: stationChart.map((item) => item.label),
									},
								]}
								onItemClick={(event, payload) => {
									const target = stationChart[payload.dataIndex];
									if (!target) return;
									setDrilldown({
										open: true,
										title: `Station: ${target.label}`,
										items: target.items,
									});
								}}
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
								minHeight: 320,
							}}
						>
							<Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
								Failures by Sub-section
							</Typography>
							<BarChart
								height={240}
								series={[
									{
										data: subsectionChart.map((item) => item.value),
										color: theme.palette.warning.main,
									},
								]}
								xAxis={[
									{
										scaleType: 'band',
										data: subsectionChart.map((item) => item.label),
									},
								]}
								onItemClick={(event, payload) => {
									const target = subsectionChart[payload.dataIndex];
									if (!target) return;
									setDrilldown({
										open: true,
										title: `Sub-section: ${target.label}`,
										items: target.items,
									});
								}}
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
								minHeight: 320,
							}}
						>
							<Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
								Failure Types
							</Typography>
							<PieChart
								height={240}
								series={[
									{
										data: failureTypeChart,
										innerRadius: 60,
										paddingAngle: 2,
										cornerRadius: 4,
									},
								]}
								onItemClick={(event, payload) => {
									const target = failureTypeChart[payload.dataIndex];
									if (!target) return;
									setDrilldown({
										open: true,
										title: `Failure Type: ${target.label}`,
										items: target.items,
									});
								}}
							/>
						</Paper>
					</Grid>

					
				</Grid>
			</Box>

			<Dialog open={drilldown.open} onClose={() => setDrilldown({ open: false, title: '', items: [] })} maxWidth="sm" fullWidth>
				<DialogTitle>{drilldown.title}</DialogTitle>
				<DialogContent>
					<Stack spacing={1.5}>
						{drilldown.items.length === 0 && (
							<Typography sx={{ color: 'text.secondary' }}>No failures found.</Typography>
						)}
						{drilldown.items.map((task) => (
							<Paper key={task.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
								<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
									{task.title || 'Failure Ticket'}
								</Typography>
								<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
									{task.failure?.type || task.type} • {task.priority} • {task.status}
								</Typography>
							</Paper>
						))}
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDrilldown({ open: false, title: '', items: [] })}>Close</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
