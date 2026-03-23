'use client';

import { Bolt, Cable, DeleteOutline, Edit, Lan, Speed } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { usePortTemplates } from '@/hooks/port-templates';
import RtmDataGrid from '@/lib/common/datagrid';

export default function PortTemplateTable({ onEdit, onDelete }) {
	const { data: portTemplates = [], isLoading } = usePortTemplates();

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
						sx={(theme) => ({
							p: 1,
							bgcolor:
								params.row.type === 'TERMINAL_BLOCK'
									? alpha(theme.palette.warning.main, 0.12)
									: alpha(theme.palette.success.main, 0.12),
							borderRadius: 1.5,
							display: 'flex',
							color:
								params.row.type === 'TERMINAL_BLOCK'
									? theme.palette.warning.dark
									: theme.palette.success.main,
						})}
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
								color: 'text.primary',
								fontSize: '0.85rem',
							}}
						>
							{params.value}
						</Typography>
						<Typography
							sx={{
								color: 'text.secondary',
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
							color: 'text.primary',
							fontSize: '0.85rem',
						}}
					>
						{params.value?.modelName || 'Standard'}
					</Typography>
					<Typography sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
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
								bgcolor: 'action.hover',
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
								bgcolor: (theme) => alpha(theme.palette.warning.main, 0.16),
								color: 'warning.dark',
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
								bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16),
								color: 'secondary.dark',
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
							<DeleteOutline fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			),
		},
	];

	return (
		<RtmDataGrid
			rows={portTemplates}
			columns={columns}
			loading={isLoading}
			getRowId={(row) => row.id}
			rowHeight={70}
		/>
	);
}
