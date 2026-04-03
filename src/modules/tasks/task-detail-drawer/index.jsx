'use client';

import {
	Assignment,
	Close,
	DeleteOutline,
	ErrorOutline,
	ExpandMore,
	FactCheck,
	Flag,
	Group,
	LocationOn,
	ReportProblem,
	Schedule,
	Timeline,
	Tune,
} from '@mui/icons-material';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Autocomplete,
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Divider,
	FormControlLabel,
	IconButton,
	InputAdornment,
	MenuItem,
	Paper,
	Stack,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useStationLocations } from '@/hooks/locations';
import { useStations } from '@/hooks/stations';
import {
	useAddTaskComment,
	useDeleteTask,
	useTask,
	useUpdateTask,
	useUpdateTaskFailure,
} from '@/hooks/task';
import { useUsers } from '@/hooks/user';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoader from '@/lib/common/loader';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';
import { FAILURE_CAUSES, FAILURE_TYPES, FAILURE_TYPE_LABELS } from '../constants';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const formatEnumLabel = (value) =>
	value
		?.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());

const getFailureTypeLabel = (value) => FAILURE_TYPE_LABELS[value] || formatEnumLabel(value);

const formatDateTime = (value) => {
	if (!value) return '';
	const date = new Date(value);
	return date.toLocaleString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

const toLocalDateTimeInputValue = (value) => {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
	return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
};

const formatHistoryAction = (value) => {
	if (!value) return 'Activity';
	return value
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function TaskDetailDrawer() {
	const dispatch = useDispatch();
	const { data: session } = useSession();
	const drawerState = useSelector((state) => state.drawers.taskDetailDrawer);
	const taskId = drawerState?.taskId;

	const { data: task, isLoading } = useTask(taskId);
	const { mutate: updateTaskDetails, isLoading: isUpdatingTask } = useUpdateTask(taskId);
	const { mutate: saveFailure, isLoading: isSaving } = useUpdateTaskFailure(taskId);
	const { mutate: addComment, isLoading: isCommenting } = useAddTaskComment(taskId);
	const { mutate: deleteTask, isLoading: isDeleting } = useDeleteTask();
	const { data: stations = [] } = useStations();
	const { data: users = [] } = useUsers();

	const {
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			type: '',
			cause: '',
			isHqRepeated: false,
			isIcmsRepeated: false,
			stationId: '',
			locationId: '',
			restorationTime: '',
			remarks: '',
		},
	});

	const {
		control: taskControl,
		handleSubmit: handleTaskSubmit,
		reset: resetTaskForm,
		formState: { errors: taskErrors, isDirty: isTaskDirty },
	} = useForm({
		defaultValues: {
			title: '',
			description: '',
			priority: 'MEDIUM',
			assignedToId: '',
		},
	});

	const {
		control: commentControl,
		handleSubmit: handleCommentSubmit,
		reset: resetComment,
		formState: { errors: commentErrors },
	} = useForm({
		defaultValues: {
			content: '',
		},
	});

	const selectedStationId = watch('stationId');
	const stationId = task?.failure?.stationId || '';
	const { data: locations = [] } = useStationLocations(selectedStationId || stationId);

	useEffect(() => {
		if (!task) return;
		if (task.type !== 'FAILURE') return;

		reset({
			type: task.failure?.type || '',
			cause: task.failure?.cause || '',
			isHqRepeated: Boolean(task.failure?.isHqRepeated),
			isIcmsRepeated: Boolean(task.failure?.isIcmsRepeated),
			stationId: task.failure?.stationId || '',
			locationId: task.failure?.locationId || '',
			restorationTime: task.failure?.restorationTime
				? toLocalDateTimeInputValue(task.failure.restorationTime)
				: '',
			remarks: task.failure?.remarks || '',
		});
	}, [task, reset]);

	useEffect(() => {
		if (!task) return;
		resetTaskForm({
			title: task.title || '',
			description: task.description || '',
			priority: task.priority || 'MEDIUM',
			assignedToId: task.assignedToId || '',
		});
	}, [task, resetTaskForm]);

	useEffect(() => {
		if (!selectedStationId) {
			setValue('locationId', '');
		}
	}, [selectedStationId, setValue]);

	const headerMeta = useMemo(() => {
		if (!task) return null;
		return [
			{ label: 'Type', value: formatEnumLabel(task.type), icon: <ErrorOutline /> },
			{ label: 'Priority', value: formatEnumLabel(task.priority), icon: <Flag /> },
			{ label: 'Status', value: formatEnumLabel(task.status), icon: <Timeline /> },
			{ label: 'Assigned', value: task.assignedTo?.name || 'Unassigned', icon: <Group /> },
		];
	}, [task]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'taskDetailDrawer' }));
	};

	const canDeleteTask = useMemo(() => {
		const role = session?.user?.role;
		const userId = session?.user?.id;
		if (!task || !role) return false;
		return (
			role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'TESTROOM' || task.ownerId === userId
		);
	}, [session?.user?.id, session?.user?.role, task]);

	const canEditTask = useMemo(() => {
		const role = session?.user?.role;
		const userId = session?.user?.id;
		if (!task || !role) return false;
		return (
			role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'TESTROOM' || task.ownerId === userId
		);
	}, [session?.user?.id, session?.user?.role, task]);

	if (!taskId) {
		return null;
	}

	const onTaskDetailsSubmit = (formData) => {
		updateTaskDetails({
			title: formData.title?.trim(),
			description: formData.description?.trim(),
			priority: formData.priority,
			assignedToId: formData.assignedToId || null,
		});
	};

	const onSubmit = (formData) => {
		const payload = {
			...formData,
			restorationTime: formData.restorationTime
				? new Date(formData.restorationTime).toISOString()
				: null,
			locationId: formData.locationId || null,
			stationId: formData.stationId || null,
		};
		saveFailure(payload);
	};

	const onAddComment = (data) => {
		if (!data.content?.trim()) return;
		addComment({ content: data.content.trim() });
		resetComment();
	};

	return (
		<RtmDrawer drawerName="taskDetailDrawer">
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
							Task Details
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							{task?.title || 'Loading task'}
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
					{isLoading || !task ? (
						<RtmLoader label="Loading task details..." minHeight={240} />
					) : (
						<>
							<Paper
								variant="outlined"
								sx={{
									p: 2,
									mb: 3,
									borderRadius: 3,
									borderColor: 'divider',
									bgcolor: 'background.default',
								}}
							>
								<Box
									sx={{
										display: 'grid',
										gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
										gap: 2,
									}}
								>
									{headerMeta?.map((item) => (
										<Box
											key={item.label}
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 1.5,
												px: 1.5,
												py: 1,
												borderRadius: 2,
												bgcolor: 'background.paper',
												border: '1px solid',
												borderColor: 'divider',
												minWidth: 0,
											}}
										>
											<Box
												sx={{
													width: 36,
													height: 36,
													borderRadius: '50%',
													bgcolor: 'action.hover',
													color: 'primary.main',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												{item.icon}
											</Box>
											<Box sx={{ minWidth: 0 }}>
												<Typography
													sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary' }}
												>
													{item.label}
												</Typography>
												<Typography
													sx={{
														fontSize: '0.8rem',
														fontWeight: 800,
														color: 'text.primary',
														whiteSpace: 'nowrap',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
													}}
												>
													{item.value}
												</Typography>
											</Box>
										</Box>
									))}
								</Box>
							</Paper>

							<Paper
								variant="outlined"
								sx={{
									p: 2.5,
									mb: 3,
									borderRadius: 3,
									borderColor: 'divider',
									bgcolor: 'background.paper',
								}}
							>
								<form id="task-core-form" onSubmit={handleTaskSubmit(onTaskDetailsSubmit)}>
									<Stack spacing={2}>
										<Stack direction="row" spacing={1} alignItems="center">
											<Assignment sx={{ color: 'primary.main' }} />
											<Typography
												variant="subtitle2"
												sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '1px' }}
											>
												TASK DETAILS
											</Typography>
										</Stack>

										<Controller
											name="title"
											control={taskControl}
											rules={{ required: 'Title is required' }}
											render={({ field }) => (
												<TextField
													{...field}
													label="Title"
													fullWidth
													disabled={!canEditTask}
													error={!!taskErrors.title}
													helperText={taskErrors.title?.message}
												/>
											)}
										/>

										<Controller
											name="description"
											control={taskControl}
											rules={{ required: 'Description is required' }}
											render={({ field }) => <input type="hidden" {...field} />}
										/>

										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Controller
												name="priority"
												control={taskControl}
												render={({ field }) => (
													<TextField
														{...field}
														select
														label="Priority"
														fullWidth
														disabled={!canEditTask}
													>
														{PRIORITY_OPTIONS.map((value) => (
															<MenuItem key={value} value={value}>
																{formatEnumLabel(value)}
															</MenuItem>
														))}
													</TextField>
												)}
											/>

											<Controller
												name="assignedToId"
												control={taskControl}
												render={({ field }) => (
													<Autocomplete
														options={users}
														disabled={!canEditTask}
														value={users.find((user) => user.id === field.value) || null}
														onChange={(_, option) => field.onChange(option?.id || '')}
														isOptionEqualToValue={(option, value) => option.id === value.id}
														getOptionLabel={(option) =>
															`${option.name} (${option.designation || option.role})`
														}
														renderInput={(params) => (
															<TextField {...params} label="Assigned To" fullWidth />
														)}
													/>
												)}
											/>
										</Stack>

										{!canEditTask && (
											<Typography variant="caption" sx={{ color: 'text.secondary' }}>
												Only task owner/Testroom/Admin can edit task details.
											</Typography>
										)}
									</Stack>
								</form>
							</Paper>

							{task.type !== 'FAILURE' ? (
								<Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
									<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
										{formatEnumLabel(task.type)} details will be added next.
									</Typography>
									<Typography sx={{ color: 'text.secondary', mt: 1 }}>
										For now, only Failure tasks have structured detail forms.
									</Typography>
								</Box>
							) : (
								<form id="failure-task-form" onSubmit={handleSubmit(onSubmit)}>
									<Stack spacing={3}>
										<Paper
											variant="outlined"
											sx={{
												p: 2.5,
												borderRadius: 3,
												borderColor: 'divider',
												bgcolor: 'background.paper',
											}}
										>
											<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
												Summary
											</Typography>
											<Controller
												name="description"
												control={taskControl}
												rules={{ required: 'Summary is required' }}
												render={({ field }) => (
													<TextField
														{...field}
														label="Summary"
														fullWidth
														multiline
														minRows={3}
														sx={{ mt: 1 }}
														disabled={!canEditTask}
														error={!!taskErrors.description}
														helperText={taskErrors.description?.message}
													/>
												)}
											/>
										</Paper>

										<Stack direction="row" spacing={1} alignItems="center">
											<ReportProblem sx={{ color: 'warning.main' }} />
											<Typography
												variant="subtitle2"
												sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '1px' }}
											>
												FAILURE DETAILS
											</Typography>
										</Stack>

										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Controller
												name="type"
												control={control}
												rules={{ required: 'Failure type is required' }}
												render={({ field }) => (
													<TextField
														{...field}
														select
														label="Failure Type"
														fullWidth
														error={!!errors.type}
														helperText={errors.type?.message}
														InputProps={{
															startAdornment: (
																<InputAdornment position="start">
																	<ErrorOutline sx={{ fontSize: 18, color: 'text.secondary' }} />
																</InputAdornment>
															),
														}}
													>
														{FAILURE_TYPES.map((type) => (
															<MenuItem key={type} value={type}>
																{getFailureTypeLabel(type)}
															</MenuItem>
														))}
													</TextField>
												)}
											/>
											<Controller
												name="cause"
												control={control}
												rules={{ required: 'Cause is required' }}
												render={({ field }) => (
													<TextField
														{...field}
														select
														label="Cause of Failure"
														fullWidth
														error={!!errors.cause}
														helperText={errors.cause?.message}
														InputProps={{
															startAdornment: (
																<InputAdornment position="start">
																	<Tune sx={{ fontSize: 18, color: 'text.secondary' }} />
																</InputAdornment>
															),
														}}
													>
														{FAILURE_CAUSES.map((cause) => (
															<MenuItem key={cause} value={cause}>
																{formatEnumLabel(cause)}
															</MenuItem>
														))}
													</TextField>
												)}
											/>
										</Stack>

										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<TextField
												label="Failure In Time"
												value={toLocalDateTimeInputValue(task.failure?.failureInTime)}
												type="datetime-local"
												fullWidth
												disabled
												InputLabelProps={{ shrink: true }}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
														</InputAdornment>
													),
												}}
												helperText={
													task.failure?.failureInTime
														? 'Captured at task creation by Testroom'
														: 'Not captured'
												}
											/>
											<Stack
												direction={{ xs: 'column', sm: 'row' }}
												spacing={1}
												sx={{ alignItems: { xs: 'flex-start', md: 'center' }, px: 1 }}
											>
												<Controller
													name="isHqRepeated"
													control={control}
													render={({ field }) => (
														<FormControlLabel
															control={
																<Switch
																	checked={Boolean(field.value)}
																	onChange={(_, checked) => field.onChange(checked)}
																/>
															}
															label="Repeated to HQ"
														/>
													)}
												/>
												<Controller
													name="isIcmsRepeated"
													control={control}
													render={({ field }) => (
														<FormControlLabel
															control={
																<Switch
																	checked={Boolean(field.value)}
																	onChange={(_, checked) => field.onChange(checked)}
																/>
															}
															label="Repeated to ICMS"
														/>
													)}
												/>
											</Stack>
										</Stack>

										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
											<Controller
												name="stationId"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														select
														label="Station"
														fullWidth
														InputProps={{
															startAdornment: (
																<InputAdornment position="start">
																	<LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
																</InputAdornment>
															),
														}}
													>
														<MenuItem value="">None</MenuItem>
														{stations.map((station) => (
															<MenuItem key={station.id} value={station.id}>
																{station.data?.label || station.name} (
																{station.data?.code || station.code})
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
														label="Location"
														fullWidth
														disabled={!selectedStationId}
														InputProps={{
															startAdornment: (
																<InputAdornment position="start">
																	<LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
																</InputAdornment>
															),
														}}
													>
														<MenuItem value="">None</MenuItem>
														{locations.map((location) => (
															<MenuItem key={location.id} value={location.id}>
																{location.name}
															</MenuItem>
														))}
													</TextField>
												)}
											/>
										</Stack>

										<Controller
											name="restorationTime"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													label="Restoration Time"
													type="datetime-local"
													fullWidth
													InputLabelProps={{ shrink: true }}
													onFocus={openNativeDateTimePicker}
													onClick={openNativeDateTimePicker}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
															</InputAdornment>
														),
													}}
												/>
											)}
										/>

										<Controller
											name="remarks"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													label="Remarks"
													fullWidth
													multiline
													minRows={3}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<FactCheck sx={{ fontSize: 18, color: 'text.secondary' }} />
															</InputAdornment>
														),
													}}
												/>
											)}
										/>
									</Stack>
								</form>
							)}

							<Divider sx={{ my: 3 }} />

							<Stack spacing={2}>
								<Accordion
									disableGutters
									elevation={0}
									sx={{
										bgcolor: 'background.paper',
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: 2,
										'&:before': { display: 'none' },
									}}
								>
									<AccordionSummary expandIcon={<ExpandMore />}>
										<Stack
											direction="row"
											justifyContent="space-between"
											alignItems="center"
											sx={{ width: 1, pr: 1 }}
										>
											<Typography
												variant="subtitle2"
												sx={{ fontWeight: 800, color: 'text.secondary' }}
											>
												Activity History
											</Typography>
											<Typography variant="caption" sx={{ color: 'text.secondary' }}>
												{(task.history || []).length} events
											</Typography>
										</Stack>
									</AccordionSummary>
									<AccordionDetails>
										<Stack spacing={1.5}>
											{(task.history || []).map((entry) => (
												<Paper
													key={entry.id}
													variant="outlined"
													sx={{
														p: 1.75,
														borderRadius: 3,
														borderColor: 'divider',
														bgcolor: 'background.paper',
													}}
												>
													<Stack spacing={1}>
														<Stack
															direction="row"
															justifyContent="space-between"
															alignItems="center"
														>
															<Stack direction="row" spacing={1} alignItems="center">
																<Chip
																	size="small"
																	label={formatHistoryAction(entry.action)}
																	sx={{ fontWeight: 700 }}
																/>
																<Typography
																	sx={{
																		fontSize: '0.78rem',
																		color: 'text.primary',
																		fontWeight: 700,
																	}}
																>
																	{entry.actor?.name || 'System'}
																</Typography>
															</Stack>
															<Typography variant="caption" sx={{ color: 'text.secondary' }}>
																{formatDateTime(entry.createdAt)}
															</Typography>
														</Stack>
														{(entry.fromValue || entry.toValue) && (
															<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
																{entry.fromValue || 'N/A'} → {entry.toValue || 'N/A'}
															</Typography>
														)}
														{entry.details && (
															<Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
																{entry.details}
															</Typography>
														)}
													</Stack>
												</Paper>
											))}
											{(task.history || []).length === 0 && (
												<Typography sx={{ color: 'text.secondary' }}>
													No activity logged yet.
												</Typography>
											)}
										</Stack>
									</AccordionDetails>
								</Accordion>

								<Divider sx={{ my: 1 }} />

								<Stack direction="row" justifyContent="space-between" alignItems="center">
									<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
										Comments
									</Typography>
									<Typography variant="caption" sx={{ color: 'text.secondary' }}>
										{task._count?.comments || 0} entries
									</Typography>
								</Stack>

								<Paper
									variant="outlined"
									sx={{
										p: 2,
										borderRadius: 3,
										borderColor: 'divider',
										bgcolor: 'background.paper',
									}}
								>
									<form onSubmit={handleCommentSubmit(onAddComment)}>
										<Stack spacing={2}>
											<Controller
												name="content"
												control={commentControl}
												rules={{ required: 'Comment is required' }}
												render={({ field }) => (
													<TextField
														{...field}
														label="Add a comment"
														fullWidth
														multiline
														minRows={2}
														error={!!commentErrors.content}
														helperText={commentErrors.content?.message}
													/>
												)}
											/>
											<RtmLoadingButton
												type="submit"
												variant="contained"
												disableElevation
												loading={isCommenting}
												loadingText="Posting..."
												sx={{ alignSelf: 'flex-start' }}
											>
												Post Comment
											</RtmLoadingButton>
										</Stack>
									</form>
								</Paper>

								<Stack spacing={2}>
									{(task.comments || []).map((comment) => (
										<Paper
											key={comment.id}
											variant="outlined"
											sx={{
												p: 2,
												borderRadius: 3,
												borderColor: 'divider',
												bgcolor: 'background.paper',
											}}
										>
											<Stack direction="row" spacing={2} alignItems="flex-start">
												<Avatar sx={{ bgcolor: 'primary.main' }}>
													{comment.author?.name?.substring(0, 2)?.toUpperCase() || 'US'}
												</Avatar>
												<Box sx={{ flex: 1 }}>
													<Stack direction="row" justifyContent="space-between" alignItems="center">
														<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
															{comment.author?.name || 'Unknown'}
														</Typography>
														<Typography variant="caption" sx={{ color: 'text.secondary' }}>
															{formatDateTime(comment.createdAt)}
														</Typography>
													</Stack>
													<Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
														{comment.content}
													</Typography>
												</Box>
											</Stack>
										</Paper>
									))}
									{(task.comments || []).length === 0 && (
										<Typography sx={{ color: 'text.secondary' }}>
											No comments yet. Be the first to add one.
										</Typography>
									)}
								</Stack>
							</Stack>
						</>
					)}
				</Box>

				<Divider />

				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						{canDeleteTask && (
							<IconButton
								color="error"
								disabled={isDeleting}
								onClick={() => {
									if (!task?.id) return;
									const confirmDelete = window.confirm(
										'Delete this task from workflow overview? This action cannot be undone.'
									);
									if (!confirmDelete) return;
									deleteTask(task.id, {
										onSuccess: () => handleClose(),
									});
								}}
								sx={{
									border: '1px solid',
									borderColor: 'error.main',
									borderRadius: 2,
									width: 44,
									height: 44,
								}}
							>
								{isDeleting ? <CircularProgress size={18} color="inherit" /> : <DeleteOutline />}
							</IconButton>
						)}
						<Button variant="text" onClick={handleClose} sx={{ fontWeight: 700, minWidth: 110 }}>
							Close
						</Button>
						{canEditTask && (
							<RtmLoadingButton
								type="submit"
								form="task-core-form"
								variant="contained"
								disableElevation
								loading={isUpdatingTask}
								loadingText="Saving..."
								disabled={!isTaskDirty}
								sx={{ minWidth: 170 }}
							>
								Save Task Details
							</RtmLoadingButton>
						)}
						<RtmLoadingButton
							type="submit"
							form="failure-task-form"
							variant="contained"
							disableElevation
							loading={isSaving}
							loadingText="Saving..."
							disabled={task?.type !== 'FAILURE' || !isDirty}
							sx={{ minWidth: 170 }}
						>
							Save Failure Details
						</RtmLoadingButton>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
