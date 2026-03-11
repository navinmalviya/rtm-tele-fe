'use client';

import {
	CalendarMonth,
	Close,
	DeviceHub,
	EventRepeat,
	Place,
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
import { useAddMaintenanceSchedule } from '@/hooks/maintenance';
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
	{
		value: 'STATION_INSPECTION_MAINTENANCE',
		label: 'Station Inspection & Maintenance',
		defaultScope: 'STATION',
	},
	{ value: 'CABLE_TESTING', label: 'Cable Testing', defaultScope: 'SUBSECTION' },
	{ value: 'EC_SOCKET_TESTING', label: 'EC Socket Testing', defaultScope: 'SUBSECTION' },
	{ value: 'CUSTOM', label: 'Custom Schedule', defaultScope: 'STATION' },
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

const AddMaintenanceScheduleDrawer = () => {
	const dispatch = useDispatch();
	const { mutate: addSchedule } = useAddMaintenanceSchedule();
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
			scheduleType: 'STATION_INSPECTION_MAINTENANCE',
			targetScope: 'STATION',
			applyToAll: 'true',
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

	const selectedType = watch('scheduleType');
	const selectedScope = watch('targetScope');
	const applyToAll = watch('applyToAll') === 'true';
	const selectedStationId = watch('stationId');
	const selectedSubsectionId = watch('subsectionId');
	const isJointSchedule = watch('isJointSchedule') === 'true';
	const { data: equipments = [] } = useEquipmentByStation(selectedStationId);
	const { data: locations = [] } = useStationLocations(selectedStationId);

	const filteredSupervisors = useMemo(
		() => users.filter((user) => supervisorRoles.includes(user.role)),
		[users]
	);

	useEffect(() => {
		const typeConfig = scheduleTypeOptions.find((item) => item.value === selectedType);
		if (
			selectedType !== 'CUSTOM' &&
			typeConfig?.defaultScope &&
			selectedScope !== typeConfig.defaultScope
		) {
			setValue('targetScope', typeConfig.defaultScope);
		}
	}, [selectedScope, selectedType, setValue]);

	useEffect(() => {
		if (selectedScope === 'STATION') {
			setValue('subsectionId', '');
		}
		if (selectedScope === 'SUBSECTION') {
			setValue('stationId', '');
			setValue('equipmentId', '');
			setValue('locationId', '');
		}
	}, [selectedScope, setValue]);

	useEffect(() => {
		if (!selectedStationId) {
			setValue('equipmentId', '');
			setValue('locationId', '');
			return;
		}
		const station = stations.find((item) => item.id === selectedStationId);
		if (station?.supervisor?.id) {
			setValue('supervisorId', station.supervisor.id);
		}
	}, [selectedStationId, setValue, stations]);

	useEffect(() => {
		if (!selectedSubsectionId) return;
		const subsection = subsections.find((item) => item.id === selectedSubsectionId);
		if (subsection?.supervisor?.id) {
			setValue('supervisorId', subsection.supervisor.id);
		}
	}, [selectedSubsectionId, setValue, subsections]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'addMaintenanceScheduleDrawer' }));
	};

	const onSubmit = (formData) => {
		const payload = {
			title: formData.title || null,
			description: formData.description || null,
			scheduleType: formData.scheduleType,
			targetScope: formData.targetScope,
			applyToAll: formData.applyToAll === 'true',
			frequency: formData.frequency,
			nextDueDate: formData.nextDueDate,
			allowedVarianceDays: Number.parseInt(formData.allowedVarianceDays || 5, 10),
			remindBeforeDays: Number.parseInt(formData.remindBeforeDays || 3, 10),
			stationId:
				formData.targetScope === 'STATION' && formData.applyToAll !== 'true'
					? formData.stationId || null
					: null,
			subsectionId:
				formData.targetScope === 'SUBSECTION' && formData.applyToAll !== 'true'
					? formData.subsectionId || null
					: null,
			equipmentId:
				formData.targetScope === 'STATION' && formData.applyToAll !== 'true'
					? formData.equipmentId || null
					: null,
			locationId:
				formData.targetScope === 'STATION' && formData.applyToAll !== 'true'
					? formData.locationId || null
					: null,
			supervisorId: formData.applyToAll === 'true' ? null : formData.supervisorId || null,
			isJointSchedule: formData.isJointSchedule === 'true',
			jointDepartment:
				formData.isJointSchedule === 'true' ? formData.jointDepartment || null : null,
			jointFrequency: formData.isJointSchedule === 'true' ? formData.jointFrequency || null : null,
			escalationRole: formData.escalationRole || 'SSE_TELE_INCHARGE',
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
							Create Schedule Template
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Create once and fan-out to JE/SSE supervisors
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
									SCHEDULE BLUEPRINT
								</Typography>
								<Stack spacing={2}>
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
											>
												{scheduleTypeOptions.map((item) => (
													<MenuItem key={item.value} value={item.value}>
														{item.label}
													</MenuItem>
												))}
											</TextField>
										)}
									/>
									<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
													disabled={selectedType !== 'CUSTOM'}
												>
													{scopeOptions.map((item) => (
														<MenuItem key={item.value} value={item.value}>
															{item.label}
														</MenuItem>
													))}
												</TextField>
											)}
										/>
										<Controller
											name="applyToAll"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Coverage"
													fullWidth
													sx={textFieldStyles}
												>
													<MenuItem value="true">All in division</MenuItem>
													<MenuItem value="false">Specific target only</MenuItem>
												</TextField>
											)}
										/>
									</Stack>
									<Controller
										name="title"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label="Custom title (optional)"
												fullWidth
												helperText="Leave blank to auto-generate from schedule type."
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
								</Stack>
							</Box>

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
									CADENCE & COMPLIANCE
								</Typography>
								<Stack spacing={2}>
									<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
										<Controller
											name="frequency"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Base Frequency"
													fullWidth
													sx={textFieldStyles}
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
											rules={{ required: 'Next due date is required' }}
											render={({ field }) => (
												<TextField
													{...field}
													label="First Due Date"
													type="date"
													fullWidth
													error={!!errors.nextDueDate}
													helperText={errors.nextDueDate?.message}
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
													inputProps={{ min: 0, max: 30 }}
												/>
											)}
										/>
									</Stack>
								</Stack>
							</Box>

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
									JOINT TESTING
								</Typography>
								<Stack spacing={2}>
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
											>
												<MenuItem value="false">No</MenuItem>
												<MenuItem value="true">Yes</MenuItem>
											</TextField>
										)}
									/>
									{isJointSchedule && (
										<>
											<Controller
												name="jointDepartment"
												control={control}
												rules={{ required: 'Department is required for joint schedules' }}
												render={({ field }) => (
													<TextField
														{...field}
														label="Joint Department"
														placeholder="e.g. Signal, TRD, Engineering"
														fullWidth
														error={!!errors.jointDepartment}
														helperText={errors.jointDepartment?.message}
														sx={textFieldStyles}
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
														label="Joint Frequency (optional)"
														fullWidth
														sx={textFieldStyles}
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
										</>
									)}
								</Stack>
							</Box>

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
									TARGET ASSIGNMENT
								</Typography>
								<Stack spacing={2}>
									{!applyToAll && selectedScope === 'STATION' && (
										<>
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
														helperText={errors.stationId?.message}
														sx={textFieldStyles}
														InputProps={{
															startAdornment: (
																<InputAdornment position="start">
																	<Place fontSize="small" sx={{ color: 'primary.main' }} />
																</InputAdornment>
															),
														}}
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
															disabled={!selectedStationId}
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
															disabled={!selectedStationId}
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

									{!applyToAll && selectedScope === 'SUBSECTION' && (
										<Controller
											name="subsectionId"
											control={control}
											rules={{ required: 'Sub-section is required' }}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Sub-section"
													fullWidth
													error={!!errors.subsectionId}
													helperText={errors.subsectionId?.message}
													sx={textFieldStyles}
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

									{!applyToAll && (
										<Controller
											name="supervisorId"
											control={control}
											rules={{ required: 'Supervisor is required for specific target' }}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Assigned JE/SSE"
													fullWidth
													error={!!errors.supervisorId}
													helperText={errors.supervisorId?.message}
													sx={textFieldStyles}
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
									)}
								</Stack>
							</Box>

							<Controller
								name="description"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Notes (optional)"
										fullWidth
										multiline
										rows={3}
										sx={textFieldStyles}
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
