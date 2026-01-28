'use client';

import { Delete, Edit, SettingsSuggest } from '@mui/icons-material';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { useEquipmentTemplates } from '@/hooks/eqiuipment-templates';
import RtmDataGrid from '@/lib/common/datagrid';

export default function EquipmentTemplateTable() {
	// Replace with your actual data fetching hook
	const { data: templates = [], isLoading } = useEquipmentTemplates();

	const columns = [
		{
			field: 'modelName',
			headerName: 'MODEL / TEMPLATE',
			flex: 1.5,
			renderCell: (params) => (
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						height: '100%',
					}}
				>
					<Box
						sx={{
							p: 1,
							bgcolor: '#EFF6FF',
							borderRadius: 1.5,
							display: 'flex',
							color: '#3B82F6',
						}}
					>
						<SettingsSuggest fontSize="small" />
					</Box>
					<Box>
						<Typography
							sx={{
								fontWeight: 700,
								color: '#1E293B',
								fontSize: '0.85rem',
							}}
						>
							{params.value}
						</Typography>
						<Typography
							sx={{
								color: '#64748B',
								fontSize: '0.75rem',
							}}
						>
							{params.row.make}
						</Typography>
					</Box>
				</Box>
			),
		},
		{
			field: 'type',
			headerName: 'TYPE',
			flex: 1,
			renderCell: (params) => {
				const colors = {
					SWITCH: { bg: '#F0F9FF', text: '#0369A1' },
					ROUTER: { bg: '#F5F3FF', text: '#6D28D9' },
					SERVER: { bg: '#FEF2F2', text: '#B91C1C' },
				};
				const style = colors[params.value] || {
					bg: '#F1F5F9',
					text: '#475569',
				};
				return (
					<Chip
						label={params.value}
						size="small"
						sx={{
							bgcolor: style.bg,
							color: style.text,
							fontWeight: 700,
							fontSize: '0.7rem',
							borderRadius: 1.5,
						}}
					/>
				);
			},
		},
		{
			field: 'portCount',
			headerName: 'PORTS',
			flex: 0.8,
			renderCell: (params) => (
				<Typography
					sx={{
						fontWeight: 600,
						color: '#334155',
						fontSize: '0.85rem',
					}}
				>
					{params.value || 0} Ports
				</Typography>
			),
		},
		{
			field: 'actions',
			headerName: '',
			width: 100,
			sortable: false,
			renderCell: () => (
				<Box sx={{ display: 'flex', gap: 0.5 }}>
					<Tooltip title="Edit Template">
						<IconButton size="small" sx={{ color: '#94A3B8' }}>
							<Edit fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete">
						<IconButton size="small" sx={{ color: '#FDA4AF' }}>
							<Delete fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			),
		},
	];

	return (
		<Box sx={{ width: '100%' }}>
			<RtmDataGrid
				rows={templates}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={70} // Taller rows for a spacious library feel
			/>
		</Box>
	);
}
