// src/modules/locations/components/LocationTable.jsx
'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import RtmDataGrid from '@/lib/common/datagrid';
import RtmPopupMenu from '@/lib/common/rtm-popup-menu';

export default function LocationTable({ locations, isLoading }) {
	const columns = useMemo(
		() => [
			{
				field: 'name',
				headerName: 'LOCATION NAME',
				minWidth: 250,
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
				field: 'description',
				headerName: 'DESCRIPTION',
				minWidth: 400,
				flex: 2,
				renderCell: (params) => (
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							height: '100%',
						}}
					>
						<Typography variant="body2" color="text.secondary">
							{params.value || '—'}
						</Typography>
					</Box>
				),
			},
			{
				field: 'actions',
				headerName: '', // Keep header empty for the menu column
				width: 80,
				sortable: false,
				disableColumnMenu: true,
				align: 'right', // Forces the menu icon to the right edge of the cell
				renderCell: (params) => {
					const menuOptions = [
						{
							label: 'Edit',
							icon: <EditIcon fontSize="small" />,
							action: () =>
								console.log('Edit:', params.row),
						},
						{
							label: 'Delete',
							icon: <DeleteIcon fontSize="small" />,
							action: () =>
								console.log(
									'Delete:',
									params.row.id
								),
							color: 'error.main',
						},
					];

					return (
						<Box sx={{ pr: 1 }}>
							{' '}
							{/* Fine-tuned padding for the icon */}
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
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<RtmDataGrid
				rows={locations}
				columns={columns}
				loading={isLoading}
				// Ensure the grid doesn't try to be wider than50
				sx={{ width: '100%' }}
			/>
		</Box>
	);
}
