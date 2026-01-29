'use client';

import { Bolt, Delete, Edit, Hub, Layers, Memory, Straighten } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useEquipmentTemplates } from '@/hooks/eqiuipment-templates';
import RtmDataGrid from '@/lib/common/datagrid';

export default function EquipmentTemplateTable() {
	const { data: templates = [], isLoading } = useEquipmentTemplates();

	const columns = [
		{
			field: 'modelName',
			headerName: 'HARDWARE BLUEPRINT',
			flex: 1.5,
			renderCell: (params) => (
				<Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
					<Box
						sx={{
							p: 1,
							bgcolor: '#F8FAFC',
							borderRadius: 1.5,
							border: '1px solid #E2E8F0',
							color: '#64748B',
						}}
					>
						{params.row.category === 'NETWORKING' ? (
							<Hub fontSize="small" />
						) : (
							<Memory fontSize="small" />
						)}
					</Box>
					<Box>
						<Typography
							sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem', lineHeight: 1.2 }}
						>
							{params.value}
						</Typography>
						<Typography
							sx={{
								color: '#64748B',
								fontSize: '0.72rem',
								fontWeight: 600,
								textTransform: 'uppercase',
							}}
						>
							{params.row.make}
						</Typography>
					</Box>
				</Stack>
			),
		},
		{
			field: 'subCategory',
			headerName: 'CLASSIFICATION',
			flex: 1,
			renderCell: (params) => (
				<Stack spacing={0.5} justifyContent="center" sx={{ height: '100%' }}>
					<Chip
						label={params.value?.replace('_', ' ')}
						size="small"
						sx={{
							bgcolor: '#F1F5F9',
							color: '#475569',
							fontWeight: 800,
							fontSize: '0.65rem',
							borderRadius: 1,
						}}
					/>
					{params.row.layer && (
						<Stack
							direction="row"
							spacing={0.5}
							alignItems="center"
							sx={{ color: '#3B82F6', pl: 0.5 }}
						>
							<Layers sx={{ fontSize: 12 }} />
							<Typography variant="caption" sx={{ fontWeight: 700 }}>
								Layer {params.row.layer}
							</Typography>
						</Stack>
					)}
				</Stack>
			),
		},
		{
			field: 'portConfigs',
			headerName: 'PORT DENSITY',
			flex: 1,
			renderCell: (params) => {
				const configs = params.value || [];
				const totalPorts = configs.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
				return (
					<Box sx={{ py: 1 }}>
						<Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.85rem' }}>
							{totalPorts} Ports
						</Typography>
						<Typography sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
							{configs.length} Interface Types
						</Typography>
					</Box>
				);
			},
		},
		{
			field: 'specs',
			headerName: 'TECHNICAL SPECS',
			flex: 1.2,
			renderCell: (params) => (
				<Stack spacing={0.5} justifyContent="center" sx={{ height: '100%' }}>
					<Stack direction="row" spacing={1} alignItems="center">
						<Straighten sx={{ fontSize: 14, color: '#94A3B8' }} />
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
							{params.row.uHeight}U Rack Units
						</Typography>
					</Stack>
					<Stack direction="row" spacing={1} alignItems="center">
						<Bolt sx={{ fontSize: 14, color: '#F59E0B' }} />
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
							{params.row.supply}
						</Typography>
					</Stack>
				</Stack>
			),
		},
		{
			field: 'actions',
			headerName: '',
			width: 100,
			sortable: false,
			renderCell: () => (
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
			),
		},
	];

	return (
		<Box sx={{ width: '100%', bgcolor: 'white', borderRadius: 2 }}>
			<RtmDataGrid
				rows={templates}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={80}
				disableRowSelectionOnClick
			/>
		</Box>
	);
}
