'use client';

import { Delete, Edit, Inventory2 } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useTnpItems } from '@/hooks/tnp';
import RtmDataGrid from '@/lib/common/datagrid';

const formatEnum = (value) =>
	value
		? value
				.toString()
				.replace(/_/g, ' ')
				.toLowerCase()
				.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
		: '-';

export default function TnpTable({ onEdit, onDelete }) {
	const { data: items = [], isLoading } = useTnpItems();
	const theme = useTheme();

	const columns = useMemo(
		() => [
			{
				field: 'tnpNumber',
				headerName: 'T&P NUMBER',
				flex: 1,
				renderCell: (params) => (
					<Stack direction="row" spacing={1} alignItems="center">
						<Inventory2 sx={{ color: 'text.secondary', fontSize: 18 }} />
						<Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
							{params.value}
						</Typography>
					</Stack>
				),
			},
			{
				field: 'name',
				headerName: 'NAME',
				flex: 1.2,
				renderCell: (params) => (
					<Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}>
						{params.value}
					</Typography>
				),
			},
			{
				field: 'type',
				headerName: 'TYPE',
				flex: 0.8,
				renderCell: (params) => (
					<Chip
						label={formatEnum(params.value)}
						size="small"
						sx={{
							bgcolor: alpha(theme.palette.info.main, 0.14),
							color: theme.palette.info.main,
							fontWeight: 800,
							fontSize: '0.65rem',
							borderRadius: 1,
						}}
					/>
				),
			},
			{
				field: 'station',
				headerName: 'STATION',
				flex: 1,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
						{params.row.station ? `${params.row.station.name} (${params.row.station.code})` : '-'}
					</Typography>
				),
			},
			{
				field: 'location',
				headerName: 'LOCATION',
				flex: 1,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
						{params.row.location?.name || '-'}
					</Typography>
				),
			},
			{
				field: 'description',
				headerName: 'DESCRIPTION',
				flex: 1.2,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
						{params.value || '—'}
					</Typography>
				),
			},
			{
				field: 'actions',
				headerName: '',
				width: 90,
				sortable: false,
				renderCell: (params) => (
					<Stack direction="row" spacing={0.5} alignItems="center">
						<Tooltip title="Edit">
							<IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => onEdit?.(params.row)}>
								<Edit fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Delete">
							<IconButton size="small" sx={{ color: 'error.light' }} onClick={() => onDelete?.(params.row)}>
								<Delete fontSize="small" />
							</IconButton>
						</Tooltip>
					</Stack>
				),
			},
		],
		[theme, onEdit, onDelete]
	);

	return (
		<Box sx={{ width: '100%' }}>
			<RtmDataGrid
				rows={items}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={70}
				hideFooter={false}
				pagination
				pageSizeOptions={[10, 25, 50]}
				initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
			/>
		</Box>
	);
}
