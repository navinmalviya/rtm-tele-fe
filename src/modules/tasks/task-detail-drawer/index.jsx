'use client';

import {
	Close,
	ErrorOutline,
	FactCheck,
	Flag,
	Group,
	LocationOn,
	ReportProblem,
	Schedule,
	SettingsInputComponent,
	Tune,
	Timeline,
} from '@mui/icons-material';
import {
	Avatar,
	Box,
	Button,
	Divider,
	Chip,
	IconButton,
	InputAdornment,
	Paper,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useStations } from '@/hooks/stations';
import { useStationLocations } from '@/hooks/locations';
import { useSubsections } from '@/hooks/sub-sections';
import { useAddTaskComment, useTask, useUpdateTaskFailure } from '@/hooks/task';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

const FAILURE_TYPES = [
	'AXLE_COUTER',
	'BLOCK',
	'SECTION_CONTROL',
	'TPC_CONTROL',
	'SI_CONTROL',
	'PRS',
	'FOIS',
	'AUTO_PHONE',
	'RAILNET',
	'CMS_SERVER',
	'CGDB_BOARD',
	'PA_SYSTEM',
	'MISC',
];

const FAILURE_CAUSES = [
	'EQUIPMENT_FAILURE',
	'PATCH_CORD_FAILURE',
	'CABLE_CUT',
	'CABLE_DAMAGED',
	'PORT_FAILURE',
	'KRONE_FAILURE',
	'WAGO_FAILURE',
	'LOW_INSULATION',
	'HIGH_LOSS',
];

const formatEnumLabel = (value) =>
	value
		?.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());

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

const formatHistoryAction = (value) => {
	if (!value) return 'Activity';
	return value
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function TaskDetailDrawer() {
	const dispatch = useDispatch();
	const drawerState = useSelector((state) => state.drawers.taskDetailDrawer);
	const taskId = drawerState?.taskId;

	const { data: task, isLoading } = useTask(taskId);
	const { mutate: saveFailure, isLoading: isSaving } = useUpdateTaskFailure(taskId);
	const { mutate: addComment, isLoading: isCommenting } = useAddTaskComment(taskId);
	const { data: stations = [] } = useStations();
	const { data: subsections = [] } = useSubsections();

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
			stationId: '',
			locationId: '',
			subsectionId: '',
			restorationTime: '',
			remarks: '',
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
			stationId: task.failure?.stationId || '',
			locationId: task.failure?.locationId || '',
			subsectionId: task.failure?.subsectionId || '',
			restorationTime: task.failure?.restorationTime
				? new Date(task.failure.restorationTime).toISOString().slice(0, 16)
				: '',
			remarks: task.failure?.remarks || '',
		});
	}, [task, reset]);

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

	if (!taskId) {
		return null;
	}

	const onSubmit = (formData) => {
		const payload = {
			...formData,
			restorationTime: formData.restorationTime
				? new Date(formData.restorationTime).toISOString()
				: null,
			cctIn: formData.cctIn ? new Date(formData.cctIn).toISOString() : null,
			cctRt: formData.cctRt ? new Date(formData.cctRt).toISOString() : null,
			failureInAt: formData.failureInAt ? new Date(formData.failureInAt).toISOString() : null,
			failurePrtAt: formData.failurePrtAt ? new Date(formData.failurePrtAt).toISOString() : null,
			locationId: formData.locationId || null,
			subsectionId: formData.subsectionId || null,
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
						<Typography sx={{ color: 'text.secondary' }}>Loading details...</Typography>
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
												<Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary' }}>
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
											<Typography sx={{ color: 'text.secondary', mt: 1 }}>
												{task.description || 'No description provided.'}
											</Typography>
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
																{formatEnumLabel(type)}
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
																{station.data?.label || station.name} ({station.data?.code || station.code})
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
											name="subsectionId"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Sub-section"
													fullWidth
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<SettingsInputComponent sx={{ fontSize: 18, color: 'text.secondary' }} />
															</InputAdornment>
														),
													}}
												>
													<MenuItem value="">None</MenuItem>
													{subsections.map((sub) => (
														<MenuItem key={sub.id} value={sub.id}>
															{sub.name} ({sub.code})
														</MenuItem>
													))}
												</TextField>
											)}
										/>

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
								<Stack spacing={2}>
									<Stack direction="row" justifyContent="space-between" alignItems="center">
										<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
											Activity History
										</Typography>
										<Typography variant="caption" sx={{ color: 'text.secondary' }}>
											{(task.history || []).length} events
										</Typography>
									</Stack>

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
													<Stack direction="row" justifyContent="space-between" alignItems="center">
														<Stack direction="row" spacing={1} alignItems="center">
															<Chip
																size="small"
																label={formatHistoryAction(entry.action)}
																sx={{ fontWeight: 700 }}
															/>
															<Typography sx={{ fontSize: '0.78rem', color: 'text.primary', fontWeight: 700 }}>
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
								</Stack>

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
											<Button
												type="submit"
												variant="contained"
												disableElevation
												disabled={isCommenting}
												sx={{ alignSelf: 'flex-start' }}
											>
												{isCommenting ? 'Posting...' : 'Post Comment'}
											</Button>
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
						<Button variant="text" fullWidth onClick={handleClose} sx={{ fontWeight: 700 }}>
							Close
						</Button>
						<Button
							type="submit"
							form="failure-task-form"
							variant="contained"
							fullWidth
							disableElevation
							disabled={task?.type !== 'FAILURE' || isSaving || !isDirty}
						>
							{isSaving ? 'Saving...' : 'Save Failure Details'}
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
