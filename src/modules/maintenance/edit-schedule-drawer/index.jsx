'use client';

import {
	CalendarMonth,
	Close,
	DeviceHub,
	EventRepeat,
	Route,
	SwapHoriz,
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
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useEquipmentByStation } from '@/hooks/equipment';
import { useStationLocations } from '@/hooks/locations';
import { useUpdateMaintenanceSchedule } from '@/hooks/maintenance';
import { useStations } from '@/hooks/stations';
import { useSubsections } from '@/hooks/sub-sections';
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

const scheduleTypeOptions = [
	{ value: 'STATION_INSPECTION_MAINTENANCE', label: 'Station Inspection & Maintenance' },
	{ value: 'CABLE_TESTING', label: 'Cable Testing' },
	{ value: 'EC_SOCKET_TESTING', label: 'EC Socket Testing' },
	{ value: 'CUSTOM', label: 'Custom Schedule' },
];

const scopeOptions = [
	{ value: 'STATION', label: 'Station' },
	{ value: 'SUBSECTION', label: 'Sub-section' },
];

const frequencyOptions = [
	{ value: 'DAILY', label: 'Daily' },
	{ value: 'WEEKLY', label: 'Weekly' },
	{ value: 'MONTHLY', label: 'Monthly' },
	{ value: 'QUARTERLY', label: 'Quarterly' },
	{ value: 'HALFYEARLY', label: 'Half-Yearly' },
	{ value: 'YEARLY', label: 'Yearly' },
];

const supervisorRoles = ['JE_SSE_TELE_SECTIONAL', 'SSE_TELE_INCHARGE'];

const stationLabel = (station) =>
	`${station?.data?.label || station?.name || station?.code} (${station?.data?.code || station?.code || '-'})`;

const EditMaintenanceScheduleDrawer = ({ schedule }) => {
	const dispatch = useDispatch();
	const { mutate: updateSchedule } = useUpdateMaintenanceSchedule();
	const { data: stations = [] } = useStations();
	const { data: users = [] } = useUsers();
	const { data: subsections = [] } = useSubsections();

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
			scheduleType: 'CUSTOM',
			targetScope: 'STATION',
			frequency: 'MONTHLY',
			nextDueDate: '',
			allowedVarianceDays: 5,
			remindBeforeDays: 3,
			stationId: '',
			subsectionId: '',
			equipmentId: '',
			locationId: '',
			supervisorId: '',
			isJointSchedule: 'false',
			jointDepartment: '',
			jointFrequency: '',
			escalationRole: 'SSE_TELE_INCHARGE',
		},
	});

	const selectedScope = watch('targetScope');
	const selectedStationId = watch('stationId');
	const selectedSubsectionId = watch('subsectionId');
	const isJointSchedule = watch('isJointSchedule') === 'true';
	const isPaused = schedule?.status === 'PAUSED';

	const { data: equipments = [] } = useEquipmentByStation(selectedStationId);
	const { data: locations = [] } = useStationLocations(selectedStationId);

	const filteredSupervisors = useMemo(
		() => users.filter((user) => supervisorRoles.includes(user.role)),
		[users]
	);

	useEffect(() => {
		if (!schedule) return;
		reset({
			title: schedule.title || '',
			description: schedule.description || '',
			scheduleType: schedule.scheduleType || 'CUSTOM',
			targetScope: schedule.targetScope || 'STATION',
			frequency: schedule.frequency || 'MONTHLY',
			nextDueDate: schedule.nextDueDate ? schedule.nextDueDate.split('T')[0] : '',
			allowedVarianceDays: schedule.allowedVarianceDays ?? 5,
			remindBeforeDays: schedule.remindBeforeDays ?? 3,
			stationId: schedule.stationId || schedule.station?.id || '',
			subsectionId: schedule.subsectionId || schedule.subsection?.id || '',
			equipmentId: schedule.equipmentId || schedule.equipment?.id || '',
			locationId: schedule.locationId || schedule.location?.id || '',
			supervisorId: schedule.supervisorId || schedule.supervisor?.id || '',
			isJointSchedule: schedule.isJointSchedule ? 'true' : 'false',
			jointDepartment: schedule.jointDepartment || '',
			jointFrequency: schedule.jointFrequency || '',
			escalationRole: schedule.escalationRole || 'SSE_TELE_INCHARGE',
		});
	}, [schedule, reset]);

	useEffect(() => {
		if (selectedScope === 'STATION') {
			setValue('subsectionId', '');
		} else {
			setValue('stationId', '');
			setValue('equipmentId', '');
			setValue('locationId', '');
		}
	}, [selectedScope, setValue]);

	useEffect(() => {
		if (!selectedStationId || selectedScope !== 'STATION') return;
		const station = stations.find((item) => item.id === selectedStationId);
		if (station?.supervisor?.id) {
			setValue('supervisorId', station.supervisor.id);
		}
	}, [selectedScope, selectedStationId, setValue, stations]);

	useEffect(() => {
		if (!selectedSubsectionId || selectedScope !== 'SUBSECTION') return;
		const subsection = subsections.find((item) => item.id === selectedSubsectionId);
		if (subsection?.supervisor?.id) {
			setValue('supervisorId', subsection.supervisor.id);
		}
	}, [selectedScope, selectedSubsectionId, setValue, subsections]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'editMaintenanceScheduleDrawer' }));
	};

	const onSubmit = (formData) => {
		const payload = {
			title: formData.title || null,
			description: formData.description || null,
			scheduleType: formData.scheduleType,
			targetScope: formData.targetScope,
			frequency: formData.frequency,
			nextDueDate: formData.nextDueDate,
			allowedVarianceDays: Number.parseInt(formData.allowedVarianceDays || 5, 10),
			remindBeforeDays: Number.parseInt(formData.remindBeforeDays || 3, 10),
			stationId: formData.targetScope === 'STATION' ? formData.stationId || null : null,
			subsectionId: formData.targetScope === 'SUBSECTION' ? formData.subsectionId || null : null,
			equipmentId: formData.targetScope === 'STATION' ? formData.equipmentId || null : null,
			locationId: formData.targetScope === 'STATION' ? formData.locationId || null : null,
			supervisorId: formData.supervisorId || null,
			isJointSchedule: formData.isJointSchedule === 'true',
			jointDepartment:
				formData.isJointSchedule === 'true' ? formData.jointDepartment || null : null,
			jointFrequency: formData.isJointSchedule === 'true' ? formData.jointFrequency || null : null,
			escalationRole: formData.escalationRole || 'SSE_TELE_INCHARGE',
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
							Update schedule metadata and assignment
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
					<form id="maintenance-edit-form" onSubmit={handleSubmit(onSubmit)}>
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
										helperText={errors.title?.message}
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

							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
								<Controller
									name="scheduleType"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="Schedule Type"
											fullWidth
											sx={textFieldStyles}
											disabled={isPaused}
										>
											{scheduleTypeOptions.map((item) => (
												<MenuItem key={item.value} value={item.value}>
													{item.label}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
								<Controller
									name="targetScope"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="Target Scope"
											fullWidth
											sx={textFieldStyles}
											disabled={isPaused}
										>
											{scopeOptions.map((item) => (
												<MenuItem key={item.value} value={item.value}>
													{item.label}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
							</Stack>

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
											disabled={isPaused}
										>
											{frequencyOptions.map((item) => (
												<MenuItem key={item.value} value={item.value}>
													{item.label}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
								<Controller
									name="nextDueDate"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Next Due Date"
											type="date"
											fullWidth
											sx={textFieldStyles}
											disabled={isPaused}
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

							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
								<Controller
									name="allowedVarianceDays"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											type="number"
											label="Completion Window (+/- days)"
											fullWidth
											sx={textFieldStyles}
											disabled={isPaused}
											inputProps={{ min: 0, max: 15 }}
										/>
									)}
								/>
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
											disabled={isPaused}
											inputProps={{ min: 0, max: 30 }}
										/>
									)}
								/>
							</Stack>

							<Controller
								name="isJointSchedule"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										select
										label="Jointly done?"
										fullWidth
										sx={textFieldStyles}
										disabled={isPaused}
									>
										<MenuItem value="false">No</MenuItem>
										<MenuItem value="true">Yes</MenuItem>
									</TextField>
								)}
							/>

							{isJointSchedule && (
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
									<Controller
										name="jointDepartment"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label="Joint Department"
												fullWidth
												sx={textFieldStyles}
												disabled={isPaused}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<SwapHoriz fontSize="small" sx={{ color: 'primary.main' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
									<Controller
										name="jointFrequency"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Joint Frequency"
												fullWidth
												sx={textFieldStyles}
												disabled={isPaused}
											>
												<MenuItem value="">Use base frequency</MenuItem>
												{frequencyOptions.map((item) => (
													<MenuItem key={item.value} value={item.value}>
														{item.label}
													</MenuItem>
												))}
											</TextField>
										)}
									/>
								</Stack>
							)}

							{selectedScope === 'STATION' && (
								<>
									<Controller
										name="stationId"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Station"
												fullWidth
												sx={textFieldStyles}
												disabled={isPaused}
											>
												{stations.map((station) => (
													<MenuItem key={station.id} value={station.id}>
														{stationLabel(station)}
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
													<MenuItem value="">No equipment selected</MenuItem>
													{equipments.map((eq) => (
														<MenuItem key={eq.id} value={eq.id}>
															{eq.name}
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
													<MenuItem value="">No location selected</MenuItem>
													{locations.map((loc) => (
														<MenuItem key={loc.id} value={loc.id}>
															{loc.name}
														</MenuItem>
													))}
												</TextField>
											)}
										/>
									</Stack>
								</>
							)}

							{selectedScope === 'SUBSECTION' && (
								<Controller
									name="subsectionId"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="Sub-section"
											fullWidth
											sx={textFieldStyles}
											disabled={isPaused}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Route fontSize="small" sx={{ color: 'primary.main' }} />
													</InputAdornment>
												),
											}}
										>
											{subsections.map((item) => (
												<MenuItem key={item.id} value={item.id}>
													{item.code} • {item.name}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
							)}

							<Controller
								name="supervisorId"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										select
										label="Assigned JE/SSE"
										fullWidth
										sx={textFieldStyles}
										disabled={isPaused}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<DeviceHub fontSize="small" sx={{ color: 'primary.main' }} />
												</InputAdornment>
											),
										}}
									>
										{filteredSupervisors.map((user) => (
											<MenuItem key={user.id} value={user.id}>
												{user.name} ({user.designation || user.role})
											</MenuItem>
										))}
									</TextField>
								)}
							/>

							<Controller
								name="description"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Notes"
										fullWidth
										multiline
										rows={3}
										sx={textFieldStyles}
										disabled={isPaused}
									/>
								)}
							/>
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
