'use client';

import { Assignment, Close, Percent, Person } from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	FormControlLabel,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useProjects } from '@/hooks/project/useProjects';
import { useAddTask } from '@/hooks/task/useAddTask';
import { useUsers } from '@/hooks/user/useUsers';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const TEXT_FIELD_STYLES = {
	bgcolor: 'background.paper',
	'& .MuiOutlinedInput-root': {
		borderRadius: 2,
		'& fieldset': { borderColor: 'divider' },
		'&:hover fieldset': { borderColor: 'text.disabled' },
		'&.Mui-focused fieldset': { borderColor: 'primary.main' },
	},
};

const AddTaskDrawer = () => {
	const dispatch = useDispatch();
	const { mutate: addTask } = useAddTask();
	const { data: projects = [] } = useProjects();
	const { data: users = [] } = useUsers();

	const {
		control,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			title: '',
			description: '',
			type: 'FAILURE',
			priority: 'MEDIUM',
			assignedToId: '',
			projectId: '',
			weight: 0,
			failureInTime: '',
			isHqRepeated: false,
			isIcmsRepeated: false,
		},
	});

	const selectedType = watch('type');

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'addTaskDrawer' }));
	};

	const onFormSubmit = (formData) => {
		const payload = { ...formData };

		// If not a Project task, we clear project-specific progress data
		if (payload.type !== 'PROJECT') {
			payload.projectId = null;
			payload.weight = 0;
		}

		if (payload.type === 'FAILURE') {
			payload.failureData = {
				failureInTime: new Date(payload.failureInTime).toISOString(),
				isHqRepeated: Boolean(payload.isHqRepeated),
				isIcmsRepeated: Boolean(payload.isIcmsRepeated),
			};
		} else {
			payload.failureData = undefined;
		}

		delete payload.failureInTime;
		delete payload.isHqRepeated;
		delete payload.isIcmsRepeated;

		console.log('taskPayload', payload);
		addTask(payload);
		reset();
	};

	return (
		<RtmDrawer drawerName="addTaskDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 550 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				{/* Header */}
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Dispatch Work Order
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Assign tasks to divisional staff
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
					<form id="task-form" onSubmit={handleSubmit(onFormSubmit)}>
						<Stack spacing={4}>
							{/* 1. Identification Section */}
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
									TASK IDENTIFICATION
								</Typography>
								<Stack spacing={3}>
									<Controller
										name="title"
										control={control}
										rules={{ required: 'Subject is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Task Subject / Title"
												fullWidth
												error={!!errors.title}
												sx={TEXT_FIELD_STYLES}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Assignment fontSize="small" sx={{ color: 'primary.main' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>

									<Controller
										name="description"
										control={control}
										rules={{ required: 'Description is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Briefing / Notes"
												fullWidth
												multiline
												rows={3}
												error={!!errors.description}
												sx={TEXT_FIELD_STYLES}
											/>
										)}
									/>
								</Stack>
							</Box>

							{/* 2. Classification & Assignment */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', fontSize: '0.75rem' }}
								>
									CLASSIFICATION & ASSIGNMENT
								</Typography>
								<Stack spacing={3}>
									<Stack direction="row" spacing={2}>
										<Controller
											name="type"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Work Type"
													fullWidth
													sx={TEXT_FIELD_STYLES}
												>
													<MenuItem value="FAILURE">Failure</MenuItem>
													<MenuItem value="MAINTENANCE">Maintenance</MenuItem>
													<MenuItem value="TRC">TRC Request</MenuItem>
													<MenuItem value="PROJECT">Planned Project Work</MenuItem>
												</TextField>
											)}
										/>
										<Controller
											name="priority"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Priority"
													fullWidth
													sx={TEXT_FIELD_STYLES}
												>
													<MenuItem value="LOW">Low</MenuItem>
													<MenuItem value="MEDIUM">Medium</MenuItem>
													<MenuItem value="HIGH">High</MenuItem>
													<MenuItem value="CRITICAL">Critical</MenuItem>
												</TextField>
											)}
										/>
									</Stack>

									<Controller
										name="assignedToId"
										control={control}
										rules={{ required: 'Assignee is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Assign To"
												fullWidth
												error={!!errors.assignedToId}
												sx={TEXT_FIELD_STYLES}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Person fontSize="small" sx={{ color: 'info.main' }} />
														</InputAdornment>
													),
												}}
											>
												{users.map((u) => (
													<MenuItem key={u.id} value={u.id}>
														{u.name} ({u.designation})
													</MenuItem>
												))}
											</TextField>
										)}
									/>
								</Stack>
							</Box>

							{/* 3. Conditional Project Task Metrics */}
							{selectedType === 'FAILURE' && (
								<Box
									sx={(theme) => ({
										p: 3,
										bgcolor: alpha(theme.palette.error.main, 0.06),
										borderRadius: 3,
										border: '1px solid',
										borderColor: alpha(theme.palette.error.main, 0.2),
									})}
								>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
										FAILURE REPORTING
									</Typography>
									<Stack spacing={2}>
										<Controller
											name="failureInTime"
											control={control}
											rules={{ required: 'Failure in time is required' }}
											render={({ field }) => (
												<TextField
													{...field}
													type="datetime-local"
													label="Failure In Time"
													fullWidth
													error={!!errors.failureInTime}
													helperText={errors.failureInTime?.message}
													InputLabelProps={{ shrink: true }}
													sx={TEXT_FIELD_STYLES}
												/>
											)}
										/>
										<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
											<Controller
												name="isHqRepeated"
												control={control}
												render={({ field }) => (
													<FormControlLabel
														control={<Switch checked={Boolean(field.value)} onChange={(_, checked) => field.onChange(checked)} />}
														label="Repeated to HQ"
													/>
												)}
											/>
											<Controller
												name="isIcmsRepeated"
												control={control}
												render={({ field }) => (
													<FormControlLabel
														control={<Switch checked={Boolean(field.value)} onChange={(_, checked) => field.onChange(checked)} />}
														label="Repeated to ICMS"
													/>
												)}
											/>
										</Stack>
									</Stack>
								</Box>
							)}

							{/* 4. Conditional Project Task Metrics */}
							{selectedType === 'PROJECT' && (
								<Box
									sx={(theme) => ({
										p: 3,
										bgcolor: alpha(theme.palette.primary.main, 0.08),
										borderRadius: 3,
										border: '1px solid',
										borderColor: alpha(theme.palette.primary.main, 0.2),
									})}
								>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'primary.dark' }}>
										PROJECT STRATEGY
									</Typography>
									<Stack direction="row" spacing={2}>
										<Controller
											name="projectId"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Link Project"
													fullWidth
													sx={TEXT_FIELD_STYLES}
												>
													<MenuItem value="">None</MenuItem>
													{projects.map((p) => (
														<MenuItem key={p.id} value={p.id}>
															{p.name}
														</MenuItem>
													))}
												</TextField>
											)}
										/>
										<Controller
											name="weight"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													type="number"
													label="Weight %"
													fullWidth
													sx={TEXT_FIELD_STYLES}
													InputProps={{
														endAdornment: (
															<InputAdornment position="end">
																<Percent fontSize="inherit" />
															</InputAdornment>
														),
													}}
												/>
											)}
										/>
									</Stack>
								</Box>
							)}
						</Stack>
					</form>
				</Box>

				<Divider />

				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={handleClose}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="task-form"
							variant="contained"
							fullWidth
							disableElevation
							sx={{ bgcolor: 'primary.main', py: 1.5, fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: 'primary.dark' } }}
						>
							Dispatch Work
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
};

export default AddTaskDrawer;
