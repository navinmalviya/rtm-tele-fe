'use client';

import { Assignment, Close, Percent, Person } from '@mui/icons-material';
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
import { useProjects } from '@/hooks/project/useProjects';
import { useAddTask } from '@/hooks/task/useAddTask';
import { useUsers } from '@/hooks/user/useUsers';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const TEXT_FIELD_STYLES = {
	bgcolor: 'white',
	'& .MuiOutlinedInput-root': {
		borderRadius: 2,
		'& fieldset': { borderColor: '#E2E8F0' },
		'&:hover fieldset': { borderColor: '#CBD5E1' },
		'&.Mui-focused fieldset': { borderColor: '#3B82F6' },
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
		},
	});

	const selectedType = watch('type');

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'addTaskDrawer' }));
	};

	const onFormSubmit = (formData) => {
		const payload = { ...formData };

		// If not a Project task, we clear project-specific progress data
		if (payload.type !== 'Project') {
			payload.projectId = null;
			payload.weight = 0;
		}

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
					bgcolor: 'white',
				}}
			>
				{/* Header */}
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
							Dispatch Work Order
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
							Assign tasks to divisional staff
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: '#F1F5F9' }}>
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
										color: '#475569',
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
															<Assignment fontSize="small" sx={{ color: '#3B82F6' }} />
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
									sx={{ fontWeight: 700, mb: 2, color: '#475569', fontSize: '0.75rem' }}
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
															<Person fontSize="small" sx={{ color: '#6366F1' }} />
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
							{selectedType === 'PROJECT' && (
								<Box
									sx={{ p: 3, bgcolor: '#F0F9FF', borderRadius: 3, border: '1px solid #BAE6FD' }}
								>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0369A1' }}>
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

				<Box sx={{ p: 3, bgcolor: '#F8FAFC' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={handleClose}
							sx={{ fontWeight: 700, color: '#64748B' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="task-form"
							variant="contained"
							fullWidth
							disableElevation
							sx={{ bgcolor: '#3B82F6', py: 1.5, fontWeight: 700, borderRadius: 2 }}
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
