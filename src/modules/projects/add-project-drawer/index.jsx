'use client';

import { CalendarMonth, Close, Description, EventNote, RocketLaunch } from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	IconButton,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddProject } from '@/hooks/project';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function AddProjectDrawer() {
	const dispatch = useDispatch();
	const { mutate: addProject } = useAddProject();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: '',
			description: '',
			startDate: new Date().toISOString().split('T')[0], // Default to today
			endDate: '',
		},
	});

	const handleFormSubmit = (formData) => {
		addProject(formData);
		reset();
	};

	// Shared styling for the Input boxes to match your design language
	const textFieldStyles = {
		bgcolor: 'white',
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
			'& fieldset': { borderColor: '#E2E8F0' },
			'&:hover fieldset': { borderColor: '#CBD5E1' },
			'&.Mui-focused fieldset': { borderColor: '#3B82F6' },
		},
		'& .MuiInputBase-input': { color: '#1E293B' },
		'& .MuiInputLabel-root': { color: '#64748B' },
	};

	return (
		<RtmDrawer drawerName="addProjectDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 500 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'white',
				}}
			>
				{/* 1. Header Section */}
				<Box
					sx={{
						p: 3,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
							Initiate New Project
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
							Infrastructure & Operational Planning
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'addProjectDrawer' }))}
						sx={{ bgcolor: '#F1F5F9' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				{/* 2. Form Content */}
				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
					<form id="project-form" onSubmit={handleSubmit(handleFormSubmit)}>
						<Stack spacing={4}>
							{/* General Information */}
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
									CORE PROJECT DETAILS
								</Typography>
								<Stack spacing={3}>
									<Controller
										name="name"
										control={control}
										rules={{ required: 'Project name is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Project Title"
												fullWidth
												error={!!errors.name}
												helperText={errors.name?.message}
												sx={textFieldStyles}
												placeholder="e.g. Monsoon Preparedness 2026"
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<RocketLaunch fontSize="small" sx={{ color: '#3B82F6' }} />
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
												label="Brief Description"
												fullWidth
												multiline
												rows={3}
												sx={textFieldStyles}
												placeholder="Outline the scope of work..."
												InputProps={{
													startAdornment: (
														<InputAdornment
															position="start"
															sx={{ alignSelf: 'flex-start', mt: 1.5 }}
														>
															<Description fontSize="small" sx={{ color: '#64748B' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
								</Stack>
							</Box>

							{/* Timeline Attributes */}
							<Box sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0' }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#475569' }}>
									TIMELINE & PLANNING
								</Typography>
								<Stack direction="row" spacing={2}>
									<Controller
										name="startDate"
										control={control}
										rules={{ required: 'Required' }}
										render={({ field }) => (
											<TextField
												{...field}
												type="date"
												label="Start Date"
												fullWidth
												sx={textFieldStyles}
												InputLabelProps={{ shrink: true }}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<CalendarMonth fontSize="small" sx={{ color: '#10B981' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
									<Controller
										name="endDate"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												type="date"
												label="Target End Date"
												fullWidth
												sx={textFieldStyles}
												InputLabelProps={{ shrink: true }}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<EventNote fontSize="small" sx={{ color: '#F59E0B' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
								</Stack>
							</Box>
						</Stack>
					</form>
				</Box>

				<Divider />

				{/* 3. Footer Actions */}
				<Box sx={{ p: 3, bgcolor: '#F8FAFC' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'addProjectDrawer' }))}
							sx={{ fontWeight: 700, color: '#64748B' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="project-form"
							variant="contained"
							fullWidth
							disableElevation
							sx={{
								bgcolor: '#3B82F6',
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
								'&:hover': { bgcolor: '#2563EB' },
							}}
						>
							Create Project
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
