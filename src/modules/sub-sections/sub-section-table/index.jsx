'use client';

import { Delete, East, Edit, LinearScale } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useRouter } from 'next/navigation'; // Added for navigation
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDeleteSubSection, useSubsections } from '@/hooks/sub-sections';
import RtmDataGrid from '@/lib/common/datagrid';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import DeleteSubSectionDialog from '../delete-subsection-dialog';
import EditSubSectionDrawer from '../edit-subsection';

export function SubSectionTable({ readOnly = false, routeBasePath = '/testroom' }) {
	const router = useRouter(); // Initialize the router
	const dispatch = useDispatch();
	const { data: subsections = [], isLoading } = useSubsections();
	const { mutate: deleteSubSection, isLoading: isDeleting } = useDeleteSubSection();
	const [editTarget, setEditTarget] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);

	/**
	 * Navigates to the Subsection Details page on double click.
	 * Redirects to: /testroom/sub-section/[id]
	 */
	const handleRowDoubleClick = (params) => {
		const subsectionId = params.row.id;
		router.push(`${routeBasePath}/sub-section/${subsectionId}`);
	};

	const columns = [
		{
			field: 'code',
			headerName: 'BLOCK SECTION',
			flex: 1.5,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
					<Box
						sx={(theme) => ({
							p: 1,
							bgcolor: alpha(theme.palette.secondary.main, 0.12),
							borderRadius: 1.5,
							display: 'flex',
							color: theme.palette.secondary.main,
						})}
					>
						<LinearScale fontSize="small" />
					</Box>
					<Box>
						<Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
							{params.value}
						</Typography>
						<Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
							{params.row.name}
						</Typography>
					</Box>
				</Box>
			),
		},
		{
			field: 'span',
			headerName: 'STATION BOUNDARIES',
			flex: 1.2,
			renderCell: (params) => (
				<Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
					<Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.primary' }}>
						{params.row.fromStation?.code}
					</Typography>
					<East sx={{ fontSize: 14, color: 'text.disabled' }} />
					<Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.primary' }}>
						{params.row.toStation?.code}
					</Typography>
				</Stack>
			),
		},
		{
			field: 'kmRange',
			headerName: 'KM RANGE',
			flex: 0.8,
			renderCell: (params) => {
				const start = params.row.startKm ?? '--';
				const end = params.row.endKm ?? '--';
				return (
					<Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.primary' }}>
						{start} - {end}
					</Typography>
				);
			},
		},
		{
			field: 'supervisor',
			headerName: 'SUPERVISOR',
			flex: 1,
			renderCell: (params) => (
				<Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary' }}>
					{params.row.supervisor?.name || params.row.data?.supervisor || '-'}
				</Typography>
			),
		},
		{
			field: 'actions',
			headerName: '',
			width: 100,
			sortable: false,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
					{!readOnly && (
						<>
							<IconButton
								size="small"
								sx={{ color: 'text.secondary' }}
								onClick={() => {
									setEditTarget(params.row);
									dispatch(openDrawer({ drawerName: 'editSubSectionDrawer' }));
								}}
							>
								<Edit fontSize="small" />
							</IconButton>
							<IconButton
								size="small"
								sx={{ color: 'error.light' }}
								onClick={() => setDeleteTarget(params.row)}
							>
								<Delete fontSize="small" />
							</IconButton>
						</>
					)}
				</Box>
			),
		},
	];

	return (
		<Box sx={{ width: '100%' }}>
			<RtmDataGrid
				rows={subsections}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={70}
				// Added double-click event listener
				onRowDoubleClick={handleRowDoubleClick}
				sx={{
					'& .MuiDataGrid-row': { cursor: 'pointer' },
					'& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
				}}
			/>
			{!readOnly && <EditSubSectionDrawer subSection={editTarget} />}
			{!readOnly && (
				<DeleteSubSectionDialog
					open={!!deleteTarget}
					subSection={deleteTarget}
					isLoading={isDeleting}
					onClose={() => setDeleteTarget(null)}
					onConfirm={() => {
						if (!deleteTarget?.id) return;
						deleteSubSection(deleteTarget.id, {
							onSuccess: () => setDeleteTarget(null),
						});
					}}
				/>
			)}
		</Box>
	);
}
