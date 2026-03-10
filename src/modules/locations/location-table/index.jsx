'use client';

import { Delete, Edit, MapsHomeWork, Storage, Subtitles } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';
import RtmDataGrid from '@/lib/common/datagrid';

export default function LocationTable({ locations = [], isLoading, onEdit, onDelete }) {
	const columns = useMemo(
		() => [
			{
				field: 'name',
				headerName: 'PHYSICAL AREA / ROOM',
				flex: 1.5,
				renderCell: (params) => (
					<Stack direction="row" spacing={2} alignItems="center">
						<Box
							sx={(theme) => ({
								p: 1,
								bgcolor: alpha(theme.palette.text.primary, 0.04),
								borderRadius: 1.5,
								border: '1px solid',
								borderColor: 'divider',
								color: theme.palette.text.secondary,
								display: 'flex',
							})}
						>
							<MapsHomeWork fontSize="small" />
						</Box>
						<Box>
							<Typography
								sx={{
									fontWeight: 800,
									color: 'text.primary',
									fontSize: '0.85rem',
									lineHeight: 1,
									mb: 0.5,
								}}
							>
								{params.value}
							</Typography>
							<Typography
								sx={{
									color: 'text.disabled',
									fontSize: '0.72rem',
									fontWeight: 600,
									textTransform: 'uppercase',
									lineHeight: 1,
								}}
							>
								ID: {params.row.id?.split('-')[0]}
							</Typography>
						</Box>
					</Stack>
				),
			},
			{
				field: '_count',
				headerName: 'ASSET DENSITY',
				flex: 1,
				renderCell: (params) => {
					const rackCount = params.value?.racks || 0;
					return (
						<Chip
							label={`${rackCount} Racks`}
							icon={<Storage sx={{ fontSize: '14px !important' }} />}
							size="small"
							sx={{
								bgcolor: 'action.hover',
								color: 'text.secondary',
								fontWeight: 800,
								fontSize: '0.65rem',
								borderRadius: 1,
							}}
						/>
					);
				},
			},
			{
				field: 'description',
				headerName: 'TECHNICAL REMARKS',
				flex: 1.5,
				renderCell: (params) => (
					<Stack direction="row" spacing={1} alignItems="center">
						<Subtitles sx={{ fontSize: 14, color: 'text.disabled' }} />
						<Typography
							sx={{
								fontSize: '0.75rem',
								fontWeight: 600,
								color: 'text.secondary',
								fontStyle: params.value ? 'normal' : 'italic',
							}}
						>
							{params.value || 'No additional notes'}
						</Typography>
					</Stack>
				),
			},
			{
				field: 'actions',
				headerName: '',
				width: 100,
				sortable: false,
				align: 'right',
				renderCell: (params) => {
					return (
						<Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
							<Tooltip title="Edit Blueprint">
								<IconButton
									size="small"
									sx={{ color: 'text.secondary' }}
									onClick={() => onEdit?.(params.row)}
								>
									<Edit fontSize="small" />
								</IconButton>
							</Tooltip>
							<Tooltip title="Delete">
								<IconButton
									size="small"
									sx={{ color: 'error.light' }}
									onClick={() => onDelete?.(params.row)}
								>
									<Delete fontSize="small" />
								</IconButton>
							</Tooltip>
						</Stack>
					);
				},
			},
		],
		[onEdit, onDelete]
	);

	return (
		<Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
			<RtmDataGrid
				rows={locations}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={70} // Reduced height slightly for better balance
				disableRowSelectionOnClick
			/>
		</Box>
	);
}
