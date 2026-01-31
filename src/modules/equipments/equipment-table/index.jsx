'use client';

import { Delete, Edit, Memory, Place, Power, Storage, Visibility } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import RtmDataGrid from '@/lib/common/datagrid';

const STATUS_MAP = {
	OPERATIONAL: { label: 'Active', color: '#10B981', bg: '#ECFDF5' },
	FAULTY: { label: 'Faulty', color: '#EF4444', bg: '#FEF2F2' },
	MAINTENANCE: { label: 'Service', color: '#F59E0B', bg: '#FFFBEB' },
	DECOMMISSIONED: { label: 'Retired', color: '#64748B', bg: '#F1F5F9' },
};

export default function EquipmentTable({ equipments = [], isLoading }) {
	const columns = useMemo(
		() => [
			{
				field: 'name',
				headerName: 'ASSET IDENTIFIER',
				flex: 1.5,
				renderCell: (params) => (
					<Stack direction="row" spacing={2} alignItems="center">
						<Box
							sx={{
								p: 1,
								bgcolor: '#F8FAFC',
								borderRadius: 1.5,
								border: '1px solid #E2E8F0',
								color: '#3B82F6',
								display: 'flex',
							}}
						>
							<Memory fontSize="small" />
						</Box>
						<Box>
							<Typography
								sx={{
									fontWeight: 800,
									color: '#0F172A',
									fontSize: '0.85rem',
									lineHeight: 1,
									mb: 0.5,
								}}
							>
								{params.value}
							</Typography>
							<Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 600 }}>
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
							<Storage sx={{ fontSize: 12, color: '#64748B' }} />
							<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
								{params.row.rack?.name || 'Unracked'}
							</Typography>
						</Stack>
						<Stack direction="row" spacing={0.5} alignItems="center">
							<Place sx={{ fontSize: 12, color: '#94A3B8' }} />
							<Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#94A3B8' }}>
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
									bgcolor: '#F1F5F9',
									borderRadius: 1,
								}}
							/>
						</Tooltip>
						{params.row.template?.isPoe && <Power sx={{ fontSize: 16, color: '#F59E0B' }} />}
						{params.row.template?.layer && (
							<Typography
								sx={{
									fontSize: '0.7rem',
									fontWeight: 900,
									color: '#3B82F6',
									bgcolor: '#EFF6FF',
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
					const menuOptions = [
						{
							label: 'View Details',
							icon: <Visibility fontSize="small" />,
							action: () => console.log('View:', params.row),
						},
						{
							label: 'Edit Asset',
							icon: <Edit fontSize="small" />,
							action: () => console.log('Edit:', params.row),
						},
						{
							label: 'Delete',
							icon: <Delete fontSize="small" />,
							action: () => console.log('Delete:', params.row.id),
							color: 'error.main',
						},
					];

					return (
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
					);
				},
			},
		],
		[]
	);

	return (
		<Box sx={{ width: '100%', bgcolor: 'white', borderRadius: 2 }}>
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
