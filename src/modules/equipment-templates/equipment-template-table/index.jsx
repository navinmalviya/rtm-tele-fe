'use client';

import { Bolt, Delete, Edit, Hub, Layers, Memory, Straighten } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useEquipmentTemplates } from '@/hooks/eqiuipment-templates';
import RtmDataGrid from '@/lib/common/datagrid';

export default function EquipmentTemplateTable({ onEdit, onDelete }) {
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
							color: 'text.secondary',
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
							sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem', lineHeight: 1.2 }}
						>
							{params.value}
						</Typography>
						<Typography
							sx={{
								color: 'text.secondary',
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
							bgcolor: 'action.hover',
							color: 'text.secondary',
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
							sx={{ color: 'primary.main', pl: 0.5 }}
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
						<Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
							{totalPorts} Ports
						</Typography>
						<Typography sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
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
						<Straighten sx={{ fontSize: 14, color: 'text.disabled' }} />
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
							{params.row.uHeight}U Rack Units
						</Typography>
					</Stack>
					<Stack direction="row" spacing={1} alignItems="center">
						<Bolt sx={{ fontSize: 14, color: 'warning.main' }} />
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
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
			renderCell: (params) => (
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
			),
		},
	];

	return (
		<Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
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
