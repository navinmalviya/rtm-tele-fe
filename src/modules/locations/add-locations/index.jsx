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
import { useParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddLocation } from '@/hooks/locations';
import { useUsers } from '@/hooks/user';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const SUPERVISOR_ROLES = [
	'JE_SSE_TELE_SECTIONAL',
	'SSE_TELE_INCHARGE',
	'SSE_SNT_OFFICE',
	'SSE_TECH',
];

export default function AddLocationForm() {
	const dispatch = useDispatch();
	const { mutate: addLocation } = useAddLocation();
	const { data: users = [] } = useUsers();
	const { stationId } = useParams();
	const supervisors = users.filter((user) => SUPERVISOR_ROLES.includes(user.role));

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: '',
			description: '',
			supervisorId: '',
		},
	});

	const handleLocationSubmit = (locationData) => {
		const payload = {
			locationData,
			stationId,
		};
		console.log('payload==>', payload);

		addLocation(payload);
		reset();
		dispatch(closeDrawer({ drawerName: 'addLocationDrawer' }));
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
		<RtmDrawer drawerName="addLocationDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 500 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				{/* Header Section */}
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
							New Location
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Define a physical room or area
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'addLocationDrawer' }))}
						sx={{ bgcolor: 'action.hover' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				{/* Form Body */}
				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="location-form" onSubmit={handleSubmit(handleLocationSubmit)}>
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
												placeholder="Select JE/SSE in-charge for this location"
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

							{/* Info Callout */}
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
									This location will be tied to the current station. Racks and equipment can later
									be placed inside this location.
								</Typography>
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
							onClick={() => dispatch(closeDrawer({ drawerName: 'addLocationDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="location-form"
							variant="contained"
							fullWidth
							disableElevation
							sx={{
								bgcolor: 'primary.main',
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
								'&:hover': { bgcolor: 'primary.dark' },
							}}
						>
							Create Location
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
