'use client';

import { Close, Description, EventNote, RocketLaunch } from '@mui/icons-material';
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
import { useUpdateProject } from '@/hooks/project';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

const STATUS_OPTIONS = ['PLANNED', 'ONGOING', 'COMPLETED'];

export default function EditProjectDrawer({ project }) {
	const dispatch = useDispatch();
	const { mutate: updateProject, isLoading } = useUpdateProject();

	const {
		control,
		handleSubmit,
		reset,
		formState: { isDirty },
	} = useForm({
		defaultValues: {
			name: '',
			description: '',
			status: 'PLANNED',
			endDate: '',
		},
	});

	useEffect(() => {
		if (!project) return;
		reset({
			name: project.name || '',
			description: project.description || '',
			status: project.status || 'PLANNED',
			endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
		});
	}, [project, reset]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'editProjectDrawer' }));
	};

	const handleFormSubmit = (payload) => {
		if (!project?.id) return;
		updateProject(
			{ id: project.id, payload },
			{
				onSuccess: () => {
					handleClose();
				},
			}
		);
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
		<RtmDrawer drawerName="editProjectDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 500 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Edit Project
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Update active project details
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
					<form id="edit-project-form" onSubmit={handleSubmit(handleFormSubmit)}>
						<Stack spacing={3}>
							<Controller
								name="name"
								control={control}
								rules={{ required: 'Project name is required' }}
								render={({ field, fieldState }) => (
									<TextField
										{...field}
										label="Project Title"
										fullWidth
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
										sx={textFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<RocketLaunch fontSize="small" sx={{ color: 'primary.main' }} />
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
										label="Description"
										fullWidth
										multiline
										rows={3}
										sx={textFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
													<Description fontSize="small" sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>

							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
								<Controller
									name="status"
									control={control}
									render={({ field }) => (
										<TextField {...field} select label="Status" fullWidth sx={textFieldStyles}>
											{STATUS_OPTIONS.map((status) => (
												<MenuItem key={status} value={status}>
													{status}
												</MenuItem>
											))}
										</TextField>
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
											onFocus={openNativeDateTimePicker}
											onClick={openNativeDateTimePicker}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<EventNote fontSize="small" sx={{ color: 'warning.main' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
							</Stack>
						</Stack>
					</form>
				</Box>

				<Divider />

				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						<Button variant="text" fullWidth onClick={handleClose} sx={{ fontWeight: 700 }}>
							Cancel
						</Button>
						<RtmLoadingButton
							type="submit"
							form="edit-project-form"
							variant="contained"
							fullWidth
							disableElevation
							loading={isLoading}
							loadingText="Saving..."
							disabled={!isDirty}
						>
							Save Changes
						</RtmLoadingButton>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
