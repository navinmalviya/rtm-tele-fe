'use client';

import { Delete, Edit, MapsHomeWork, Storage, Subtitles } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import RtmDataGrid from '@/lib/common/datagrid';

export default function LocationTable({ locations = [], isLoading }) {
	const columns = useMemo(
		() => [
			{
				field: 'name',
				headerName: 'PHYSICAL AREA / ROOM',
				flex: 1.5,
				renderCell: (params) => (
					<Stack direction="row" spacing={2} alignItems="center">
						<Box
							sx={{
								p: 1,
								bgcolor: '#F8FAFC',
								borderRadius: 1.5,
								border: '1px solid #E2E8F0',
								color: '#64748B',
								display: 'flex',
							}}
						>
							<MapsHomeWork fontSize="small" />
						</Box>
						<Box>
							<Typography
								sx={{
									fontWeight: 800,
									color: '#0F172A',
									fontSize: '0.85rem',
									lineHeight: 1,
									mb: 0.5,
								}}
							>
								{params.value}
							</Typography>
							<Typography
								sx={{
									color: '#94A3B8',
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
								bgcolor: '#F1F5F9',
								color: '#475569',
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
						<Subtitles sx={{ fontSize: 14, color: '#94A3B8' }} />
						<Typography
							sx={{
								fontSize: '0.75rem',
								fontWeight: 600,
								color: '#475569',
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
					const menuOptions = [
						{
							label: 'Edit Details',
							icon: <EditIcon fontSize="small" />,
							action: () => console.log('Edit:', params.row),
						},
						{
							label: 'Delete Location',
							icon: <DeleteIcon fontSize="small" />,
							action: () => console.log('Delete:', params.row.id),
							color: 'error.main',
						},
					];

					return (
						<Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
							<Tooltip title="Edit Blueprint">
								<IconButton size="small" sx={{ color: '#94A3B8' }}>
									<Edit fontSize="small" />
								</IconButton>
							</Tooltip>
							<Tooltip title="Delete">
								<IconButton size="small" sx={{ color: '#FDA4AF' }}>
									<Delete fontSize="small" />
								</IconButton>
							</Tooltip>
						</Stack>
					);
				},
			},
		],
		[]
	);

	return (
		<Box sx={{ width: '100%', bgcolor: 'white', borderRadius: 2 }}>
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
