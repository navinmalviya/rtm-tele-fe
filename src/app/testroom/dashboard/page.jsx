'use client';

import { Bolt, Flag, Hub, Repeat, Timeline, WifiTetheringError } from '@mui/icons-material';
import { Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { BarChart, PieChart } from '@mui/x-charts';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useStations } from '@/hooks/stations';
import { useTasks } from '@/hooks/task';
import { useUsers } from '@/hooks/user';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

export default function DashboardPage() {
	const router = useRouter();
	const theme = useTheme();
	const [inchargeId, setInchargeId] = useState('');
	const [chartFilters, setChartFilters] = useState({
		stationId: '',
		failureType: '',
		failureCause: '',
		monthKey: '',
	});
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
	const { data: users = [] } = useUsers();

	const failures = allTasks.filter((t) => t.type === 'FAILURE');
	const getFailureEventDate = (task) =>
		task.failure?.failureInTime || task.createdAt || task.updatedAt;
	const monthKeyFromDate = (value) => {
		if (!value) return null;
		const dt = new Date(value);
		if (Number.isNaN(dt.getTime())) return null;
		return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
	};

	const dateFilteredFailures = useMemo(() => {
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

	const subordinateMap = useMemo(() => {
		const map = new Map();
		users.forEach((user) => {
			if (!user.inchargeId) return;
			if (!map.has(user.inchargeId)) map.set(user.inchargeId, []);
			map.get(user.inchargeId).push(user.id);
		});
		return map;
	}, [users]);

	const collectJurisdictionIds = (rootId) => {
		const scoped = new Set();
		if (!rootId) return scoped;
		const stack = [rootId];
		while (stack.length) {
			const currentId = stack.pop();
			if (!currentId || scoped.has(currentId)) continue;
			scoped.add(currentId);
			const children = subordinateMap.get(currentId) || [];
			children.forEach((childId) => {
				stack.push(childId);
			});
		}
		return scoped;
	};

	const inchargeUsers = useMemo(
		() => users.filter((user) => user.role === 'SSE_TELE_INCHARGE'),
		[users]
	);

	const inchargeJurisdictionIds = useMemo(
		() => collectJurisdictionIds(inchargeId),
		[inchargeId, subordinateMap]
	);

	const scopedFailures = useMemo(() => {
		const hasInchargeFilter = Boolean(inchargeId);
		if (!hasInchargeFilter) return dateFilteredFailures;

		return dateFilteredFailures.filter((task) => {
			const accountableUserId = task.assignedToId || task.ownerId;
			if (!accountableUserId) return false;
			if (hasInchargeFilter && !inchargeJurisdictionIds.has(accountableUserId)) return false;
			return true;
		});
	}, [dateFilteredFailures, inchargeId, inchargeJurisdictionIds]);

	const applyInteractiveFilters = (tasks, excluded = []) => {
		const exclude = new Set(excluded);
		const { stationId, failureType, failureCause, monthKey } = chartFilters;
		if (!stationId && !failureType && !failureCause && !monthKey) return tasks;

		return tasks.filter((task) => {
			const taskStationId =
				task.failure?.stationId || task.failure?.location?.stationId || 'UNKNOWN';
			const taskFailureType = task.failure?.type || 'UNKNOWN';
			const taskFailureCause = task.failure?.cause || 'UNKNOWN';
			const taskMonthKey = monthKeyFromDate(getFailureEventDate(task));

			if (!exclude.has('stationId') && stationId && taskStationId !== stationId) return false;
			if (!exclude.has('failureType') && failureType && taskFailureType !== failureType)
				return false;
			if (!exclude.has('failureCause') && failureCause && taskFailureCause !== failureCause)
				return false;
			if (!exclude.has('monthKey') && monthKey && taskMonthKey !== monthKey) return false;
			return true;
		});
	};

	const filteredFailures = useMemo(() => {
		return applyInteractiveFilters(scopedFailures);
	}, [scopedFailures, chartFilters]);

	const stationChartFailures = useMemo(
		() => applyInteractiveFilters(scopedFailures, ['stationId']),
		[scopedFailures, chartFilters]
	);
	const failureTypeChartFailures = useMemo(
		() => applyInteractiveFilters(scopedFailures, ['failureType']),
		[scopedFailures, chartFilters]
	);
	const failureCauseChartFailures = useMemo(
		() => applyInteractiveFilters(scopedFailures, ['failureCause']),
		[scopedFailures, chartFilters]
	);
	const monthChartFailures = useMemo(
		() => applyInteractiveFilters(scopedFailures, ['monthKey']),
		[scopedFailures, chartFilters]
	);

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
		stationChartFailures.forEach((task) => {
			const stationId = task.failure?.stationId || task.failure?.location?.stationId;
			const key = stationId || 'UNKNOWN';
			const label = stationMap.get(stationId) || 'Unknown';
			if (!counts.has(key)) counts.set(key, { key, label, items: [] });
			counts.get(key).items.push(task);
		});

		return Array.from(counts.values())
			.map((entry) => ({
				key: entry.key,
				label: entry.label,
				value: entry.items.length,
				items: entry.items,
			}))
			.sort((a, b) => b.value - a.value);
	}, [stationChartFailures, stations]);

	const failureTypeChart = useMemo(() => {
		const counts = new Map();
		failureTypeChartFailures.forEach((task) => {
			const key = task.failure?.type || 'UNKNOWN';
			if (!counts.has(key)) counts.set(key, []);
			counts.get(key).push(task);
		});
		return Array.from(counts.entries())
			.map(([key, items]) => ({
				key,
				label: formatEnumLabel(key),
				value: items.length,
				items,
			}))
			.sort((a, b) => b.value - a.value);
	}, [failureTypeChartFailures]);

	const failureCauseChart = useMemo(() => {
		const counts = new Map();
		failureCauseChartFailures.forEach((task) => {
			const key = task.failure?.cause || 'UNKNOWN';
			if (!counts.has(key)) counts.set(key, []);
			counts.get(key).push(task);
		});
		return Array.from(counts.entries())
			.map(([key, items]) => ({
				key,
				label: formatEnumLabel(key),
				value: items.length,
				items,
			}))
			.sort((a, b) => b.value - a.value);
	}, [failureCauseChartFailures]);

	const monthWiseAnalytics = useMemo(() => {
		const start = dateRange.start ? new Date(dateRange.start) : new Date();
		const end = dateRange.end ? new Date(dateRange.end) : new Date();
		if (end < start) {
			return {
				monthKeys: [],
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

		monthChartFailures.forEach((task) => {
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
			monthKeys,
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
	}, [monthChartFailures, dateRange]);

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
			return [{ id: 0, key: '__NO_DATA__', label: 'No Data', value: 1, items: [] }];
		}
		return rows.map((row, index) => ({
			id: index,
			key: row.key || row.label,
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

	const applyPieColors = (data, selectedKey) =>
		data.map((item, index) => {
			const baseColor = piePalette[index % piePalette.length];
			const isSelected = selectedKey && item.key === selectedKey;
			const isDimmed = selectedKey && item.key !== selectedKey;
			return {
				...item,
				color: isSelected ? baseColor : isDimmed ? alpha(baseColor, 0.3) : baseColor,
			};
		});

	const stationPieData = applyPieColors(toPieData(stationChart), chartFilters.stationId);
	const failureTypePieData = applyPieColors(toPieData(failureTypeChart), chartFilters.failureType);
	const failureCausePieData = applyPieColors(
		toPieData(failureCauseChart),
		chartFilters.failureCause
	);

	const monthLabelByKey = useMemo(() => {
		const map = new Map();
		(monthWiseAnalytics.monthKeys || []).forEach((key, index) => {
			map.set(key, monthWiseAnalytics.labels[index] || key);
		});
		return map;
	}, [monthWiseAnalytics.monthKeys, monthWiseAnalytics.labels]);

	const activeFilterChips = useMemo(() => {
		const chips = [];
		if (chartFilters.stationId) {
			chips.push({
				key: 'stationId',
				label: `Station: ${
					stationChart.find((row) => row.key === chartFilters.stationId)?.label ||
					chartFilters.stationId
				}`,
			});
		}
		if (chartFilters.failureType) {
			chips.push({
				key: 'failureType',
				label: `Type: ${formatEnumLabel(chartFilters.failureType)}`,
			});
		}
		if (chartFilters.failureCause) {
			chips.push({
				key: 'failureCause',
				label: `Cause: ${formatEnumLabel(chartFilters.failureCause)}`,
			});
		}
		if (chartFilters.monthKey) {
			chips.push({
				key: 'monthKey',
				label: `Month: ${monthLabelByKey.get(chartFilters.monthKey) || chartFilters.monthKey}`,
			});
		}
		return chips;
	}, [chartFilters, stationChart, monthLabelByKey]);

	const toggleChartFilter = (field, value) => {
		if (!value || value === '__NO_DATA__') return;
		setChartFilters((prev) => ({
			...prev,
			[field]: prev[field] === value ? '' : value,
		}));
	};

	const resetChartFilters = () => {
		setChartFilters({
			stationId: '',
			failureType: '',
			failureCause: '',
			monthKey: '',
		});
	};

	const CompactStatCard = ({ label, value, trend, icon, color }) => (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: 3,
				p: 1.5,
				height: '100%',
				borderColor: 'divider',
				bgcolor: 'background.paper',
			}}
		>
			<Stack direction="row" spacing={1.25} alignItems="center">
				<Box
					sx={{
						width: 34,
						height: 34,
						borderRadius: 2,
						bgcolor: alpha(theme.palette.action.active, 0.1),
						color,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
						'& svg': { fontSize: 18 },
					}}
				>
					{icon}
				</Box>
				<Box sx={{ minWidth: 0, flex: 1 }}>
					<Typography sx={{ fontSize: '0.76rem', color: 'text.secondary', fontWeight: 700 }}>
						{label}
					</Typography>
					<Typography
						sx={{ fontSize: '1.6rem', lineHeight: 1.1, color: 'text.primary', fontWeight: 800 }}
					>
						{value}
					</Typography>
					<Typography
						sx={{
							fontSize: '0.68rem',
							color,
							fontWeight: 700,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
						title={trend}
					>
						{trend}
					</Typography>
				</Box>
			</Stack>
		</Paper>
	);

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
					onClick={() => router.push('/testroom/projects-tasks?tab=tasks&action=create-task')}
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
					+ Create Task
				</Button>
			</Stack>

			<Box
				sx={{
					display: 'grid',
					gap: 1.5,
					gridTemplateColumns: {
						xs: '1fr',
						sm: 'repeat(2, minmax(0, 1fr))',
						md: 'repeat(3, minmax(0, 1fr))',
						lg: 'repeat(6, minmax(0, 1fr))',
					},
				}}
			>
				<CompactStatCard
					label="Total Failures"
					value={totalFailures.toString()}
					trend="In selected range"
					icon={<Hub />}
					color="primary.main"
				/>
				<CompactStatCard
					label="Active Failures"
					value={activeFailures.length.toString()}
					trend={criticalCount > 0 ? `${criticalCount} Critical` : 'Normal'}
					icon={<WifiTetheringError />}
					color={criticalCount > 0 ? 'error.main' : 'warning.main'}
				/>
				<CompactStatCard
					label="Failures in ICMS"
					value={icmsRepeatedCount.toString()}
					trend="Marked as ICMS repeated"
					icon={<Repeat />}
					color="secondary.main"
				/>
				<CompactStatCard
					label="HQ Repeated"
					value={hqRepeatedCount.toString()}
					trend="Marked for HQ reporting"
					icon={<Flag />}
					color="error.main"
				/>
				<CompactStatCard
					label="Avg. MTTR"
					value={formatDuration(avgMttrMs)}
					trend="Mean Time to Repair"
					icon={<Bolt />}
					color="success.main"
				/>
				<CompactStatCard
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
					{activeFilterChips.length > 0 && (
						<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
							{activeFilterChips.map((chip) => (
								<Chip
									key={chip.key}
									size="small"
									label={chip.label}
									onDelete={() =>
										setChartFilters((prev) => ({
											...prev,
											[chip.key]: '',
										}))
									}
								/>
							))}
							<Button size="small" onClick={resetChartFilters} sx={{ textTransform: 'none' }}>
								Clear Selection
							</Button>
						</Stack>
					)}
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={2}
						alignItems={{ xs: 'stretch', sm: 'center' }}
						sx={{ ml: { lg: 'auto' }, width: { xs: '100%', sm: 'auto' } }}
					>
						<TextField
							select
							size="small"
							label="SSE Incharge"
							value={inchargeId}
							onChange={(event) => setInchargeId(event.target.value)}
							sx={{ minWidth: 260 }}
						>
							<MenuItem value="">All Incharge Jurisdictions</MenuItem>
							{inchargeUsers.map((user) => (
								<MenuItem key={user.id} value={user.id}>
									<Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
										<Typography sx={{ fontSize: '0.85rem', color: 'text.primary' }}>
											{user.name}
										</Typography>
										<Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
											{user.designation || user.role}
										</Typography>
									</Box>
								</MenuItem>
							))}
						</TextField>
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
											const target = stationPieData[payload.dataIndex];
											if (!target) return;
											toggleChartFilter('stationId', target.key);
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
											onClick={() => toggleChartFilter('stationId', item.key)}
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
												sx={{
													fontSize: '0.75rem',
													color:
														chartFilters.stationId === item.key ? 'primary.main' : 'text.primary',
													fontWeight: chartFilters.stationId === item.key ? 700 : 500,
													flex: 1,
												}}
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
											const target = failureTypePieData[payload.dataIndex];
											if (!target) return;
											toggleChartFilter('failureType', target.key);
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
											onClick={() => toggleChartFilter('failureType', item.key)}
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
												sx={{
													fontSize: '0.75rem',
													color:
														chartFilters.failureType === item.key ? 'primary.main' : 'text.primary',
													fontWeight: chartFilters.failureType === item.key ? 700 : 500,
													flex: 1,
												}}
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
											const target = failureCausePieData[payload.dataIndex];
											if (!target) return;
											toggleChartFilter('failureCause', target.key);
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
											onClick={() => toggleChartFilter('failureCause', item.key)}
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
												sx={{
													fontSize: '0.75rem',
													color:
														chartFilters.failureCause === item.key
															? 'primary.main'
															: 'text.primary',
													fontWeight: chartFilters.failureCause === item.key ? 700 : 500,
													flex: 1,
												}}
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
									toggleChartFilter('monthKey', monthWiseAnalytics.monthKeys?.[payload.dataIndex]);
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
									toggleChartFilter('monthKey', monthWiseAnalytics.monthKeys?.[payload.dataIndex]);
								}}
							/>
						</Paper>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
