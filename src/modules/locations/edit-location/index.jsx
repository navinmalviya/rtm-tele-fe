'use client';

import { Close, Description, Engineering, MapsHomeWork, PushPin } from '@mui/icons-material';
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
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useUpdateLocation } from '@/hooks/locations';
import { useUsers } from '@/hooks/user';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const SUPERVISOR_ROLES = [
	'JE_SSE_TELE_SECTIONAL',
	'SSE_TELE_INCHARGE',
	'SSE_SNT_OFFICE',
	'SSE_TECH',
];

export default function EditLocationDrawer({ location, stationId }) {
	const dispatch = useDispatch();
	const { mutate: updateLocation, isLoading } = useUpdateLocation(stationId);
	const { data: users = [] } = useUsers();
	const supervisors = users.filter((user) => SUPERVISOR_ROLES.includes(user.role));

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			name: '',
			description: '',
			supervisorId: '',
		},
	});

	useEffect(() => {
		if (!location) return;
		reset({
			name: location.name || '',
			description: location.description || '',
			supervisorId: location.supervisor?.id || location.supervisorId || '',
		});
	}, [location, reset]);

	const handleLocationSubmit = (data) => {
		if (!location?.id) return;
		updateLocation({ id: location.id, data });
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
		<RtmDrawer drawerName="editLocationDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 500 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				<Box
					sx={{
						p: 3,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Edit Location
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Update room details and notes
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'editLocationDrawer' }))}
						sx={{ bgcolor: 'action.hover' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="location-edit-form" onSubmit={handleSubmit(handleLocationSubmit)}>
						<Stack spacing={4}>
							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										mb: 2,
										color: 'text.secondary',
										letterSpacing: '1px',
									}}
								>
									LOCATION DETAILS
								</Typography>
								<Stack spacing={3}>
									<Controller
										name="name"
										control={control}
										rules={{
											required: 'Location name is required',
										}}
										render={({ field }) => (
											<TextField
												{...field}
												label="Location Name"
												placeholder="e.g. OFC Hut, SM Office, Relay Room"
												fullWidth
												error={!!errors.name}
												helperText={errors.name?.message}
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<MapsHomeWork sx={{ color: 'primary.main' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>

									<Controller
										name="description"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label="Description (Optional)"
												placeholder="Briefly describe the purpose or notes for this room"
												multiline
												rows={4}
												fullWidth
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment
															position="start"
															sx={{ alignSelf: 'flex-start', mt: 1.5 }}
														>
															<Description sx={{ color: 'text.secondary' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>

									<Controller
										name="supervisorId"
										control={control}
										rules={{ required: 'Supervisor is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Location Supervisor"
												fullWidth
												error={!!errors.supervisorId}
												helperText={errors.supervisorId?.message}
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Engineering sx={{ color: 'primary.main' }} />
														</InputAdornment>
													),
												}}
											>
												{supervisors.map((user) => (
													<MenuItem key={user.id} value={user.id}>
														{user.name} ({user.designation || user.role})
													</MenuItem>
												))}
											</TextField>
										)}
									/>
								</Stack>
							</Box>

							<Box
								sx={(theme) => ({
									p: 2,
									bgcolor: alpha(theme.palette.primary.main, 0.08),
									borderRadius: 2,
									border: '1px solid',
									borderColor: alpha(theme.palette.primary.main, 0.2),
									display: 'flex',
									gap: 2,
								})}
							>
								<PushPin sx={{ color: 'primary.main', mt: 0.2 }} fontSize="small" />
								<Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 500 }}>
									Changes here will reflect across racks and equipment linked to this location.
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
							onClick={() => dispatch(closeDrawer({ drawerName: 'editLocationDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="location-edit-form"
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
