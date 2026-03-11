'use client';

import {
	AdminPanelSettings,
	Apartment,
	Badge,
	Close,
	Lock,
	MailOutline,
	WorkOutline,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useUpdateUser, useUsers } from '@/hooks/user';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { ADMIN_ROLES, ROLE_OPTIONS } from '../role-options';

export default function EditUserDrawer({ user }) {
	const dispatch = useDispatch();
	const { mutate: updateUser, isLoading } = useUpdateUser();
	const { data: users = [] } = useUsers();

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			name: '',
			email: '',
			username: '',
			password: '',
			designation: '',
			role: 'JE_SSE_TELE_SECTIONAL',
			inchargeId: '',
		},
	});

	useEffect(() => {
		if (!user) return;
		reset({
			name: user.name || '',
			email: user.email || '',
			username: user.username || '',
			password: '',
			designation: user.designation || '',
			role: user.role || 'JE_SSE_TELE_SECTIONAL',
			inchargeId: user.inchargeId || '',
		});
	}, [user, reset]);
	const selectedRole = watch('role');
	const requiresReportingOfficer = !ADMIN_ROLES.has(selectedRole);

	const handleUpdate = (data) => {
		if (!user?.id) return;
		const payload = { ...data };
		if (!payload.password) delete payload.password;
		payload.inchargeId = requiresReportingOfficer ? payload.inchargeId : null;
		updateUser({ id: user.id, data: payload });
		dispatch(closeDrawer({ drawerName: 'editUserDrawer' }));
	};

	const textFieldStyles = {
		bgcolor: 'background.paper',
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
			'& fieldset': { borderColor: 'divider' },
			'&:hover fieldset': { borderColor: 'text.disabled' },
			'&.Mui-focused fieldset': { borderColor: 'primary.main' },
		},
	};

	return (
		<RtmDrawer drawerName="editUserDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 520 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Edit User
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Update testroom staff details
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'editUserDrawer' }))}
						sx={{ bgcolor: 'action.hover' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="edit-user-form" onSubmit={handleSubmit(handleUpdate)}>
						<Stack spacing={3}>
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<Controller
									name="name"
									control={control}
									rules={{ required: 'Name is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											label="Full Name"
											fullWidth
											error={!!errors.name}
											helperText={errors.name?.message}
											sx={textFieldStyles}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Badge sx={{ color: 'primary.main' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
								<Controller
									name="email"
									control={control}
									rules={{ required: 'Email is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											label="Email"
											type="email"
											fullWidth
											error={!!errors.email}
											helperText={errors.email?.message}
											sx={textFieldStyles}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<MailOutline sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
							</Stack>

							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<Controller
									name="username"
									control={control}
									rules={{ required: 'Username is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											label="Username"
											fullWidth
											error={!!errors.username}
											helperText={errors.username?.message}
											sx={textFieldStyles}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<AdminPanelSettings sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
								<Controller
									name="password"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Reset Password (optional)"
											type="password"
											fullWidth
											sx={textFieldStyles}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Lock sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
							</Stack>

							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<Controller
									name="designation"
									control={control}
									rules={{ required: 'Designation is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											label="Designation"
											fullWidth
											error={!!errors.designation}
											helperText={errors.designation?.message}
											sx={textFieldStyles}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<WorkOutline sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
								<Controller
									name="role"
									control={control}
									rules={{ required: 'Role is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="User Role"
											fullWidth
											error={!!errors.role}
											helperText={errors.role?.message}
											sx={textFieldStyles}
										>
											{ROLE_OPTIONS.map((role) => (
												<MenuItem key={role.value} value={role.value}>
													{role.label}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
							</Stack>

							{requiresReportingOfficer && (
								<Controller
									name="inchargeId"
									control={control}
									rules={{ required: 'reporting_to is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="reporting_to"
											fullWidth
											error={!!errors.inchargeId}
											helperText={errors.inchargeId?.message}
											sx={textFieldStyles}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Apartment sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										>
											{users
												.filter(
													(candidate) => candidate.id !== user?.id && candidate.role !== 'VIEWER'
												)
												.map((candidate) => (
													<MenuItem key={candidate.id} value={candidate.id}>
														{candidate.name} ({candidate.designation || candidate.role})
													</MenuItem>
												))}
										</TextField>
									)}
								/>
							)}
						</Stack>
					</form>
				</Box>

				<Divider />

				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'editUserDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="edit-user-form"
							variant="contained"
							fullWidth
							disableElevation
							disabled={!isDirty || isLoading}
							sx={{
								bgcolor: 'primary.main',
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
								'&:hover': { bgcolor: 'primary.dark' },
							}}
						>
							Save Changes
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
