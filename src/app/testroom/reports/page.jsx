'use client';

import {
	Assessment,
	AssignmentLate,
	CheckCircle,
	ContentCut,
	FactCheck,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Chip,
	Grid,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useTasks } from '@/hooks/task';
import { useStations } from '@/hooks/stations';
import { useSubsections } from '@/hooks/sub-sections';
import RtmTabs from '@/lib/common/tabs';
import StatCard from '@/lib/common/stat-card';
import RtmDataGrid from '@/lib/common/datagrid';
import { useTabs } from '@/hooks/common';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

const REPORT_TABS = [
	{ label: 'Daily Failure Report', step: 'daily-failure', icon: <Assessment sx={{ fontSize: 18 }} /> },
	{ label: 'Cable Cut Reports', step: 'cable-cut', icon: <ContentCut sx={{ fontSize: 18 }} /> },
	{ label: 'Cable Testing Reports', step: 'cable-testing', icon: <FactCheck sx={{ fontSize: 18 }} /> },
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
	const { data: subsections = [] } = useSubsections();

	const today = new Date().toISOString().slice(0, 10);
	const [dateRange, setDateRange] = useState({ start: today, end: today });

	const stationMap = useMemo(() => {
		const map = new Map();
		stations.forEach((station) => {
			map.set(station.id, station.data?.label || station.name);
		});
		return map;
	}, [stations]);

	const subsectionMap = useMemo(() => {
		const map = new Map();
		subsections.forEach((sub) => {
			map.set(sub.id, sub.name || sub.code);
		});
		return map;
	}, [subsections]);

	const failures = useMemo(() => tasks.filter((task) => task.type === 'FAILURE'), [tasks]);

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

	const resolvedCount = filteredFailures.filter((task) => task.status === 'RESOLVED').length;
	const averageRestoration = useMemo(() => {
		const durations = filteredFailures
			.map((task) => {
				const start = task.createdAt;
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
				field: 'subsection',
				headerName: 'SUB-SECTION',
				flex: 1,
				valueGetter: (_, row) => row.subsection,
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
				const subsection = subsectionMap.get(task.failure?.subsectionId) || 'Not linked';
				return {
					id: task.id,
					title: task.title,
					type: task.failure?.type,
					cause: task.failure?.cause,
					station,
					subsection,
					reportedAt: task.createdAt,
					restoredAt: task.failure?.restorationTime,
					priority: task.priority,
					status: task.status,
					assignee: task.assignedTo?.name || 'Unassigned',
				};
			}),
		[filteredFailures, stationMap, subsectionMap]
	);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
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
						<Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>
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
				<RtmTabs tabs={REPORT_TABS} tabsName="reportsHub" initialState={{ currentTab: 'daily-failure' }} />
			</Box>

			<Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
				{currentTab === 'daily-failure' && (
					<Stack spacing={3}>
						<Paper
							variant="outlined"
							sx={{
								p: 3,
								borderRadius: 4,
								bgcolor: 'background.paper',
								borderColor: 'divider',
							}}
						>
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
								<Stack flex={1} spacing={0.5}>
									<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
										Daily Failure Report
									</Typography>
									<Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 600 }}>
										Filter failures by report date range.
									</Typography>
								</Stack>

								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
									<TextField
										label="Start Date"
										type="date"
										value={dateRange.start}
										onChange={(event) => setDateRange((prev) => ({ ...prev, start: event.target.value }))}
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
							</Stack>
						</Paper>

						<Grid container spacing={3}>
							<Grid item xs={12} md={4}>
								<StatCard
									label="Total Failures"
									value={filteredFailures.length}
									trend="Filtered by date"
									icon={<AssignmentLate />}
									color="warning.main"
								/>
							</Grid>
							<Grid item xs={12} md={4}>
								<StatCard
									label="Resolved Failures"
									value={resolvedCount}
									trend="Resolved status"
									icon={<CheckCircle />}
									color="success.main"
								/>
							</Grid>
							<Grid item xs={12} md={4}>
								<StatCard
									label="Average Restoration"
									value={averageRestoration}
									trend="From report time"
									icon={<Assessment />}
									color="info.main"
								/>
							</Grid>
						</Grid>

						<Paper
							variant="outlined"
							sx={{
								p: 2,
								borderRadius: 4,
								bgcolor: 'background.paper',
								borderColor: 'divider',
							}}
						>
							<RtmDataGrid rows={rows} columns={columns} loading={isLoading} />
						</Paper>
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
							Coming soon. This report will summarize cable cuts with locations, penalties, and approvals.
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
							Coming soon. This report will track OTDR tests, periodic testing outcomes, and compliance.
						</Typography>
					</Paper>
				)}
			</Box>
		</Box>
	);
}
