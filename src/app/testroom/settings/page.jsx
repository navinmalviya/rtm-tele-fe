'use client';

import { AdminPanelSettings, GroupAdd } from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	Paper,
	Stack,
	Typography,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { AddUserDrawer, DeleteUserDialog, EditUserDrawer, UserTable } from '@/modules/users';
import { useDeleteUser } from '@/hooks/user';

export default function SettingsPage() {
	const dispatch = useDispatch();
	const { mutate: deleteUser, isLoading: deletingUser } = useDeleteUser();
	const [editingUser, setEditingUser] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
			<Box
				sx={{
					px: 3,
					pt: 3,
					pb: 2,
					display: 'flex',
					justifyContent: 'space-between',
					bgcolor: 'background.paper',
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, display: 'flex' }}>
						<AdminPanelSettings sx={{ color: 'text.secondary' }} />
					</Box>
					<Box>
						<Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
							Settings
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
							User management & access controls
						</Typography>
					</Box>
				</Stack>
			</Box>

			<Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
				<Paper
					variant="outlined"
					sx={{
						borderRadius: 4,
						borderColor: 'divider',
						bgcolor: 'background.paper',
						p: 3,
						mb: 3,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 2,
					}}
				>
					<Stack direction="row" spacing={1.5} alignItems="center">
						<GroupAdd sx={{ color: 'primary.main' }} />
						<Box>
							<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
								User Management
							</Typography>
							<Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
								Add staff to the testroom hierarchy and manage access.
							</Typography>
						</Box>
					</Stack>
					<Button
						variant="contained"
						onClick={() => dispatch(openDrawer({ drawerName: 'addUserDrawer' }))}
						sx={{
							bgcolor: 'primary.main',
							borderRadius: 2.5,
							textTransform: 'none',
							fontWeight: 800,
							px: 3,
							py: 1.2,
							'&:hover': { bgcolor: 'primary.dark' },
						}}
					>
						Add User
					</Button>
				</Paper>

				<UserTable
					onEdit={(user) => {
						setEditingUser(user);
						dispatch(openDrawer({ drawerName: 'editUserDrawer' }));
					}}
					onDelete={(user) => setDeleteTarget(user)}
				/>
			</Box>

			<AddUserDrawer />
			<EditUserDrawer user={editingUser} />
			<DeleteUserDialog
				open={!!deleteTarget}
				user={deleteTarget}
				isLoading={deletingUser}
				onClose={() => setDeleteTarget(null)}
				onConfirm={() => {
					if (!deleteTarget?.id) return;
					deleteUser(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
				}}
			/>
		</Box>
	);
}
