'use client';

import { Delete, Edit, HourglassBottom, Stairs, ToggleOn } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useEscalationMatrix } from '@/hooks/escalation-matrix';
import RtmDataGrid from '@/lib/common/datagrid';
import { formatRoleLabel } from '@/modules/users/role-options';

const formatDuration = (minutes) => {
	if (!minutes) return '-';
	const hrs = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (!hrs) return `${mins}m`;
	if (!mins) return `${hrs}h`;
	return `${hrs}h ${mins}m`;
};

const formatDate = (value) => {
	if (!value) return '-';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '-';
	return date.toLocaleString('en-IN', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});
};

export default function EscalationTable({ onEdit, onDelete }) {
	const theme = useTheme();
	const { data: rows = [], isLoading } = useEscalationMatrix();

	const columns = useMemo(
		() => [
			{
				field: 'level',
				headerName: 'LEVEL',
				flex: 0.5,
				renderCell: (params) => (
					<Stack direction="row" spacing={1} alignItems="center">
						<Stairs sx={{ color: 'text.secondary', fontSize: 16 }} />
						<Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>L{params.value}</Typography>
					</Stack>
				),
			},
			{
				field: 'targetRole',
				headerName: 'ESCALATE TO',
				flex: 1.1,
				renderCell: (params) => (
					<Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
						{formatRoleLabel(params.value)}
					</Typography>
				),
			},
			{
				field: 'durationMinutes',
				headerName: 'DURATION',
				flex: 0.8,
				renderCell: (params) => (
					<Stack direction="row" spacing={1} alignItems="center">
						<HourglassBottom sx={{ color: 'warning.main', fontSize: 16 }} />
						<Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>
							{formatDuration(params.value)}
						</Typography>
					</Stack>
				),
			},
			{
				field: 'isActive',
				headerName: 'STATUS',
				flex: 0.7,
				renderCell: (params) => (
					<Chip
						size="small"
						label={params.value ? 'Active' : 'Inactive'}
						icon={<ToggleOn sx={{ fontSize: 14 }} />}
						sx={{
							bgcolor: params.value
								? alpha(theme.palette.success.main, 0.14)
								: alpha(theme.palette.text.secondary, 0.12),
							color: params.value ? 'success.main' : 'text.secondary',
							fontWeight: 700,
						}}
					/>
				),
			},
			{
				field: 'updatedAt',
				headerName: 'UPDATED',
				flex: 1,
				renderCell: (params) => (
					<Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
						{formatDate(params.value)}
					</Typography>
				),
			},
			{
				field: 'actions',
				headerName: '',
				width: 110,
				sortable: false,
				renderCell: (params) => (
					<Stack direction="row" spacing={0.5} alignItems="center">
						<Tooltip title="Edit">
							<IconButton
								size="small"
								onClick={() => onEdit?.(params.row)}
								sx={{ color: 'text.secondary' }}
							>
								<Edit fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Delete">
							<IconButton
								size="small"
								onClick={() => onDelete?.(params.row)}
								sx={{ color: 'error.light' }}
							>
								<Delete fontSize="small" />
							</IconButton>
						</Tooltip>
					</Stack>
				),
			},
		],
		[onDelete, onEdit, theme.palette.success.main, theme.palette.text.secondary]
	);

	return (
		<Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
			<RtmDataGrid
				rows={rows}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={64}
				disableRowSelectionOnClick
				hideFooter={false}
				pagination
				pageSizeOptions={[10, 25, 50]}
				initialState={{
					pagination: { paginationModel: { page: 0, pageSize: 10 } },
				}}
			/>
		</Box>
	);
}
