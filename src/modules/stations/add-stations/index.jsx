'use client';

import { Close, Place } from '@mui/icons-material';
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
import { useSession } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddStation } from '@/hooks/stations';
import { useUsers } from '@/hooks/user';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const SUPERVISOR_ROLES = [
	'JE_SSE_TELE_SECTIONAL',
	'SSE_TELE_INCHARGE',
	'SSE_SNT_OFFICE',
	'SSE_TECH',
	'TCM',
];

export default function AddStationForm({ initialData }) {
	const dispatch = useDispatch();
	const { mutate: addStation } = useAddStation();
	const { data: session } = useSession();
	const { data: users = [] } = useUsers();
	const supervisorUsers = useMemo(
		() => users.filter((user) => SUPERVISOR_ROLES.includes(user.role)),
		[users]
	);

	const {
		control,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm({
		defaultValues: {
			code: '',
			name: '',
			mapX: initialData?.x || 0,
			mapY: initialData?.y || 0,
			supervisorIds: [],
			supervisorId: '',
		},
	});
	const selectedSupervisorIds = watch('supervisorIds');
	const selectedPrimarySupervisorId = watch('supervisorId');

	useEffect(() => {
		const validSelection = Array.isArray(selectedSupervisorIds) ? selectedSupervisorIds : [];
		if (!validSelection.length) {
			if (selectedPrimarySupervisorId) setValue('supervisorId', '');
			return;
		}
		if (!selectedPrimarySupervisorId || !validSelection.includes(selectedPrimarySupervisorId)) {
			setValue('supervisorId', validSelection[0]);
		}
	}, [selectedSupervisorIds, selectedPrimarySupervisorId, setValue]);

	const handleStationSubmit = (formData) => {
		const normalizedSupervisorIds = Array.isArray(formData.supervisorIds)
			? formData.supervisorIds
			: [];
		addStation({
			...formData,
			supervisorIds: normalizedSupervisorIds,
			supervisorId: formData.supervisorId || normalizedSupervisorIds[0] || '',
		});
		reset();
		dispatch(closeDrawer({ drawerName: 'addStationDrawer' }));
	};

	return (
		<RtmDrawer drawerName="addStationDrawer">
			{/* Header */}
			<Box
				sx={{
					p: 3,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					bgcolor: 'background.paper',
				}}
			>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Create Station
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
						Adding to Division: {session?.user?.divisionCode || '...'}
					</Typography>
				</Box>
				<IconButton
					onClick={() =>
						dispatch(
							closeDrawer({
								drawerName: 'addStationDrawer',
							})
						)
					}
					sx={{ bgcolor: 'action.hover' }}
				>
					<Close fontSize="small" />
				</IconButton>
			</Box>

			<Divider sx={{ borderColor: 'divider' }} />

			{/* Form Content */}
			<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
				<form id="station-form" onSubmit={handleSubmit(handleStationSubmit)}>
					<Stack spacing={4}>
						<Box>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: 700,
									mb: 2,
									color: 'text.secondary',
								}}
							>
								IDENTIFICATION
							</Typography>
							<Stack spacing={3}>
								<Controller
									name="code"
									control={control}
									rules={{
										required: 'Station code is required',
									}}
									render={({ field }) => (
										<TextField
											{...field}
											label="Station Code"
											placeholder="e.g. RTM"
											fullWidth
											error={!!errors.code}
											helperText={errors.code?.message}
											InputProps={{
												sx: {
													borderRadius: 2,
												},
												startAdornment: (
													<InputAdornment position="start">
														<Place
															sx={{
																color: 'primary.main',
																fontSize: 20,
															}}
														/>
													</InputAdornment>
												),
											}}
										/>
									)}
								/>

								<Controller
									name="name"
									control={control}
									rules={{
										required: 'Station name is required',
									}}
									render={({ field }) => (
										<TextField
											{...field}
											label="Station Name"
											placeholder="e.g. Ratlam Junction"
											fullWidth
											error={!!errors.name}
											helperText={errors.name?.message}
											InputProps={{
												sx: {
													borderRadius: 2,
												},
											}}
										/>
									)}
								/>
								<Controller
									name="supervisorIds"
									control={control}
									rules={{
										validate: (value) =>
											(Array.isArray(value) && value.length > 0) ||
											'Select at least one supervisor',
									}}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="Station Supervisors"
											fullWidth
											error={!!errors.supervisorIds}
											helperText={errors.supervisorIds?.message}
											SelectProps={{ multiple: true }}
											InputProps={{
												sx: {
													borderRadius: 2,
												},
											}}
										>
											{supervisorUsers.map((user) => (
												<MenuItem key={user.id} value={user.id}>
													{user.name} ({user.designation || user.role})
												</MenuItem>
											))}
										</TextField>
									)}
								/>
								<Controller
									name="supervisorId"
									control={control}
									rules={{ required: 'Primary supervisor is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="Primary Supervisor"
											fullWidth
											disabled={!selectedSupervisorIds?.length}
											error={!!errors.supervisorId}
											helperText={
												errors.supervisorId?.message ||
												'Default owner for station-level responsibility'
											}
											InputProps={{
												sx: {
													borderRadius: 2,
												},
											}}
										>
											{(selectedSupervisorIds || []).map((id) => {
												const user = supervisorUsers.find((candidate) => candidate.id === id);
												if (!user) return null;
												return (
													<MenuItem key={user.id} value={user.id}>
														{user.name} ({user.designation || user.role})
													</MenuItem>
												);
											})}
										</TextField>
									)}
								/>
							</Stack>
						</Box>

						<Box>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: 700,
									mb: 2,
									color: 'text.secondary',
								}}
							>
								TOPOLOGY POSITION (CANVAS)
							</Typography>
							<Stack direction="row" spacing={2}>
								<Controller
									name="mapX"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="X coordinate"
											type="number"
											fullWidth
											InputProps={{
												sx: {
													borderRadius: 2,
												},
											}}
										/>
									)}
								/>
								<Controller
									name="mapY"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Y coordinate"
											type="number"
											fullWidth
											InputProps={{
												sx: {
													borderRadius: 2,
												},
											}}
										/>
									)}
								/>
							</Stack>
						</Box>
					</Stack>
				</form>
			</Box>

			<Divider />

			{/* Footer Actions */}
			<Box sx={{ p: 3, bgcolor: 'background.default' }}>
				<Stack direction="row" spacing={2}>
					<Button
						variant="text"
						fullWidth
						onClick={() =>
							dispatch(
								closeDrawer({
									drawerName: 'addStationDrawer',
								})
							)
						}
						sx={{ color: 'text.secondary', fontWeight: 700 }}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="station-form"
						variant="contained"
						fullWidth
						disableElevation
						sx={{
							bgcolor: 'primary.main',
							borderRadius: 2.5,
							py: 1.5,
							fontWeight: 700,
							textTransform: 'none',
							fontSize: '1rem',
							'&:hover': { bgcolor: 'primary.dark' },
						}}
					>
						Save Station
					</Button>
				</Stack>
			</Box>
		</RtmDrawer>
	);
}
