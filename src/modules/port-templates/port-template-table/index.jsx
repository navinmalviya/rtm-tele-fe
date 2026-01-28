'use client';

import { Bolt, Cable, Delete, Edit, Lan, Speed } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useDeletePortTemplate, usePortTemplates } from '@/hooks/port-templates';
import RtmDataGrid from '@/lib/common/datagrid';

export default function PortTemplateTable() {
	const { data: portTemplates = [], isLoading } = usePortTemplates();
	const { mutate: deletePort } = useDeletePortTemplate();

	const columns = [
		{
			field: 'name',
			headerName: 'INTERFACE NAME',
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
							bgcolor:
								params.row.type === 'TERMINAL_BLOCK'
									? '#FFFBEB'
									: '#F0FDF4',
							borderRadius: 1.5,
							display: 'flex',
							color:
								params.row.type === 'TERMINAL_BLOCK'
									? '#D97706'
									: '#16A34A',
						}}
					>
						{params.row.type === 'TERMINAL_BLOCK' ? (
							<Bolt fontSize="small" />
						) : (
							<Lan fontSize="small" />
						)}
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
							Type: {params.row.type}
						</Typography>
					</Box>
				</Box>
			),
		},
		{
			field: 'equipmentTemplate',
			headerName: 'BELONGS TO MODEL',
			flex: 1.2,
			renderCell: (params) => (
				<Box>
					<Typography
						sx={{
							fontWeight: 600,
							color: '#334155',
							fontSize: '0.85rem',
						}}
					>
						{params.value?.modelName || 'Standard'}
					</Typography>
					<Typography sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
						{params.value?.make}
					</Typography>
				</Box>
			),
		},
		{
			field: 'specifications',
			headerName: 'SPECIFICATIONS',
			flex: 1.5,
			renderCell: (params) => (
				<Stack direction="row" spacing={1}>
					{params.row.speed && (
						<Chip
							icon={
								<Speed
									style={{
										fontSize: '14px',
										color: 'inherit',
									}}
								/>
							}
							label={params.row.speed}
							size="small"
							sx={{
								bgcolor: '#F1F5F9',
								fontWeight: 600,
								fontSize: '0.65rem',
							}}
						/>
					)}
					{params.row.voltage && (
						<Chip
							icon={
								<Bolt
									style={{
										fontSize: '14px',
										color: 'inherit',
									}}
								/>
							}
							label={params.row.voltage}
							size="small"
							sx={{
								bgcolor: '#FEF3C7',
								color: '#92400E',
								fontWeight: 600,
								fontSize: '0.65rem',
							}}
						/>
					)}
					{params.row.isSFPInserted && (
						<Chip
							icon={
								<Cable
									style={{
										fontSize: '14px',
										color: 'inherit',
									}}
								/>
							}
							label={params.row.sfpType}
							size="small"
							sx={{
								bgcolor: '#F5F3FF',
								color: '#5B21B6',
								fontWeight: 600,
								fontSize: '0.65rem',
							}}
						/>
					)}
				</Stack>
			),
		},
		{
			field: 'actions',
			headerName: '',
			width: 100,
			sortable: false,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', gap: 0.5 }}>
					<Tooltip title="Edit Port Blueprint">
						<IconButton size="small" sx={{ color: '#94A3B8' }}>
							<Edit fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete">
						<IconButton
							size="small"
							sx={{ color: '#FDA4AF' }}
							onClick={() => deletePort(params.row.id)}
						>
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
				rows={portTemplates}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={70}
			/>
		</Box>
	);
}
