'use client';

import { Assessment, ContentCut, FactCheck } from '@mui/icons-material';
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts';
import { useMemo, useState } from 'react';
import { useTabs } from '@/hooks/common';
import { useStations } from '@/hooks/stations';
import { useTasks } from '@/hooks/task';
import RtmDataGrid from '@/lib/common/datagrid';
import RtmTabs from '@/lib/common/tabs';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

const REPORT_TABS = [
	{
		label: 'Daily Failure Report',
		step: 'daily-failure',
		icon: <Assessment sx={{ fontSize: 18 }} />,
	},
	{ label: 'Cable Cut Reports', step: 'cable-cut', icon: <ContentCut sx={{ fontSize: 18 }} /> },
	{
		label: 'Cable Testing Reports',
		step: 'cable-testing',
		icon: <FactCheck sx={{ fontSize: 18 }} />,
	},
];

const formatEnumLabel = (value) =>
	value
		? value
				.toString()
				.replace(/_/g, ' ')
				.toLowerCase()
				.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
		: 'N/A';

const formatDateTime = (value) => {
	if (!value) return '-';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '-';
	return date.toLocaleString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

export default function ReportsPage() {
	const theme = useTheme();
	const { currentTab } = useTabs('reportsHub', { currentTab: 'daily-failure' });
	const { data: tasks = [], isLoading } = useTasks();
	const { data: stations = [] } = useStations();

	const today = new Date().toISOString().slice(0, 10);
	const [dateRange, setDateRange] = useState({ start: today, end: today });

	const stationMap = useMemo(() => {
		const map = new Map();
		stations.forEach((station) => {
			map.set(station.id, station.data?.label || station.name);
		});
		return map;
	}, [stations]);

	const failures = useMemo(() => tasks.filter((task) => task.type === 'FAILURE'), [tasks]);

	const filteredFailures = useMemo(() => {
		const start = dateRange.start ? new Date(dateRange.start) : null;
		const end = dateRange.end ? new Date(dateRange.end) : null;
		return failures.filter((task) => {
			const dateValue = task.failure?.failureInTime || task.createdAt || task.updatedAt;
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

	const resolvedCount = filteredFailures.filter((task) => task.status === 'RESOLVED').length;
	const openCount = filteredFailures.filter((task) => task.status === 'OPEN').length;
	const inProgressCount = filteredFailures.filter((task) => task.status === 'IN_PROGRESS').length;
	const closedCount = filteredFailures.filter((task) => task.status === 'CLOSED').length;
	const averageRestoration = useMemo(() => {
		const durations = filteredFailures
			.map((task) => {
				const start = task.failure?.failureInTime || task.createdAt;
				const end = task.failure?.restorationTime;
				if (!start || !end) return null;
				const duration = new Date(end).getTime() - new Date(start).getTime();
				return duration > 0 ? duration : null;
			})
			.filter(Boolean);
		if (!durations.length) return 'N/A';
		const avgMs = durations.reduce((sum, value) => sum + value, 0) / durations.length;
		const hours = Math.floor(avgMs / (1000 * 60 * 60));
		const minutes = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m`;
	}, [filteredFailures]);

	const statusChartData = useMemo(
		() => [
			{ id: 'open', value: openCount, label: 'Open', color: theme.palette.warning.main },
			{
				id: 'inProgress',
				value: inProgressCount,
				label: 'In Progress',
				color: theme.palette.info.main,
			},
			{
				id: 'resolved',
				value: resolvedCount,
				label: 'Resolved',
				color: theme.palette.success.main,
			},
			{ id: 'closed', value: closedCount, label: 'Closed', color: theme.palette.text.secondary },
		],
		[openCount, inProgressCount, resolvedCount, closedCount, theme]
	);

	const hasFailuresInRange = filteredFailures.length > 0;
	const chartData = hasFailuresInRange
		? statusChartData
		: [
				{
					id: 'no-data',
					value: 1,
					label: 'No Data',
					color: alpha(theme.palette.text.secondary, 0.25),
				},
			];
	const nonZeroSlices = chartData.filter((item) => item.value > 0).length;

	const columns = useMemo(
		() => [
			{
				field: 'title',
				headerName: 'FAILURE SUMMARY',
				flex: 1.6,
				renderCell: (params) => (
					<Box>
						<Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: 'text.primary' }}>
							{params.value || 'Untitled Failure'}
						</Typography>
						<Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600 }}>
							ID: {params.row.id?.slice(0, 8).toUpperCase()}
						</Typography>
					</Box>
				),
			},
			{
				field: 'station',
				headerName: 'STATION',
				flex: 1,
				valueGetter: (_, row) => row.station,
			},
			{
				field: 'type',
				headerName: 'TYPE',
				flex: 0.8,
				renderCell: (params) => (
					<Chip
						label={formatEnumLabel(params.value)}
						size="small"
						sx={{
							bgcolor: alpha(theme.palette.warning.main, 0.12),
							color: theme.palette.warning.main,
							fontWeight: 800,
							borderRadius: 1.2,
							fontSize: '0.7rem',
						}}
					/>
				),
			},
			{
				field: 'cause',
				headerName: 'CAUSE',
				flex: 1,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>
						{formatEnumLabel(params.value)}
					</Typography>
				),
			},
			{
				field: 'reportedAt',
				headerName: 'REPORTED AT',
				flex: 1,
				valueGetter: (_, row) => row.reportedAt,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 700 }}>
						{formatDateTime(params.value)}
					</Typography>
				),
			},
			{
				field: 'restoredAt',
				headerName: 'RESTORED AT',
				flex: 1,
				valueGetter: (_, row) => row.restoredAt,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 700 }}>
						{formatDateTime(params.value)}
					</Typography>
				),
			},
			{
				field: 'priority',
				headerName: 'PRIORITY',
				flex: 0.7,
				renderCell: (params) => {
					const colorMap = {
						CRITICAL: theme.palette.error.main,
						HIGH: theme.palette.warning.main,
						MEDIUM: theme.palette.info.main,
						LOW: theme.palette.text.secondary,
					};
					const color = colorMap[params.value] || theme.palette.text.secondary;
					return (
						<Chip
							label={formatEnumLabel(params.value)}
							size="small"
							sx={{
								bgcolor: alpha(color, 0.12),
								color,
								fontWeight: 800,
								borderRadius: 1.2,
								fontSize: '0.65rem',
							}}
						/>
					);
				},
			},
			{
				field: 'status',
				headerName: 'STATUS',
				flex: 0.7,
				renderCell: (params) => {
					const colorMap = {
						OPEN: theme.palette.warning.main,
						IN_PROGRESS: theme.palette.info.main,
						RESOLVED: theme.palette.success.main,
						CLOSED: theme.palette.text.secondary,
					};
					const color = colorMap[params.value] || theme.palette.text.secondary;
					return (
						<Chip
							label={formatEnumLabel(params.value)}
							size="small"
							sx={{
								bgcolor: alpha(color, 0.12),
								color,
								fontWeight: 800,
								borderRadius: 1.2,
								fontSize: '0.65rem',
							}}
						/>
					);
				},
			},
			{
				field: 'assignee',
				headerName: 'ASSIGNED TO',
				flex: 1,
				valueGetter: (_, row) => row.assignee,
			},
		],
		[theme]
	);

	const rows = useMemo(
		() =>
			filteredFailures.map((task) => {
				const stationId = task.failure?.stationId || task.failure?.location?.stationId;
				const station = stationMap.get(stationId) || 'Unassigned';
				return {
					id: task.id,
					title: task.title,
					type: task.failure?.type,
					cause: task.failure?.cause,
					station,
					reportedAt: task.failure?.failureInTime || task.createdAt,
					restoredAt: task.failure?.restorationTime,
					priority: task.priority,
					status: task.status,
					assignee: task.assignedTo?.name || 'Unassigned',
				};
			}),
		[filteredFailures, stationMap]
	);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				bgcolor: 'background.default',
			}}
		>
			<Box
				sx={{
					px: 3,
					pt: 3,
					pb: 2,
					display: 'flex',
					justifyContent: 'space-between',
					bgcolor: 'background.paper',
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box
						sx={{
							p: 1,
							bgcolor: 'action.hover',
							borderRadius: 2,
							display: 'flex',
						}}
					>
						<Assessment sx={{ color: 'text.secondary' }} />
					</Box>
					<Box>
						<Typography
							variant="h5"
							sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}
						>
							Reports Center
						</Typography>
						<Typography
							variant="caption"
							sx={{
								color: 'text.secondary',
								fontWeight: 700,
								textTransform: 'uppercase',
								letterSpacing: '1px',
							}}
						>
							Operational insights & compliance logs
						</Typography>
					</Box>
				</Stack>
			</Box>

			<Box sx={{ px: 3, bgcolor: 'background.paper' }}>
				<RtmTabs
					tabs={REPORT_TABS}
					tabsName="reportsHub"
					initialState={{ currentTab: 'daily-failure' }}
				/>
			</Box>

			<Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
				{currentTab === 'daily-failure' && (
					<Stack spacing={2.25}>
						<Stack
							direction={{ xs: 'column', lg: 'row' }}
							spacing={2}
							justifyContent="space-between"
							alignItems={{ xs: 'flex-start', lg: 'center' }}
							sx={{ px: 0.25 }}
						>
							<Box sx={{ minWidth: 0 }}>
								<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.6 }}>
									<Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
										Failure Overview
									</Typography>
									<Chip
										size="small"
										label={`${filteredFailures.length} failures`}
										sx={{
											bgcolor: alpha(theme.palette.primary.main, 0.18),
											color: 'primary.main',
											fontWeight: 800,
										}}
									/>
								</Stack>
								<Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
									Avg Restoration: {averageRestoration}
								</Typography>
							</Box>

							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.2} alignItems="center">
								<PieChart
									height={150}
									width={150}
									hideLegend
									margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
									series={[
										{
											data: chartData,
											innerRadius: 40,
											paddingAngle: nonZeroSlices > 1 ? 2 : 0,
											cornerRadius: nonZeroSlices > 1 ? 4 : 0,
										},
									]}
								/>
								<Stack spacing={0.65}>
									<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
										{hasFailuresInRange
											? `${Math.round((resolvedCount / filteredFailures.length) * 100)}% Resolved`
											: 'No data in range'}
									</Typography>
									{statusChartData.map((item) => (
										<Stack key={item.id} direction="row" spacing={0.8} alignItems="center">
											<Box
												sx={{
													width: 9,
													height: 9,
													borderRadius: '50%',
													bgcolor: item.color,
												}}
											/>
											<Typography
												sx={{ fontSize: '0.78rem', color: 'text.secondary', minWidth: 95 }}
											>
												{item.label}
											</Typography>
											<Typography sx={{ fontSize: '0.78rem', fontWeight: 800 }}>
												{item.value}
											</Typography>
										</Stack>
									))}
								</Stack>
							</Stack>
						</Stack>

						<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
							<TextField
								label="Start Date"
								type="date"
								value={dateRange.start}
								onChange={(event) =>
									setDateRange((prev) => ({ ...prev, start: event.target.value }))
								}
								InputLabelProps={{ shrink: true }}
								onFocus={openNativeDateTimePicker}
								onClick={openNativeDateTimePicker}
								size="small"
								sx={{ minWidth: 160 }}
							/>
							<TextField
								label="End Date"
								type="date"
								value={dateRange.end}
								onChange={(event) => setDateRange((prev) => ({ ...prev, end: event.target.value }))}
								InputLabelProps={{ shrink: true }}
								onFocus={openNativeDateTimePicker}
								onClick={openNativeDateTimePicker}
								size="small"
								sx={{ minWidth: 160 }}
							/>
							<Button
								variant="outlined"
								onClick={() => setDateRange({ start: today, end: today })}
								sx={{ textTransform: 'none', fontWeight: 700 }}
							>
								Today
							</Button>
						</Stack>

						<RtmDataGrid
							rows={rows}
							columns={columns}
							loading={isLoading}
							hideFooter={false}
							pagination
							pageSizeOptions={[10, 25, 50]}
							initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
						/>
					</Stack>
				)}

				{currentTab === 'cable-cut' && (
					<Paper
						variant="outlined"
						sx={{ p: 4, borderRadius: 4, borderColor: 'divider', bgcolor: 'background.paper' }}
					>
						<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
							Cable Cut Reports
						</Typography>
						<Typography sx={{ color: 'text.secondary', mt: 1 }}>
							Coming soon. This report will summarize cable cuts with locations, penalties, and
							approvals.
						</Typography>
					</Paper>
				)}

				{currentTab === 'cable-testing' && (
					<Paper
						variant="outlined"
						sx={{ p: 4, borderRadius: 4, borderColor: 'divider', bgcolor: 'background.paper' }}
					>
						<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
							Cable Testing Reports
						</Typography>
						<Typography sx={{ color: 'text.secondary', mt: 1 }}>
							Coming soon. This report will track OTDR tests, periodic testing outcomes, and
							compliance.
						</Typography>
					</Paper>
				)}
			</Box>
		</Box>
	);
}
