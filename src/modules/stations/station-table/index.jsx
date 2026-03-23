'use client';

import { CalendarMonth, DeleteOutline, Edit, Place, Visibility } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDeleteStation, useStations } from '@/hooks/stations';
import RtmDataGrid from '@/lib/common/datagrid';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import DeleteStationDialog from '../delete-station-dialog';
import EditStationDrawer from '../edit-station';

export function StationTable({ readOnly = false, routeBasePath = '/testroom' }) {
	const router = useRouter();
	const dispatch = useDispatch();
	const { data: stations = [], isLoading } = useStations();
	const { mutate: deleteStation, isLoading: isDeleting } = useDeleteStation();
	const [editTarget, setEditTarget] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);

	const columns = [
		{
			field: 'code',
			headerName: 'STATION IDENTITY',
			flex: 1.5,
			renderCell: (params) => {
				return (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
						<Box
							sx={(theme) => ({
								p: 1,
								bgcolor: alpha(theme.palette.primary.main, 0.12),
								borderRadius: 1.5,
								display: 'flex',
								color: theme.palette.primary.main,
							})}
						>
							<Place fontSize="small" />
						</Box>
						<Box>
							<Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
								{params.row.data.code}
							</Typography>
							<Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
								{params.row.data.label}
							</Typography>
						</Box>
					</Box>
				);
			},
		},
		{
			field: 'supervisor',
			headerName: 'SUPERVISOR',
			flex: 1.2,
			renderCell: (params) => (
				<Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 700 }}>
					{params.row.supervisor?.name || params.row.data?.supervisor || '-'}
				</Typography>
			),
		},
		{
			field: 'createdAt',
			headerName: 'DATE ADDED',
			flex: 1,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<CalendarMonth sx={{ fontSize: '16px', color: 'text.disabled' }} />
					<Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 500 }}>
						{new Date(params.value).toLocaleDateString()}
					</Typography>
				</Box>
			),
		},
		{
			field: 'actions',
			headerName: '',
			width: 140,
			sortable: false,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', gap: 0.5 }}>
					<Tooltip title="View Dashboard">
						<IconButton
							size="small"
							sx={{ color: 'text.secondary' }}
							onClick={() => router.push(`${routeBasePath}/station/${params.row.id}`)}
						>
							<Visibility fontSize="small" />
						</IconButton>
					</Tooltip>
					{!readOnly && (
						<>
							<Tooltip title="Edit">
								<IconButton
									size="small"
									sx={{ color: 'text.secondary' }}
									onClick={() => {
										setEditTarget(params.row);
										dispatch(openDrawer({ drawerName: 'editStationDrawer' }));
									}}
								>
									<Edit fontSize="small" />
								</IconButton>
							</Tooltip>
							<Tooltip title="Delete">
								<IconButton
									size="small"
									sx={{ color: 'error.light' }}
									onClick={() => setDeleteTarget(params.row)}
								>
									<DeleteOutline fontSize="small" />
								</IconButton>
							</Tooltip>
						</>
					)}
				</Box>
			),
		},
	];

	return (
		<Box sx={{ width: '100%' }}>
			<RtmDataGrid
				rows={stations}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={70}
			/>
			{!readOnly && <EditStationDrawer station={editTarget} />}
			{!readOnly && (
				<DeleteStationDialog
					open={!!deleteTarget}
					station={deleteTarget}
					isLoading={isDeleting}
					onClose={() => setDeleteTarget(null)}
					onConfirm={() => {
						if (!deleteTarget?.id) return;
						deleteStation(deleteTarget.id, {
							onSuccess: () => setDeleteTarget(null),
						});
					}}
				/>
			)}
		</Box>
	);
}
