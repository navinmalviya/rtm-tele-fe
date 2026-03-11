'use client';

import { CalendarMonth, CheckCircle } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useOverdueMaintenance } from '@/hooks/maintenance';
import RtmDataGrid from '@/lib/common/datagrid';

const formatDateTime = (value) => {
	if (!value) return '-';
	const date = new Date(value);
	return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function OverdueMaintenanceTable({ onComplete }) {
	const { data: overdue = [], isLoading } = useOverdueMaintenance();

	const rows = overdue.map((item) => ({
		id: item.id,
		title: item.schedule?.title || '-',
		station: item.schedule?.station
			? `${item.schedule.station.name} (${item.schedule.station.code})`
			: '-',
		subsection: item.schedule?.subsection
			? `${item.schedule.subsection.code} (${item.schedule.subsection.name})`
			: '-',
		equipment: item.schedule?.equipment?.name || '-',
		location: item.schedule?.location?.name || '-',
		isJointSchedule: item.schedule?.isJointSchedule || false,
		jointDepartment: item.schedule?.jointDepartment || '-',
		dueDate: item.dueDate,
		escalatedAt: item.escalatedAt,
		escalatedTo: item.escalatedTo?.name || '-',
		status: item.status,
		schedule: item.schedule,
	}));

	const columns = [
		{
			field: 'title',
			headerName: 'Maintenance Item',
			flex: 1.2,
			renderCell: (params) => (
				<Stack spacing={0.2}>
					<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{params.value}</Typography>
					<Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
						{params.row.subsection !== '-' ? params.row.subsection : params.row.station}
					</Typography>
				</Stack>
			),
		},
		{
			field: 'dueDate',
			headerName: 'Due Date',
			width: 170,
			renderCell: (params) => (
				<Stack direction="row" spacing={1} alignItems="center">
					<CalendarMonth sx={(theme) => ({ fontSize: 18, color: theme.palette.error.main })} />
					<Typography sx={{ fontWeight: 600 }}>{formatDateTime(params.value)}</Typography>
				</Stack>
			),
		},
		{
			field: 'isJointSchedule',
			headerName: 'Joint',
			width: 110,
			renderCell: (params) => (
				<Chip
					size="small"
					label={params.value ? 'YES' : 'NO'}
					sx={(theme) => ({
						fontWeight: 700,
						bgcolor: params.value
							? alpha(theme.palette.secondary.main, 0.18)
							: theme.palette.action.hover,
						color: params.value ? theme.palette.secondary.main : theme.palette.text.secondary,
					})}
				/>
			),
		},
		{
			field: 'jointDepartment',
			headerName: 'Joint Dept',
			width: 160,
		},
		{
			field: 'escalatedTo',
			headerName: 'Escalated To',
			width: 170,
		},
		{
			field: 'status',
			headerName: 'Status',
			width: 120,
			renderCell: (params) => (
				<Chip
					label={params.value}
					size="small"
					sx={(theme) => ({
						fontWeight: 700,
						bgcolor:
							params.value === 'OVERDUE'
								? alpha(theme.palette.error.main, 0.18)
								: alpha(theme.palette.info.main, 0.16),
						color: params.value === 'OVERDUE' ? theme.palette.error.main : theme.palette.info.main,
					})}
				/>
			),
		},
		{
			field: 'actions',
			headerName: 'Actions',
			width: 120,
			renderCell: (params) => (
				<Tooltip title="Mark complete">
					<IconButton
						size="small"
						onClick={() => onComplete(params.row)}
						sx={(theme) => ({
							bgcolor: alpha(theme.palette.success.main, 0.18),
							color: theme.palette.success.main,
						})}
					>
						<CheckCircle fontSize="small" />
					</IconButton>
				</Tooltip>
			),
			sortable: false,
			filterable: false,
		},
	];

	return (
		<Box>
			<RtmDataGrid rows={rows} columns={columns} loading={isLoading} />
		</Box>
	);
}
