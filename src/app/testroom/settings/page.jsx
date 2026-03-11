'use client';

import { AdminPanelSettings, GroupAdd, ManageHistory } from '@mui/icons-material';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDeleteEscalationMatrix } from '@/hooks/escalation-matrix';
import { useDeleteUser } from '@/hooks/user';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import {
	DeleteEscalationDialog,
	EscalationDrawer,
	EscalationTable,
} from '@/modules/escalation-matrix';
import { AddUserDrawer, DeleteUserDialog, EditUserDrawer, UserTable } from '@/modules/users';

export default function SettingsPage() {
	const dispatch = useDispatch();
	const { mutate: deleteUser, isLoading: deletingUser } = useDeleteUser();
	const { mutate: deleteEscalation, isLoading: deletingEscalation } = useDeleteEscalationMatrix();
	const [editingUser, setEditingUser] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [editingEscalation, setEditingEscalation] = useState(null);
	const [deleteEscalationTarget, setDeleteEscalationTarget] = useState(null);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				bgcolor: 'background.default',
			}}
		>
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

				<Paper
					variant="outlined"
					sx={{
						borderRadius: 4,
						borderColor: 'divider',
						bgcolor: 'background.paper',
						p: 3,
						mt: 3,
						mb: 3,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 2,
					}}
				>
					<Stack direction="row" spacing={1.5} alignItems="center">
						<ManageHistory sx={{ color: 'primary.main' }} />
						<Box>
							<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
								Escalation Matrix
							</Typography>
							<Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
								Define role-wise escalation levels and duration windows.
							</Typography>
						</Box>
					</Stack>
					<Button
						variant="contained"
						onClick={() => dispatch(openDrawer({ drawerName: 'addEscalationDrawer' }))}
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
						Add Escalation Level
					</Button>
				</Paper>

				<EscalationTable
					onEdit={(row) => {
						setEditingEscalation(row);
						dispatch(openDrawer({ drawerName: 'editEscalationDrawer' }));
					}}
					onDelete={(row) => setDeleteEscalationTarget(row)}
				/>
			</Box>

			<AddUserDrawer />
			<EditUserDrawer user={editingUser} />
			<EscalationDrawer drawerName="addEscalationDrawer" mode="create" />
			<EscalationDrawer drawerName="editEscalationDrawer" mode="edit" row={editingEscalation} />
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
			<DeleteEscalationDialog
				open={!!deleteEscalationTarget}
				row={deleteEscalationTarget}
				isLoading={deletingEscalation}
				onClose={() => setDeleteEscalationTarget(null)}
				onConfirm={() => {
					if (!deleteEscalationTarget?.id) return;
					deleteEscalation(deleteEscalationTarget.id, {
						onSuccess: () => setDeleteEscalationTarget(null),
					});
				}}
			/>
		</Box>
	);
}
