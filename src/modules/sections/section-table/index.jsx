'use client';

import { AccountTree, Edit, Hub, Layers } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useSections } from '@/hooks/sections';
import RtmDataGrid from '@/lib/common/datagrid';

export function SectionTable() {
	const { data: sections = [], isLoading } = useSections();

	const columns = [
		{
			field: 'code',
			headerName: 'MAIN SECTION',
			flex: 1.5,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
					<Box
						sx={{ p: 1, bgcolor: '#FFF1F2', borderRadius: 1.5, display: 'flex', color: '#E11D48' }}
					>
						<AccountTree fontSize="small" />
					</Box>
					<Box>
						<Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
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
			field: 'subsections',
			headerName: 'CONSTITUENT BLOCKS',
			flex: 1,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Layers sx={{ fontSize: 16, color: '#94A3B8' }} />
					<Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569' }}>
						{params.value?.length || 0} Sub-sections
					</Typography>
				</Box>
			),
		},
		{
			field: 'actions',
			headerName: '',
			width: 100,
			sortable: false,
			renderCell: () => (
				<Box sx={{ display: 'flex', gap: 0.5 }}>
					<Tooltip title="View Section Map">
						<IconButton size="small" sx={{ color: '#94A3B8' }}>
							<Hub fontSize="small" />
						</IconButton>
					</Tooltip>
					<IconButton size="small" sx={{ color: '#94A3B8' }}>
						<Edit fontSize="small" />
					</IconButton>
				</Box>
			),
		},
	];

	return (
		<Box sx={{ width: '100%' }}>
			<RtmDataGrid
				rows={sections}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={70}
			/>
		</Box>
	);
}
