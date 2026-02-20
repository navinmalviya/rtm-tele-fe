'use client';

import { AccountTree, Edit, Hub, Layers } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
						sx={(theme) => ({
							p: 1,
							bgcolor: alpha(theme.palette.error.main, 0.12),
							borderRadius: 1.5,
							display: 'flex',
							color: theme.palette.error.main,
						})}
					>
						<AccountTree fontSize="small" />
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
			field: 'subsections',
			headerName: 'CONSTITUENT BLOCKS',
			flex: 1,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Layers sx={{ fontSize: 16, color: 'text.disabled' }} />
					<Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary' }}>
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
						<IconButton size="small" sx={{ color: 'text.secondary' }}>
							<Hub fontSize="small" />
						</IconButton>
					</Tooltip>
					<IconButton size="small" sx={{ color: 'text.secondary' }}>
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
