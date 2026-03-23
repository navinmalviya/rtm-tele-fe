'use client';

import {
	AdminPanelSettings,
	EmailOutlined,
	GroupAdd,
	LockOutlined,
	ManageHistory,
	PersonOutline,
} from '@mui/icons-material';
import { Box, Button, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDeleteEscalationMatrix } from '@/hooks/escalation-matrix';
import { useDeleteUser, useMyProfile, useUpdateMyPassword, useUpdateMyProfile } from '@/hooks/user';
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
	const { data: myProfile } = useMyProfile();
	const { mutate: updateMyProfile, isLoading: savingProfile } = useUpdateMyProfile();
	const { mutate: updateMyPassword, isLoading: savingPassword } = useUpdateMyPassword();
	const { mutate: deleteEscalation, isLoading: deletingEscalation } = useDeleteEscalationMatrix();
	const [editingUser, setEditingUser] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [editingEscalation, setEditingEscalation] = useState(null);
	const [deleteEscalationTarget, setDeleteEscalationTarget] = useState(null);
	const [profileForm, setProfileForm] = useState({ email: '', designation: '', unit: '' });
	const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

	useEffect(() => {
		if (!myProfile) return;
		setProfileForm({
			email: myProfile.email || '',
			designation: myProfile.designation || '',
			unit: myProfile.unit || '',
		});
	}, [myProfile]);

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
					}}
				>
					<Typography sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>My Profile</Typography>
					<Stack spacing={2}>
						<TextField
							label="Name"
							value={myProfile?.name || ''}
							disabled
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<PersonOutline sx={{ color: 'text.secondary' }} />
									</InputAdornment>
								),
							}}
						/>
						<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
							<TextField
								label="Email"
								value={profileForm.email}
								onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
								fullWidth
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<EmailOutlined sx={{ color: 'text.secondary' }} />
										</InputAdornment>
									),
								}}
							/>
							<TextField
								label="Designation"
								value={profileForm.designation}
								onChange={(e) =>
									setProfileForm((prev) => ({ ...prev, designation: e.target.value }))
								}
								fullWidth
							/>
							<TextField
								label="Unit"
								value={profileForm.unit}
								onChange={(e) => setProfileForm((prev) => ({ ...prev, unit: e.target.value }))}
								fullWidth
							/>
						</Stack>
						<Stack direction="row" justifyContent="flex-end">
							<Button
								variant="contained"
								disabled={savingProfile}
								onClick={() => {
									updateMyProfile({
										email: profileForm.email,
										designation: profileForm.designation,
										unit: profileForm.unit,
									});
								}}
							>
								Save Profile
							</Button>
						</Stack>
						<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
							<TextField
								label="Current Password"
								type="password"
								value={passwordForm.currentPassword}
								onChange={(e) =>
									setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
								}
								fullWidth
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<LockOutlined sx={{ color: 'text.secondary' }} />
										</InputAdornment>
									),
								}}
							/>
							<TextField
								label="New Password"
								type="password"
								value={passwordForm.newPassword}
								onChange={(e) =>
									setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
								}
								fullWidth
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<LockOutlined sx={{ color: 'text.secondary' }} />
										</InputAdornment>
									),
								}}
							/>
							<Button
								variant="outlined"
								disabled={
									savingPassword ||
									!passwordForm.currentPassword.trim() ||
									!passwordForm.newPassword.trim()
								}
								onClick={() => {
									updateMyPassword(passwordForm, {
										onSuccess: () =>
											setPasswordForm({ currentPassword: '', newPassword: '' }),
									});
								}}
							>
								Update Password
							</Button>
						</Stack>
					</Stack>
				</Paper>

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
								Add staff to the Divisional hierarchy and manage access.
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
