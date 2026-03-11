'use client';

import { CalendarMonth, Edit, PauseCircle, PlayCircle, Refresh } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { useMaintenanceSchedules, useToggleMaintenanceSchedule } from '@/hooks/maintenance';
import RtmDataGrid from '@/lib/common/datagrid';
import ConfirmToggleDialog from './toggle-confirm-dialog';

const formatDate = (value) => {
	if (!value) return '-';
	const date = new Date(value);
	return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const typeLabel = {
	STATION_INSPECTION_MAINTENANCE: 'Station Insp/Maint',
	CABLE_TESTING: 'Cable Testing',
	EC_SOCKET_TESTING: 'EC Socket Testing',
	CUSTOM: 'Custom',
};

export default function MaintenanceScheduleTable({ onEdit }) {
	const { data: schedules = [], isLoading, refetch } = useMaintenanceSchedules();
	const { mutate: toggleStatus } = useToggleMaintenanceSchedule();
	const [pendingToggle, setPendingToggle] = useState(null);

	const rows = schedules.map((item) => ({
		id: item.id,
		_raw: item,
		title: item.title,
		scheduleType: item.scheduleType,
		targetScope: item.targetScope,
		frequency: item.frequency,
		nextDueDate: item.nextDueDate,
		station: item.station ? `${item.station.name} (${item.station.code})` : '-',
		subsection: item.subsection ? `${item.subsection.code} (${item.subsection.name})` : '-',
		equipment: item.equipment?.name || '-',
		location: item.location?.name || '-',
		isJointSchedule: item.isJointSchedule,
		jointDepartment: item.jointDepartment || '-',
		allowedVarianceDays: item.allowedVarianceDays ?? 5,
		status: item.status,
		supervisor: item.supervisor?.name || '-',
		completionState: item.occurrences?.some((occ) => ['OPEN', 'OVERDUE'].includes(occ.status))
			? 'PENDING'
			: item.occurrences?.some((occ) => occ.status === 'COMPLETED')
				? 'COMPLETED'
				: 'PENDING',
	}));

	const columns = [
		{
			field: 'title',
			headerName: 'Schedule',
			flex: 1.1,
			renderCell: (params) => (
				<Stack spacing={0.2}>
					<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{params.value}</Typography>
					<Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
						{params.row.targetScope === 'SUBSECTION' ? params.row.subsection : params.row.station}
					</Typography>
				</Stack>
			),
		},
		{
			field: 'scheduleType',
			headerName: 'Type',
			width: 170,
			renderCell: (params) => (
				<Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem' }}>
					{typeLabel[params.value] || params.value}
				</Typography>
			),
		},
		{
			field: 'frequency',
			headerName: 'Frequency',
			width: 140,
			renderCell: (params) => (
				<Chip
					label={params.value}
					size="small"
					sx={(theme) => ({
						fontWeight: 700,
						bgcolor: alpha(theme.palette.info.main, 0.16),
						color: theme.palette.info.main,
					})}
				/>
			),
		},
		{
			field: 'nextDueDate',
			headerName: 'Next Due',
			width: 160,
			renderCell: (params) => (
				<Stack direction="row" spacing={1} alignItems="center">
					<CalendarMonth sx={(theme) => ({ fontSize: 18, color: theme.palette.primary.main })} />
					<Typography sx={{ fontWeight: 600 }}>{formatDate(params.value)}</Typography>
				</Stack>
			),
		},
		{
			field: 'isJointSchedule',
			headerName: 'Joint',
			width: 130,
			renderCell: (params) => (
				<Chip
					label={params.value ? 'YES' : 'NO'}
					size="small"
					sx={(theme) => ({
						fontWeight: 700,
						bgcolor: params.value
							? alpha(theme.palette.secondary.main, 0.2)
							: theme.palette.action.hover,
						color: params.value ? theme.palette.secondary.main : theme.palette.text.secondary,
					})}
				/>
			),
		},
		{
			field: 'jointDepartment',
			headerName: 'Joint Dept',
			width: 150,
		},
		{
			field: 'allowedVarianceDays',
			headerName: 'Window',
			width: 110,
			renderCell: (params) => (
				<Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>± {params.value}d</Typography>
			),
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
							params.value === 'ACTIVE'
								? alpha(theme.palette.success.main, 0.18)
								: alpha(theme.palette.error.main, 0.18),
						color:
							params.value === 'ACTIVE' ? theme.palette.success.main : theme.palette.error.main,
					})}
				/>
			),
		},
		{
			field: 'completionState',
			headerName: 'Work State',
			width: 130,
			renderCell: (params) => (
				<Chip
					label={params.value}
					size="small"
					sx={(theme) => ({
						fontWeight: 700,
						bgcolor:
							params.value === 'COMPLETED'
								? alpha(theme.palette.success.main, 0.2)
								: alpha(theme.palette.warning.main, 0.2),
						color:
							params.value === 'COMPLETED'
								? theme.palette.success.main
								: theme.palette.warning.main,
					})}
				/>
			),
		},
		{
			field: 'supervisor',
			headerName: 'Supervisor',
			width: 170,
		},
		{
			field: 'actions',
			headerName: 'Actions',
			width: 120,
			renderCell: () => (
				<Stack direction="row" spacing={1}>
					<Tooltip title="Edit schedule">
						<IconButton size="small" sx={{ bgcolor: 'action.hover' }}>
							<Edit fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Pause / Resume">
						<IconButton size="small" sx={{ bgcolor: 'action.hover' }}>
							<PauseCircle fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Refresh">
						<IconButton size="small" onClick={() => refetch()} sx={{ bgcolor: 'action.hover' }}>
							<Refresh fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>
			),
			sortable: false,
			filterable: false,
		},
	];

	return (
		<Box>
			<ConfirmToggleDialog
				open={!!pendingToggle}
				schedule={pendingToggle}
				onClose={() => setPendingToggle(null)}
				onConfirm={() => {
					if (pendingToggle) toggleStatus(pendingToggle.id);
					setPendingToggle(null);
				}}
			/>
			<RtmDataGrid
				rows={rows}
				columns={columns.map((col) => {
					if (col.field !== 'actions') return col;
					return {
						...col,
						renderCell: (params) => {
							const isActive = params.row.status === 'ACTIVE';
							return (
								<Stack direction="row" spacing={1}>
									<Tooltip title={isActive ? 'Edit schedule' : 'Resume to edit'}>
										<span>
											<IconButton
												size="small"
												onClick={() => params.row.status === 'ACTIVE' && onEdit?.(params.row._raw)}
												disabled={!isActive}
												sx={(theme) => ({
													bgcolor: isActive
														? alpha(theme.palette.primary.main, 0.16)
														: theme.palette.action.hover,
													color: isActive
														? theme.palette.primary.main
														: theme.palette.text.disabled,
												})}
											>
												<Edit fontSize="small" />
											</IconButton>
										</span>
									</Tooltip>
									<Tooltip title={isActive ? 'Pause schedule' : 'Resume schedule'}>
										<IconButton
											size="small"
											onClick={() => setPendingToggle(params.row)}
											sx={(theme) => ({
												bgcolor: isActive
													? alpha(theme.palette.error.main, 0.16)
													: alpha(theme.palette.success.main, 0.18),
												color: isActive ? theme.palette.error.main : theme.palette.success.main,
											})}
										>
											{isActive ? (
												<PauseCircle fontSize="small" />
											) : (
												<PlayCircle fontSize="small" />
											)}
										</IconButton>
									</Tooltip>
									<Tooltip title="Refresh">
										<IconButton
											size="small"
											onClick={() => refetch()}
											sx={(theme) => ({
												bgcolor: theme.palette.action.hover,
												color: theme.palette.text.secondary,
											})}
										>
											<Refresh fontSize="small" />
										</IconButton>
									</Tooltip>
								</Stack>
							);
						},
					};
				})}
				loading={isLoading}
			/>
		</Box>
	);
}
