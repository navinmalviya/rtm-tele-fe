'use client';

import { Badge, Delete, Edit, Email, Person, Shield } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useUsers } from '@/hooks/user';
import RtmDataGrid from '@/lib/common/datagrid';

const formatRole = (value) =>
	value
		? value
				.toString()
				.replace(/_/g, ' ')
				.toLowerCase()
				.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
		: '-';

export default function UserTable({ onEdit, onDelete }) {
	const { data: users = [], isLoading } = useUsers();
	const theme = useTheme();

	const filteredUsers = useMemo(() => users.filter((user) => user.role !== 'SUPER_ADMIN'), [users]);

	const columns = useMemo(
		() => [
			{
				field: 'name',
				headerName: 'USER',
				flex: 1.4,
				renderCell: (params) => (
					<Stack direction="row" spacing={2} alignItems="center">
						<Box
							sx={{
								p: 1,
								bgcolor: alpha(theme.palette.primary.main, 0.12),
								borderRadius: 1.5,
								color: theme.palette.primary.main,
								display: 'flex',
							}}
						>
							<Person fontSize="small" />
						</Box>
						<Box>
							<Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
								{params.value}
							</Typography>
							<Stack direction="row" spacing={0.5} alignItems="center">
								<Badge sx={{ fontSize: 12, color: 'text.disabled' }} />
								<Typography sx={{ color: 'text.disabled', fontSize: '0.72rem', fontWeight: 600 }}>
									{params.row.designation || '—'}
								</Typography>
							</Stack>
						</Box>
					</Stack>
				),
			},
			{
				field: 'username',
				headerName: 'USERNAME',
				flex: 1,
				renderCell: (params) => (
					<Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>
						{params.value}
					</Typography>
				),
			},
			{
				field: 'email',
				headerName: 'EMAIL',
				flex: 1.2,
				renderCell: (params) => (
					<Stack direction="row" spacing={0.5} alignItems="center">
						<Email sx={{ fontSize: 14, color: 'text.disabled' }} />
						<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
							{params.value}
						</Typography>
					</Stack>
				),
			},
			{
				field: 'role',
				headerName: 'ROLE',
				flex: 0.9,
				renderCell: (params) => (
					<Chip
						label={formatRole(params.value)}
						size="small"
						icon={<Shield sx={{ fontSize: 14 }} />}
						sx={{
							bgcolor: alpha(theme.palette.info.main, 0.14),
							color: theme.palette.info.main,
							fontWeight: 800,
							fontSize: '0.65rem',
							borderRadius: 1,
						}}
					/>
				),
			},
			{
				field: 'incharge',
				headerName: 'REPORTING_TO',
				flex: 1.1,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
						{params.row.incharge?.name || '—'}
					</Typography>
				),
			},
			{
				field: 'actions',
				headerName: '',
				width: 100,
				sortable: false,
				renderCell: (params) => (
					<Stack direction="row" spacing={0.5} alignItems="center">
						<Tooltip title="Edit User">
							<IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => onEdit?.(params.row)}>
								<Edit fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Delete">
							<IconButton size="small" sx={{ color: 'error.light' }} onClick={() => onDelete?.(params.row)}>
								<Delete fontSize="small" />
							</IconButton>
						</Tooltip>
					</Stack>
				),
			},
		],
		[theme, onEdit, onDelete]
	);

	return (
		<Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
			<RtmDataGrid
				rows={filteredUsers}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={70}
				disableRowSelectionOnClick
				hideFooter={false}
				pagination
				pageSizeOptions={[10, 25, 50]}
				initialState={{
					pagination: { paginationModel: { page: 0, pageSize: 10 } },
				}}
			/>
		</Box>
	);
}
