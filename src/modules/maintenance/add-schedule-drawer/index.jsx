'use client';

import { CalendarMonth, Close, EventRepeat, Place } from '@mui/icons-material';
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
import { useEquipmentByStation } from '@/hooks/equipment';
import { useStationLocations } from '@/hooks/locations';
import { useAddMaintenanceSchedule } from '@/hooks/maintenance';
import { useStations } from '@/hooks/stations';
import { useUsers } from '@/hooks/user';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

const textFieldStyles = (theme) => ({
	bgcolor: theme.palette.background.paper,
	'& .MuiOutlinedInput-root': {
		borderRadius: 2,
		'& fieldset': { borderColor: theme.palette.divider },
		'&:hover fieldset': { borderColor: theme.palette.text.secondary },
		'&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
	},
});

const AddMaintenanceScheduleDrawer = () => {
	const dispatch = useDispatch();
	const { mutate: addSchedule } = useAddMaintenanceSchedule();
	const { data: stations = [] } = useStations();
	const { data: users = [] } = useUsers();

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			title: '',
			description: '',
			frequency: 'MONTHLY',
			nextDueDate: '',
			remindBeforeDays: 3,
			stationId: '',
			equipmentId: '',
			locationId: '',
			supervisorId: '',
		},
	});
	const selectedStationId = watch('stationId');
	const { data: equipments = [] } = useEquipmentByStation(selectedStationId);
	const { data: locations = [] } = useStationLocations(selectedStationId);

	useEffect(() => {
		setValue('equipmentId', '');
		setValue('locationId', '');
	}, [selectedStationId, setValue]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'addMaintenanceScheduleDrawer' }));
	};

	const onSubmit = (formData) => {
		const payload = {
			...formData,
			remindBeforeDays: Number.parseInt(formData.remindBeforeDays || 3, 10),
			equipmentId: formData.equipmentId || null,
			locationId: formData.locationId || null,
		};
		addSchedule(payload);
		reset();
	};

	return (
		<RtmDrawer drawerName="addMaintenanceScheduleDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 560 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Create Maintenance Schedule
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Preventive maintenance planning
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
					<form id="maintenance-schedule-form" onSubmit={handleSubmit(onSubmit)}>
						<Stack spacing={4}>
							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										mb: 2,
										color: 'text.secondary',
										fontSize: '0.75rem',
										letterSpacing: '1px',
									}}
								>
									SCHEDULE DETAILS
								</Typography>
								<Stack spacing={3}>
									<Controller
										name="title"
										control={control}
										rules={{ required: 'Title is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Schedule Title"
												fullWidth
												error={!!errors.title}
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<EventRepeat fontSize="small" sx={{ color: 'primary.main' }} />
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
												label="Maintenance Notes"
												fullWidth
												multiline
												rows={3}
												sx={textFieldStyles}
											/>
										)}
									/>
								</Stack>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', fontSize: '0.75rem' }}
								>
									CADENCE & TARGET
								</Typography>
								<Stack spacing={3}>
									<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
										<Controller
											name="frequency"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
												select
												label="Frequency"
												fullWidth
												sx={textFieldStyles}
											>
													<MenuItem value="DAILY">Daily</MenuItem>
													<MenuItem value="WEEKLY">Weekly</MenuItem>
													<MenuItem value="MONTHLY">Monthly</MenuItem>
													<MenuItem value="QUARTERLY">Quarterly</MenuItem>
													<MenuItem value="HALFYEARLY">Half-Yearly</MenuItem>
													<MenuItem value="YEARLY">Yearly</MenuItem>
												</TextField>
											)}
										/>
										<Controller
											name="nextDueDate"
											control={control}
											rules={{ required: 'Next due date is required' }}
											render={({ field }) => (
												<TextField
													{...field}
													label="Next Due Date"
													type="date"
													fullWidth
													error={!!errors.nextDueDate}
													sx={textFieldStyles}
													InputLabelProps={{ shrink: true }}
													onFocus={openNativeDateTimePicker}
													onClick={openNativeDateTimePicker}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<CalendarMonth fontSize="small" sx={{ color: 'primary.main' }} />
															</InputAdornment>
														),
													}}
												/>
											)}
										/>
									</Stack>

									<Controller
										name="remindBeforeDays"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												type="number"
												label="Remind Before (days)"
												fullWidth
												sx={textFieldStyles}
												inputProps={{ min: 0, max: 30 }}
											/>
										)}
									/>
								</Stack>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', fontSize: '0.75rem' }}
								>
									LOCATION & ASSET
								</Typography>
								<Stack spacing={3}>
									<Controller
										name="stationId"
										control={control}
										rules={{ required: 'Station is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Station"
												fullWidth
												error={!!errors.stationId}
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Place fontSize="small" sx={{ color: 'primary.main' }} />
														</InputAdornment>
													),
												}}
											>
												{stations.map((st) => (
													<MenuItem key={st.id} value={st.id}>
														{st?.data.label} ({st?.data.code})
													</MenuItem>
												))}
											</TextField>
										)}
									/>

									<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
										<Controller
											name="equipmentId"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Equipment (optional)"
													fullWidth
													sx={textFieldStyles}
													disabled={!selectedStationId}
												>
													<MenuItem value="">
														<Typography sx={{ color: 'text.secondary' }}>No equipment selected</Typography>
													</MenuItem>
													{equipments.map((eq) => (
														<MenuItem key={eq.id} value={eq.id}>
															{eq.name}
															{eq.rack?.location?.name ? ` • ${eq.rack.location.name}` : ''}
														</MenuItem>
													))}
												</TextField>
											)}
										/>
										<Controller
											name="locationId"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Location (optional)"
													fullWidth
													sx={textFieldStyles}
													disabled={!selectedStationId}
												>
													<MenuItem value="">
														<Typography sx={{ color: 'text.secondary' }}>No location selected</Typography>
													</MenuItem>
													{locations.map((loc) => (
														<MenuItem key={loc.id} value={loc.id}>
															{loc.name}
															{loc.description ? ` • ${loc.description}` : ''}
														</MenuItem>
													))}
												</TextField>
											)}
										/>
									</Stack>
								</Stack>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', fontSize: '0.75rem' }}
								>
									ASSIGNED SUPERVISOR
								</Typography>
								<Controller
									name="supervisorId"
									control={control}
									rules={{ required: 'Supervisor is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="Supervisor (JE/SSE)"
											fullWidth
											error={!!errors.supervisorId}
											helperText={errors.supervisorId?.message}
											sx={textFieldStyles}
										>
											{users
												.filter((user) =>
													[
														'JE_SSE_TELE_SECTIONAL',
														'JE_SECTIONAL',
														'SSE_SECTIONAL',
														'FIELD_ENGINEER',
													].includes(user.role)
												)
												.map((user) => (
													<MenuItem key={user.id} value={user.id}>
														{user.name} ({user.designation || user.role})
													</MenuItem>
												))}
										</TextField>
									)}
								/>
							</Box>
						</Stack>
					</form>
				</Box>

				<Divider />

				<Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
					<Button
						variant="outlined"
						onClick={handleClose}
						sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						type="submit"
						form="maintenance-schedule-form"
						sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
					>
						Create Schedule
					</Button>
				</Box>
			</Box>
		</RtmDrawer>
	);
};

export default AddMaintenanceScheduleDrawer;
