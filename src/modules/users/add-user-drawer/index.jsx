'use client';

import {
	AdminPanelSettings,
	Apartment,
	Badge,
	Business,
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
import { alpha } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useCreateUser, useUsers } from '@/hooks/user';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import {
	ADMIN_ROLES,
	getReportingCandidates,
	OPTIONAL_REPORTING_ROLES,
	ROLE_OPTIONS,
} from '../role-options';

export default function AddUserDrawer() {
	const dispatch = useDispatch();
	const { data: session } = useSession();
	const divisionId = session?.user?.divisionId;
	const { mutate: createUser, isLoading } = useCreateUser();
	const { data: users = [] } = useUsers();

	const {
		control,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			name: '',
			email: '',
			username: '',
			password: '',
			designation: '',
			unit: '',
			role: 'JE_SSE_TELE_SECTIONAL',
			inchargeId: '',
		},
	});
	const selectedRole = watch('role');
	const selectedInchargeId = watch('inchargeId');
	const requiresReportingOfficer =
		!ADMIN_ROLES.has(selectedRole) && !OPTIONAL_REPORTING_ROLES.has(selectedRole);
	const reportingCandidates = useMemo(
		() => getReportingCandidates({ users, selectedRole }),
		[users, selectedRole]
	);

	useEffect(() => {
		if (!requiresReportingOfficer) return;
		if (!selectedInchargeId) return;
		const exists = reportingCandidates.some((candidate) => candidate.id === selectedInchargeId);
		if (!exists) {
			setValue('inchargeId', '', { shouldDirty: true, shouldTouch: true });
		}
	}, [requiresReportingOfficer, selectedInchargeId, reportingCandidates, setValue]);

	const handleCreateUser = (formData) => {
		if (!divisionId) return;
		createUser(
			{
				...formData,
				divisionId,
				unit: formData.unit || null,
				inchargeId: requiresReportingOfficer ? formData.inchargeId : null,
			},
			{
				onSuccess: () => {
					reset();
					dispatch(closeDrawer({ drawerName: 'addUserDrawer' }));
				},
			}
		);
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
		<RtmDrawer drawerName="addUserDrawer">
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
							Create User
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Employee Onboarding
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'addUserDrawer' }))}
						sx={{ bgcolor: 'action.hover' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="create-user-form" onSubmit={handleSubmit(handleCreateUser)}>
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
									rules={{ required: 'Password is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											label="Temporary Password"
											type="password"
											fullWidth
											error={!!errors.password}
											helperText={errors.password?.message}
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
									name="unit"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Unit / Office"
											placeholder="e.g. SSE/Tele/Exch/RTM"
											fullWidth
											sx={textFieldStyles}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Business sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
							</Stack>

							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
											{reportingCandidates.map((candidate) => (
												<MenuItem key={candidate.id} value={candidate.id}>
													{candidate.name} ({candidate.designation || candidate.role})
												</MenuItem>
											))}
											{reportingCandidates.length === 0 && (
												<MenuItem disabled value="">
													No valid reporting officers for selected role
												</MenuItem>
											)}
										</TextField>
									)}
								/>
							)}
							{!requiresReportingOfficer && OPTIONAL_REPORTING_ROLES.has(selectedRole) && (
								<Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
									`reporting_to` is optional for this role.
								</Typography>
							)}

							<Box
								sx={(theme) => ({
									p: 2,
									bgcolor: alpha(theme.palette.primary.main, 0.08),
									borderRadius: 2,
									border: '1px solid',
									borderColor: alpha(theme.palette.primary.main, 0.2),
								})}
							>
								<Typography sx={{ color: 'primary.dark', fontWeight: 600, fontSize: '0.8rem' }}>
									Users will be created under Division:{' '}
									<strong>{session?.user?.divisionCode || 'Unknown'}</strong>
								</Typography>
							</Box>
						</Stack>
					</form>
				</Box>

				<Divider />

				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'addUserDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<RtmLoadingButton
							type="submit"
							form="create-user-form"
							variant="contained"
							fullWidth
							disableElevation
							loading={isLoading}
							loadingText="Creating..."
							disabled={!divisionId || !isDirty}
							sx={{
								bgcolor: 'primary.main',
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
								'&:hover': { bgcolor: 'primary.dark' },
							}}
						>
							Create User
						</RtmLoadingButton>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
