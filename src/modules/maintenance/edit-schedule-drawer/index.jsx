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
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useStations } from '@/hooks/stations';
import { useUpdateMaintenanceSchedule } from '@/hooks/maintenance';
import { useEquipmentByStation } from '@/hooks/equipment';
import { useStationLocations } from '@/hooks/locations';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const textFieldStyles = (theme) => ({
	bgcolor: theme.palette.background.paper,
	'& .MuiOutlinedInput-root': {
		borderRadius: 2,
		'& fieldset': { borderColor: theme.palette.divider },
		'&:hover fieldset': { borderColor: theme.palette.text.secondary },
		'&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
	},
});

const EditMaintenanceScheduleDrawer = ({ schedule }) => {
	const dispatch = useDispatch();
	const { mutate: updateSchedule } = useUpdateMaintenanceSchedule();
	const { data: stations = [] } = useStations();

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
		},
	});

	useEffect(() => {
		if (!schedule) return;
		reset({
			title: schedule.title || '',
			description: schedule.description || '',
			frequency: schedule.frequency || 'MONTHLY',
			nextDueDate: schedule.nextDueDate ? schedule.nextDueDate.split('T')[0] : '',
			remindBeforeDays: schedule.remindBeforeDays ?? 3,
			stationId: schedule.stationId || schedule.station?.id || '',
			equipmentId: schedule.equipmentId || schedule.equipment?.id || '',
			locationId: schedule.locationId || schedule.location?.id || '',
		});
	}, [schedule, reset]);

	const selectedStationId = watch('stationId');
	const { data: equipments = [] } = useEquipmentByStation(selectedStationId);
	const { data: locations = [] } = useStationLocations(selectedStationId);

	useEffect(() => {
		setValue('equipmentId', '');
		setValue('locationId', '');
	}, [selectedStationId, setValue]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'editMaintenanceScheduleDrawer' }));
	};

	const isPaused = schedule?.status === 'PAUSED';

	const onSubmit = (formData) => {
		const payload = {
			...formData,
			remindBeforeDays: Number.parseInt(formData.remindBeforeDays || 3, 10),
			equipmentId: formData.equipmentId || null,
			locationId: formData.locationId || null,
		};
		updateSchedule({ id: schedule.id, payload });
		reset();
		handleClose();
	};

	return (
		<RtmDrawer drawerName="editMaintenanceScheduleDrawer">
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
							Edit Maintenance Schedule
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Update schedule details
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
					<form id="maintenance-edit-form" onSubmit={handleSubmit(onSubmit)}>
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
			disabled={isPaused}
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
			disabled={isPaused}
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
		<TextField {...field} select label="Frequency" fullWidth sx={textFieldStyles} disabled={isPaused}>
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
			disabled={isPaused}
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
			disabled={isPaused}
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
			disabled={isPaused}
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
														{st.name} ({st.code})
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
			disabled={!selectedStationId || isPaused}
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
			disabled={!selectedStationId || isPaused}
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
						</Stack>
					</form>
				</Box>

				<Divider />

				<Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
					<Button variant="outlined" onClick={handleClose} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
						Cancel
					</Button>
					<Button
						variant="contained"
						type="submit"
						form="maintenance-edit-form"
						disabled={isPaused}
						sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
					>
						Save Changes
					</Button>
				</Box>
			</Box>
		</RtmDrawer>
	);
};

export default EditMaintenanceScheduleDrawer;
