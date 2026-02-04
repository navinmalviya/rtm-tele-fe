'use client';

import { Delete, East, Edit, LinearScale } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useSubsections } from '@/hooks/sub-sections';
import RtmDataGrid from '@/lib/common/datagrid';

export function SubSectionTable() {
	const { data: subsections = [], isLoading } = useSubsections();

	const columns = [
		{
			field: 'code',
			headerName: 'BLOCK SECTION',
			flex: 1.5,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
					<Box
						sx={{ p: 1, bgcolor: '#F5F3FF', borderRadius: 1.5, display: 'flex', color: '#7C3AED' }}
					>
						<LinearScale fontSize="small" />
					</Box>
					<Box>
						<Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.85rem' }}>
							{params.value}
						</Typography>
						<Typography sx={{ color: '#64748B', fontSize: '0.75rem' }}>
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
					<Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>
						{params.row.fromStation?.code}
					</Typography>
					<East sx={{ fontSize: 14, color: '#94A3B8' }} />
					<Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>
						{params.row.toStation?.code}
					</Typography>
				</Stack>
			),
		},
		{
			field: 'actions',
			headerName: '',
			width: 100,
			sortable: false,
			renderCell: () => (
				<Box sx={{ display: 'flex', gap: 0.5 }}>
					<IconButton size="small" sx={{ color: '#94A3B8' }}>
						<Edit fontSize="small" />
					</IconButton>
					<IconButton size="small" sx={{ color: '#FDA4AF' }}>
						<Delete fontSize="small" />
					</IconButton>
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
			/>
		</Box>
	);
}
