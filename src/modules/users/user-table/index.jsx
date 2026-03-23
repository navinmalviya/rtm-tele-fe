'use client';

import { Badge, DeleteOutline, Edit, Email, Person, Shield } from '@mui/icons-material';
import { Box, Chip, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useUsers } from '@/hooks/user';
import RtmDataGrid from '@/lib/common/datagrid';
import { formatRoleLabel } from '../role-options';

export default function UserTable({ onEdit, onDelete }) {
	const { data: users = [], isLoading } = useUsers();
	const theme = useTheme();
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState('ALL');
	const [unitFilter, setUnitFilter] = useState('ALL');

	const roleOptions = useMemo(
		() => ['ALL', ...new Set(users.map((user) => user.role).filter(Boolean).sort())],
		[users]
	);
	const unitOptions = useMemo(
		() => ['ALL', ...new Set(users.map((user) => user.unit).filter(Boolean).sort())],
		[users]
	);

	const filteredUsers = useMemo(() => {
		const needle = searchTerm.trim().toLowerCase();
		return users
			.filter((user) => user.role !== 'SUPER_ADMIN')
			.filter((user) => (roleFilter === 'ALL' ? true : user.role === roleFilter))
			.filter((user) => (unitFilter === 'ALL' ? true : (user.unit || '') === unitFilter))
			.filter((user) => {
				if (!needle) return true;
				const searchIn = [
					user.name,
					user.username,
					user.email,
					user.designation,
					user.incharge?.name,
					formatRoleLabel(user.role),
					user.unit,
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();
				return searchIn.includes(needle);
			});
	}, [users, roleFilter, searchTerm, unitFilter]);

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
						label={formatRoleLabel(params.value)}
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
				field: 'unit',
				headerName: 'UNIT',
				flex: 1,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 700 }}>
						{params.value || '—'}
					</Typography>
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
				),
			},
		],
		[theme, onEdit, onDelete]
	);

	return (
		<Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={1.5}
				sx={{ p: 1.5, alignItems: { xs: 'stretch', md: 'center' } }}
			>
				<TextField
					size="small"
					label="Search users"
					placeholder="Name, username, email..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					sx={{ minWidth: 220 }}
				/>
				<TextField
					size="small"
					select
					label="Role"
					value={roleFilter}
					onChange={(e) => setRoleFilter(e.target.value)}
					sx={{ minWidth: 180 }}
				>
					{roleOptions.map((role) => (
						<MenuItem key={role} value={role}>
							{role === 'ALL' ? 'All Roles' : formatRoleLabel(role)}
						</MenuItem>
					))}
				</TextField>
				<TextField
					size="small"
					select
					label="Unit"
					value={unitFilter}
					onChange={(e) => setUnitFilter(e.target.value)}
					sx={{ minWidth: 180 }}
				>
					{unitOptions.map((unit) => (
						<MenuItem key={unit} value={unit}>
							{unit === 'ALL' ? 'All Units' : unit}
						</MenuItem>
					))}
				</TextField>
			</Stack>
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
