// src/modules/racks/components/RackTable.jsx
'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Chip, Typography } from '@mui/material';
import { useMemo } from 'react';
import RtmDataGrid from '@/lib/common/datagrid';
import RtmPopupMenu from '@/lib/common/rtm-popup-menu';

export default function RackTable({ racks, isLoading }) {
	console.log('racks', racks);
	const columns = useMemo(
		() => [
			{
				field: 'name',
				headerName: 'RACK NAME',
				minWidth: 200,
				flex: 1,
				renderCell: (params) => (
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							height: '100%',
						}}
					>
						<Typography
							variant="body2"
							sx={{
								fontWeight: 700,
								color: '#1a237e',
								lineHeight: 1,
							}}
						>
							{params.value}
						</Typography>
					</Box>
				),
			},
			{
				field: 'location',
				headerName: 'LOCATION (ROOM)',
				minWidth: 200,
				flex: 1,
				// Extracting name from the nested location object provided by Prisma
				valueGetter: (params) => params.name || 'Unassigned',
				renderCell: (params) => (
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							height: '100%',
						}}
					>
						<Typography
							variant="body2"
							sx={{ color: '#475569', fontWeight: 500 }}
						>
							{params.value}
						</Typography>
					</Box>
				),
			},
			{
				field: 'type',
				headerName: 'TYPE',
				width: 180,
				renderCell: (params) => (
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							height: '100%',
						}}
					>
						<Chip
							label={params.value?.replace('_', ' ')}
							size="small"
							variant="outlined"
							sx={{
								fontSize: '0.7rem',
								fontWeight: 600,
								textTransform: 'capitalize',
							}}
						/>
					</Box>
				),
			},
			{
				field: 'heightU',
				headerName: 'HEIGHT',
				width: 100,
				align: 'center',
				headerAlign: 'center',
				valueGetter: (params) => `${params.value || 42}U`,
			},
			{
				field: 'actions',
				headerName: '',
				width: 80,
				sortable: false,
				disableColumnMenu: true,
				align: 'right',
				renderCell: (params) => {
					const menuOptions = [
						{
							label: 'Edit',
							icon: <EditIcon fontSize="small" />,
							action: () =>
								console.log(
									'Edit Rack:',
									params.row
								),
						},
						{
							label: 'Delete',
							icon: <DeleteIcon fontSize="small" />,
							action: () =>
								console.log(
									'Delete Rack:',
									params.row.id
								),
							color: 'error.main',
						},
					];

					return (
						<Box
							sx={{
								pr: 1,
								display: 'flex',
								alignItems: 'center',
								height: '100%',
								justifyContent: 'flex-end',
							}}
						>
							<RtmPopupMenu options={menuOptions} />
						</Box>
					);
				},
			},
		],
		[]
	);

	return (
		<Box
			sx={{
				width: '100%',
				maxWidth: '1450px',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<RtmDataGrid
				rows={racks}
				columns={columns}
				loading={isLoading}
				sx={{ width: '100%' }}
			/>
		</Box>
	);
}
