'use client';

import { Bolt, Flag, Hub, Repeat, Timeline, WifiTetheringError } from '@mui/icons-material';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart, PieChart } from '@mui/x-charts';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useStations } from '@/hooks/stations';
import { useTasks } from '@/hooks/task';
import StatCard from '@/lib/common/stat-card';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

export default function DashboardPage() {
	const dispatch = useDispatch();
	const theme = useTheme();
	const [drilldown, setDrilldown] = useState({ open: false, title: '', items: [] });
	const [dateRange, setDateRange] = useState(() => {
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
		return {
			start: start.toISOString().slice(0, 10),
			end: now.toISOString().slice(0, 10),
		};
	});

	// Fetching tasks which includes failures, inspections, etc.
	const { data: allTasks = [] } = useTasks();
	const { data: stations = [] } = useStations();

	const failures = allTasks.filter((t) => t.type === 'FAILURE');
	const getFailureEventDate = (task) =>
		task.failure?.failureInTime || task.createdAt || task.updatedAt;
	const openDrilldown = (title, items = []) => setDrilldown({ open: true, title, items });

	const filteredFailures = useMemo(() => {
		const start = dateRange.start ? new Date(dateRange.start) : null;
		const end = dateRange.end ? new Date(dateRange.end) : null;
		return failures.filter((task) => {
			const dateValue = getFailureEventDate(task);
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

	const activeFailures = filteredFailures.filter(
		(f) => f.status !== 'RESOLVED' && f.status !== 'CLOSED'
	);
	const totalFailures = filteredFailures.length;
	const hqRepeatedCount = filteredFailures.filter((f) => f.failure?.isHqRepeated).length;
	const icmsRepeatedCount = filteredFailures.filter((f) => f.failure?.isIcmsRepeated).length;

	const criticalCount = activeFailures.filter(
		(f) => f.priority === 'CRITICAL' || f.priority === 'HIGH'
	).length;

	const formatDuration = (ms) => {
		if (!Number.isFinite(ms) || ms <= 0) return 'N/A';
		const totalMinutes = Math.round(ms / (1000 * 60));
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return `${hours}h ${minutes}m`;
	};
	const formatDurationMinutes = (ms) => {
		if (!Number.isFinite(ms) || ms <= 0) return 'N/A';
		return `${Math.round(ms / (1000 * 60))} mins`;
	};

	const formatEnumLabel = (value) =>
		value
			?.toString()
			.toLowerCase()
			.replace(/_/g, ' ')
			.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

	const mttrValues = useMemo(() => {
		return filteredFailures
			.map((task) => {
				const start = task.failure?.failureInTime || task.createdAt;
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
			.map((task) => getFailureEventDate(task))
			.filter(Boolean)
			.map((value) => new Date(value).getTime())
			.sort((a, b) => a - b);
		if (points.length < 2) return null;
		const gaps = points
			.slice(1)
			.map((value, index) => value - points[index])
			.filter((gap) => gap > 0);
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
			if (!counts.has(key)) counts.set(key, { label: key, items: [] });
			counts.get(key).items.push(task);
		});

		return Array.from(counts.values())
			.map((entry) => ({
				label: entry.label,
				value: entry.items.length,
				items: entry.items,
			}))
			.sort((a, b) => b.value - a.value);
	}, [filteredFailures, stations]);

	const failureTypeChart = useMemo(() => {
		const counts = new Map();
		filteredFailures.forEach((task) => {
			const key = task.failure?.type || 'UNKNOWN';
			if (!counts.has(key)) counts.set(key, []);
			counts.get(key).push(task);
		});
		return Array.from(counts.entries())
			.map(([label, items]) => ({
				label: formatEnumLabel(label),
				value: items.length,
				items,
			}))
			.sort((a, b) => b.value - a.value);
	}, [filteredFailures]);

	const failureCauseChart = useMemo(() => {
		const counts = new Map();
		filteredFailures.forEach((task) => {
			const key = task.failure?.cause || 'UNKNOWN';
			if (!counts.has(key)) counts.set(key, []);
			counts.get(key).push(task);
		});
		return Array.from(counts.entries())
			.map(([label, items]) => ({
				label: formatEnumLabel(label),
				value: items.length,
				items,
			}))
			.sort((a, b) => b.value - a.value);
	}, [filteredFailures]);

	const monthWiseAnalytics = useMemo(() => {
		const start = dateRange.start ? new Date(dateRange.start) : new Date();
		const end = dateRange.end ? new Date(dateRange.end) : new Date();
		if (end < start) {
			return {
				labels: [],
				totalValues: [],
				hqValues: [],
				icmsValues: [],
				avgMttrMinutes: [],
				totalItems: [],
				hqItems: [],
				icmsItems: [],
				mttrItems: [],
			};
		}

		const monthKeys = [];
		const buckets = new Map();
		const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
		const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);

		while (cursor <= lastMonth) {
			const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
			monthKeys.push(key);
			buckets.set(key, {
				totalItems: [],
				hqItems: [],
				icmsItems: [],
				mttrItems: [],
				mttrMinutesTotal: 0,
				mttrCount: 0,
			});
			cursor.setMonth(cursor.getMonth() + 1);
		}

		filteredFailures.forEach((task) => {
			const eventDate = getFailureEventDate(task);
			if (!eventDate) return;
			const dt = new Date(eventDate);
			const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
			const bucket = buckets.get(key);
			if (!bucket) return;

			bucket.totalItems.push(task);
			if (task.failure?.isHqRepeated) bucket.hqItems.push(task);
			if (task.failure?.isIcmsRepeated) bucket.icmsItems.push(task);

			const startTime = task.failure?.failureInTime || task.createdAt;
			const endTime = task.failure?.restorationTime;
			if (startTime && endTime) {
				const minutes = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60);
				if (minutes > 0) {
					bucket.mttrMinutesTotal += minutes;
					bucket.mttrCount += 1;
					bucket.mttrItems.push(task);
				}
			}
		});

		const labels = monthKeys.map((key) => {
			const [year, month] = key.split('-').map(Number);
			return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
				month: 'short',
				year: monthKeys.length > 12 ? '2-digit' : undefined,
			});
		});

		return {
			labels,
			totalValues: monthKeys.map((key) => buckets.get(key).totalItems.length),
			hqValues: monthKeys.map((key) => buckets.get(key).hqItems.length),
			icmsValues: monthKeys.map((key) => buckets.get(key).icmsItems.length),
			avgMttrMinutes: monthKeys.map((key) => {
				const bucket = buckets.get(key);
				if (!bucket.mttrCount) return 0;
				return Math.round(bucket.mttrMinutesTotal / bucket.mttrCount);
			}),
			totalItems: monthKeys.map((key) => buckets.get(key).totalItems),
			hqItems: monthKeys.map((key) => buckets.get(key).hqItems),
			icmsItems: monthKeys.map((key) => buckets.get(key).icmsItems),
			mttrItems: monthKeys.map((key) => buckets.get(key).mttrItems),
		};
	}, [filteredFailures, dateRange]);

	const chartCardSx = {
		p: 2.5,
		borderRadius: 3,
		borderColor: 'divider',
		bgcolor: 'background.paper',
		height: 360,
		display: 'flex',
		flexDirection: 'column',
	};

	const toPieData = (rows = []) => {
		if (!rows.length) {
			return [{ id: 0, label: 'No Data', value: 1, items: [] }];
		}
		return rows.map((row, index) => ({
			id: index,
			label: row.label,
			value: row.value,
			items: row.items,
		}));
	};
	const piePalette = [
		theme.palette.primary.main,
		theme.palette.info.main,
		theme.palette.success.main,
		theme.palette.warning.main,
		theme.palette.error.main,
		theme.palette.secondary.main,
		theme.palette.primary.light,
		theme.palette.info.light,
		theme.palette.success.light,
		theme.palette.warning.light,
		theme.palette.error.light,
		theme.palette.secondary.light,
	];

	const stationPieData = toPieData(stationChart).map((item, index) => ({
		...item,
		color: piePalette[index % piePalette.length],
	}));
	const failureTypePieData = toPieData(failureTypeChart).map((item, index) => ({
		...item,
		color: piePalette[index % piePalette.length],
	}));
	const failureCausePieData = toPieData(failureCauseChart).map((item, index) => ({
		...item,
		color: piePalette[index % piePalette.length],
	}));

	return (
		<Box sx={{ bgcolor: 'transparent', p: { xs: 2, md: 3 } }}>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				justifyContent="space-between"
				alignItems={{ xs: 'flex-start', md: 'center' }}
				spacing={2}
				sx={{ mb: 3 }}
			>
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

			<Box
				sx={{
					display: 'grid',
					gap: 2,
					gridTemplateColumns: {
						xs: '1fr',
						sm: 'repeat(2, minmax(0, 1fr))',
						md: 'repeat(3, minmax(0, 1fr))',
						xl: 'repeat(6, minmax(0, 1fr))',
					},
				}}
			>
				<StatCard
					label="Total Failures"
					value={totalFailures.toString()}
					trend="In selected range"
					icon={<Hub />}
					color="primary.main"
				/>
				<StatCard
					label="Active Failures"
					value={activeFailures.length.toString()}
					trend={criticalCount > 0 ? `${criticalCount} Critical` : 'Normal'}
					icon={<WifiTetheringError />}
					color={criticalCount > 0 ? 'error.main' : 'warning.main'}
				/>
				<StatCard
					label="Failures in ICMS"
					value={icmsRepeatedCount.toString()}
					trend="Marked as ICMS repeated"
					icon={<Repeat />}
					color="secondary.main"
				/>
				<StatCard
					label="HQ Repeated"
					value={hqRepeatedCount.toString()}
					trend="Marked for HQ reporting"
					icon={<Flag />}
					color="error.main"
				/>
				<StatCard
					label="Avg. MTTR"
					value={formatDuration(avgMttrMs)}
					trend="Mean Time to Repair"
					icon={<Bolt />}
					color="success.main"
				/>
				<StatCard
					label="Avg. MTBF"
					value={formatDuration(avgMtbfMs)}
					trend="Mean Time Between Failures"
					icon={<Timeline />}
					color="info.main"
				/>
			</Box>

			<Box sx={{ mt: 6 }}>
				<Stack
					direction={{ xs: 'column', lg: 'row' }}
					spacing={2}
					alignItems={{ xs: 'flex-start', lg: 'center' }}
					sx={{ mb: 2 }}
				>
					<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Failure Analytics
					</Typography>
					<Box sx={{ px: 1.5, py: 0.5, bgcolor: 'action.hover', borderRadius: 2 }}>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'text.secondary' }}>
							{activeFailures.length} ACTIVE
						</Typography>
					</Box>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={2}
						alignItems={{ xs: 'stretch', sm: 'center' }}
						sx={{ ml: { lg: 'auto' }, width: { xs: '100%', sm: 'auto' } }}
					>
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

				<Box
					sx={{
						mt: 1,
						display: 'grid',
						gap: 2,
						gridTemplateColumns: {
							xs: '1fr',
							lg: 'repeat(2, minmax(0, 1fr))',
							xl: 'repeat(6, minmax(0, 1fr))',
						},
					}}
				>
					<Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 1', xl: 'span 2' } }}>
						<Paper variant="outlined" sx={chartCardSx}>
							<Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
								Station-wise Failure Analysis
							</Typography>
							<Stack direction="row" spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<PieChart
										height={260}
										hideLegend
										margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
										series={[
											{
												data: stationPieData,
												innerRadius: 45,
												paddingAngle: 1.5,
												cornerRadius: 3,
											},
										]}
										onItemClick={(_event, payload) => {
											if (!payload || payload.dataIndex == null) return;
											const target = stationChart[payload.dataIndex];
											if (!target) return;
											openDrilldown(`Station: ${target.label}`, target.items);
										}}
									/>
								</Box>
								<Stack
									spacing={0.75}
									sx={{
										width: 180,
										minHeight: 0,
										overflowY: 'auto',
										pl: 1,
										borderLeft: '1px solid',
										borderColor: 'divider',
									}}
								>
									{stationPieData.map((item) => (
										<Stack
											key={item.id}
											direction="row"
											spacing={1}
											alignItems="center"
											sx={{ cursor: 'pointer' }}
											onClick={() => openDrilldown(`Station: ${item.label}`, item.items || [])}
										>
											<Box
												sx={{
													width: 10,
													height: 10,
													borderRadius: '50%',
													bgcolor: item.color,
													flexShrink: 0,
												}}
											/>
											<Typography
												sx={{ fontSize: '0.75rem', color: 'text.primary', flex: 1 }}
												noWrap
											>
												{item.label}
											</Typography>
											<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
												{item.value}
											</Typography>
										</Stack>
									))}
								</Stack>
							</Stack>
						</Paper>
					</Box>

					<Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 1', xl: 'span 2' } }}>
						<Paper variant="outlined" sx={chartCardSx}>
							<Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
								Gear & Failure Type Analysis
							</Typography>
							<Stack direction="row" spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<PieChart
										height={260}
										hideLegend
										margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
										series={[
											{
												data: failureTypePieData,
												innerRadius: 45,
												paddingAngle: 1.5,
												cornerRadius: 3,
											},
										]}
										onItemClick={(_event, payload) => {
											if (!payload || payload.dataIndex == null) return;
											const target = failureTypeChart[payload.dataIndex];
											if (!target) return;
											openDrilldown(`Failure Type: ${target.label}`, target.items);
										}}
									/>
								</Box>
								<Stack
									spacing={0.75}
									sx={{
										width: 180,
										minHeight: 0,
										overflowY: 'auto',
										pl: 1,
										borderLeft: '1px solid',
										borderColor: 'divider',
									}}
								>
									{failureTypePieData.map((item) => (
										<Stack
											key={item.id}
											direction="row"
											spacing={1}
											alignItems="center"
											sx={{ cursor: 'pointer' }}
											onClick={() => openDrilldown(`Failure Type: ${item.label}`, item.items || [])}
										>
											<Box
												sx={{
													width: 10,
													height: 10,
													borderRadius: '50%',
													bgcolor: item.color,
													flexShrink: 0,
												}}
											/>
											<Typography
												sx={{ fontSize: '0.75rem', color: 'text.primary', flex: 1 }}
												noWrap
											>
												{item.label}
											</Typography>
											<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
												{item.value}
											</Typography>
										</Stack>
									))}
								</Stack>
							</Stack>
						</Paper>
					</Box>

					<Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 2', xl: 'span 2' } }}>
						<Paper variant="outlined" sx={chartCardSx}>
							<Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
								Cause-wise Failure Analysis
							</Typography>
							<Stack direction="row" spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<PieChart
										height={260}
										hideLegend
										margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
										series={[
											{
												data: failureCausePieData,
												innerRadius: 45,
												paddingAngle: 1.5,
												cornerRadius: 3,
											},
										]}
										onItemClick={(_event, payload) => {
											if (!payload || payload.dataIndex == null) return;
											const target = failureCauseChart[payload.dataIndex];
											if (!target) return;
											openDrilldown(`Cause: ${target.label}`, target.items);
										}}
									/>
								</Box>
								<Stack
									spacing={0.75}
									sx={{
										width: 180,
										minHeight: 0,
										overflowY: 'auto',
										pl: 1,
										borderLeft: '1px solid',
										borderColor: 'divider',
									}}
								>
									{failureCausePieData.map((item) => (
										<Stack
											key={item.id}
											direction="row"
											spacing={1}
											alignItems="center"
											sx={{ cursor: 'pointer' }}
											onClick={() => openDrilldown(`Cause: ${item.label}`, item.items || [])}
										>
											<Box
												sx={{
													width: 10,
													height: 10,
													borderRadius: '50%',
													bgcolor: item.color,
													flexShrink: 0,
												}}
											/>
											<Typography
												sx={{ fontSize: '0.75rem', color: 'text.primary', flex: 1 }}
												noWrap
											>
												{item.label}
											</Typography>
											<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
												{item.value}
											</Typography>
										</Stack>
									))}
								</Stack>
							</Stack>
						</Paper>
					</Box>

					<Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 1', xl: 'span 3' } }}>
						<Paper variant="outlined" sx={chartCardSx}>
							<Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
								Month-wise Avg. MTTR (mins)
							</Typography>
							<BarChart
								height={260}
								margin={{ top: 20, right: 16, bottom: 36, left: 36 }}
								series={[
									{
										id: 'avg-mttr',
										label: 'Avg MTTR (mins)',
										data: monthWiseAnalytics.avgMttrMinutes,
										color: theme.palette.success.main,
									},
								]}
								xAxis={[
									{
										scaleType: 'band',
										data: monthWiseAnalytics.labels,
									},
								]}
								onItemClick={(_event, payload) => {
									if (!payload || payload.dataIndex == null) return;
									openDrilldown(
										`Restored Failures • ${monthWiseAnalytics.labels[payload.dataIndex]}`,
										monthWiseAnalytics.mttrItems[payload.dataIndex]
									);
								}}
							/>
						</Paper>
					</Box>

					<Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 1', xl: 'span 3' } }}>
						<Paper variant="outlined" sx={chartCardSx}>
							<Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
								Month-wise Failure Analysis
							</Typography>
							<BarChart
								height={260}
								margin={{ top: 20, right: 16, bottom: 36, left: 36 }}
								series={[
									{
										id: 'total',
										label: 'Total Failures',
										data: monthWiseAnalytics.totalValues,
										color: theme.palette.primary.main,
									},
									{
										id: 'hq',
										label: 'HQ Repeated',
										data: monthWiseAnalytics.hqValues,
										color: theme.palette.error.main,
									},
									{
										id: 'icms',
										label: 'ICMS Repeated',
										data: monthWiseAnalytics.icmsValues,
										color: theme.palette.secondary.main,
									},
								]}
								xAxis={[
									{
										scaleType: 'band',
										data: monthWiseAnalytics.labels,
									},
								]}
								onItemClick={(_event, payload) => {
									if (!payload || payload.dataIndex == null) return;
									const monthLabel = monthWiseAnalytics.labels[payload.dataIndex];
									if (payload.seriesId === 'hq') {
										openDrilldown(
											`HQ Repeated • ${monthLabel}`,
											monthWiseAnalytics.hqItems[payload.dataIndex]
										);
										return;
									}
									if (payload.seriesId === 'icms') {
										openDrilldown(
											`ICMS Repeated • ${monthLabel}`,
											monthWiseAnalytics.icmsItems[payload.dataIndex]
										);
										return;
									}
									openDrilldown(
										`Total Failures • ${monthLabel}`,
										monthWiseAnalytics.totalItems[payload.dataIndex]
									);
								}}
							/>
						</Paper>
					</Box>
				</Box>
			</Box>

			<Dialog
				open={drilldown.open}
				onClose={() => setDrilldown({ open: false, title: '', items: [] })}
				maxWidth="sm"
				fullWidth
			>
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
									{task.failure?.type || task.type} • {task.priority} • {task.status} •{' '}
									{formatDurationMinutes(
										task.failure?.restorationTime
											? new Date(task.failure.restorationTime).getTime() -
													(new Date(task.failure?.failureInTime || task.createdAt).getTime() || 0)
											: null
									)}
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
