'use client';

import { DeleteOutline, Edit, Memory, Place, Power, Storage } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import RtmDataGrid from '@/lib/common/datagrid';

export default function EquipmentTable({ equipments = [], isLoading, onEdit, onDelete }) {
	const theme = useTheme();
	const STATUS_MAP = {
		OPERATIONAL: {
			label: 'Active',
			color: theme.palette.success.main,
			bg: alpha(theme.palette.success.main, 0.12),
		},
		FAULTY: {
			label: 'Faulty',
			color: theme.palette.error.main,
			bg: alpha(theme.palette.error.main, 0.12),
		},
		MAINTENANCE: {
			label: 'Service',
			color: theme.palette.warning.main,
			bg: alpha(theme.palette.warning.main, 0.12),
		},
		DECOMMISSIONED: {
			label: 'Retired',
			color: theme.palette.text.secondary,
			bg: theme.palette.action.hover,
		},
	};

	const columns = useMemo(
		() => [
			{
				field: 'name',
				headerName: 'ASSET IDENTIFIER',
				flex: 1.5,
				renderCell: (params) => (
					<Stack direction="row" spacing={2} alignItems="center">
						<Box
							sx={(theme) => ({
								p: 1,
								bgcolor: alpha(theme.palette.text.primary, 0.04),
								borderRadius: 1.5,
								border: '1px solid',
								borderColor: 'divider',
								color: theme.palette.primary.main,
								display: 'flex',
							})}
						>
							<Memory fontSize="small" />
						</Box>
						<Box>
							<Typography
								sx={{
									fontWeight: 800,
									color: 'text.primary',
									fontSize: '0.85rem',
									lineHeight: 1,
									mb: 0.5,
								}}
							>
								{params.value}
							</Typography>
							<Typography sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 600 }}>
								{params.row.template?.make} {params.row.template?.modelName}
							</Typography>
						</Box>
					</Stack>
				),
			},
			{
				field: 'placement',
				headerName: 'PHYSICAL PATH',
				flex: 1.2,
				renderCell: (params) => (
					<Stack spacing={0.5}>
						<Stack direction="row" spacing={0.5} alignItems="center">
							<Storage sx={{ fontSize: 12, color: 'text.secondary' }} />
							<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
								{params.row.rack?.name || 'Unracked'}
							</Typography>
						</Stack>
						<Stack direction="row" spacing={0.5} alignItems="center">
							<Place sx={{ fontSize: 12, color: 'text.disabled' }} />
							<Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.disabled' }}>
								Slot: {params.row.uPosition ? `U${params.row.uPosition}` : 'N/A'} •{' '}
								{params.row.rack?.location?.name || 'No Room'}
							</Typography>
						</Stack>
					</Stack>
				),
			},
			{
				field: 'specs',
				headerName: 'SPECS',
				flex: 0.8,
				renderCell: (params) => (
					<Stack direction="row" spacing={1} alignItems="center">
						<Tooltip title={`Height: ${params.row.template?.uHeight}U`}>
							<Chip
								label={`${params.row.template?.uHeight || 1}U`}
								size="small"
								sx={{
									height: 20,
									fontSize: '0.65rem',
									fontWeight: 800,
									bgcolor: 'action.hover',
									borderRadius: 1,
								}}
							/>
						</Tooltip>
						{params.row.template?.isPoe && <Power sx={{ fontSize: 16, color: 'warning.main' }} />}
						{params.row.template?.layer && (
							<Typography
								sx={{
									fontSize: '0.7rem',
									fontWeight: 900,
									color: 'primary.main',
									bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
									px: 0.5,
									borderRadius: 0.5,
								}}
							>
								L{params.row.template.layer}
							</Typography>
						)}
					</Stack>
				),
			},
			{
				field: 'status',
				headerName: 'AVAILABILITY',
				width: 130,
				renderCell: (params) => {
					const status = STATUS_MAP[params.value] || STATUS_MAP.OPERATIONAL;
					return (
						<Chip
							label={status.label}
							size="small"
							sx={{
								bgcolor: status.bg,
								color: status.color,
								fontWeight: 900,
								fontSize: '0.65rem',
								borderRadius: 1,
								textTransform: 'uppercase',
							}}
						/>
					);
				},
			},
			{
				field: 'actions',
				headerName: '',
				width: 80,
				sortable: false,
				align: 'right',
				renderCell: (params) => {
					return (
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
									<DeleteOutline fontSize="small" />
								</IconButton>
							</Tooltip>
						</Stack>
					);
				},
			},
		],
		[theme, onEdit, onDelete]
	);

	return (
		<Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
			<RtmDataGrid
				rows={equipments}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={75}
				disableRowSelectionOnClick
			/>
		</Box>
	);
}
