'use client';

import {
	Apartment,
	Close,
	HourglassBottom,
	Stairs,
	ToggleOn,
	TrendingUp,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useCreateEscalationMatrix, useUpdateEscalationMatrix } from '@/hooks/escalation-matrix';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { ESCALATION_ROLE_OPTIONS, formatRoleLabel } from '@/modules/users/role-options';

export default function EscalationDrawer({ drawerName, mode = 'create', row = null }) {
	const dispatch = useDispatch();
	const { mutate: createEscalation, isLoading: creating } = useCreateEscalationMatrix();
	const { mutate: updateEscalation, isLoading: updating } = useUpdateEscalationMatrix();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			level: 1,
			targetRole: 'JE_SSE_TELE_SECTIONAL',
			durationMinutes: 60,
			isActive: true,
		},
	});

	useEffect(() => {
		if (mode === 'edit' && row) {
			reset({
				level: row.level ?? 1,
				targetRole: row.targetRole ?? 'JE_SSE_TELE_SECTIONAL',
				durationMinutes: row.durationMinutes ?? 60,
				isActive: row.isActive ?? true,
			});
			return;
		}

		reset({
			level: 1,
			targetRole: 'JE_SSE_TELE_SECTIONAL',
			durationMinutes: 60,
			isActive: true,
		});
	}, [mode, reset, row]);

	const textFieldStyles = {
		bgcolor: 'background.paper',
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
			'& fieldset': { borderColor: 'divider' },
			'&:hover fieldset': { borderColor: 'text.disabled' },
			'&.Mui-focused fieldset': { borderColor: 'primary.main' },
		},
	};

	const closeCurrentDrawer = () => dispatch(closeDrawer({ drawerName }));

	const onSubmit = (formData) => {
		const payload = {
			level: Number(formData.level),
			targetRole: formData.targetRole,
			durationMinutes: Number(formData.durationMinutes),
			isActive: Boolean(formData.isActive),
		};

		if (mode === 'edit' && row?.id) {
			updateEscalation(
				{ id: row.id, data: payload },
				{
					onSuccess: () => {
						closeCurrentDrawer();
					},
				}
			);
			return;
		}

		createEscalation(payload, {
			onSuccess: () => {
				closeCurrentDrawer();
				reset();
			},
		});
	};

	return (
		<RtmDrawer drawerName={drawerName}>
			<Box
				sx={{
					width: { xs: '100vw', sm: 480 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							{mode === 'edit' ? 'Edit Escalation Level' : 'Add Escalation Level'}
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Set role transition and duration window
						</Typography>
					</Box>
					<IconButton onClick={closeCurrentDrawer} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id={`${drawerName}-form`} onSubmit={handleSubmit(onSubmit)}>
						<Stack spacing={3}>
							<Controller
								name="level"
								control={control}
								rules={{
									required: 'Level is required',
									min: { value: 1, message: 'Minimum level is 1' },
								}}
								render={({ field }) => (
									<TextField
										{...field}
										type="number"
										label="Escalation Level"
										fullWidth
										error={!!errors.level}
										helperText={errors.level?.message}
										sx={textFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Stairs sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>

							<Controller
								name="targetRole"
								control={control}
								rules={{ required: 'Target role is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										select
										label="Escalate To Role"
										fullWidth
										error={!!errors.targetRole}
										helperText={errors.targetRole?.message}
										sx={textFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<TrendingUp sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									>
										{ESCALATION_ROLE_OPTIONS.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												{option.label}
											</MenuItem>
										))}
									</TextField>
								)}
							/>

							<Controller
								name="durationMinutes"
								control={control}
								rules={{
									required: 'Duration is required',
									min: { value: 1, message: 'Duration must be at least 1 minute' },
								}}
								render={({ field }) => (
									<TextField
										{...field}
										type="number"
										label="Duration (minutes)"
										fullWidth
										error={!!errors.durationMinutes}
										helperText={errors.durationMinutes?.message}
										sx={textFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<HourglassBottom sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>

							<Controller
								name="isActive"
								control={control}
								render={({ field }) => (
									<Stack
										direction="row"
										alignItems="center"
										justifyContent="space-between"
										sx={{
											px: 2,
											py: 1.5,
											borderRadius: 2,
											border: '1px solid',
											borderColor: 'divider',
											bgcolor: 'background.paper',
										}}
									>
										<Stack direction="row" spacing={1} alignItems="center">
											<ToggleOn sx={{ color: 'success.main' }} />
											<Box>
												<Typography sx={{ fontWeight: 700, fontSize: '0.86rem' }}>
													Active Level
												</Typography>
												<Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
													Disable to keep step in draft state.
												</Typography>
											</Box>
										</Stack>
										<Switch
											checked={Boolean(field.value)}
											onChange={(e) => field.onChange(e.target.checked)}
										/>
									</Stack>
								)}
							/>

							<Box
								sx={{
									p: 2,
									borderRadius: 2,
									bgcolor: 'action.hover',
									border: '1px dashed',
									borderColor: 'divider',
								}}
							>
								<Stack direction="row" spacing={1} alignItems="center">
									<Apartment sx={{ color: 'text.secondary', fontSize: 18 }} />
									<Typography
										sx={{ color: 'text.secondary', fontSize: '0.78rem', fontWeight: 600 }}
									>
										Escalation will notify the selected role after the configured duration.
									</Typography>
								</Stack>
							</Box>

							{mode === 'edit' && row?.targetRole && (
								<Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
									Current role: {formatRoleLabel(row.targetRole)}
								</Typography>
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
							onClick={closeCurrentDrawer}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form={`${drawerName}-form`}
							variant="contained"
							fullWidth
							disableElevation
							disabled={mode === 'edit' ? !isDirty || updating : creating}
							sx={{
								bgcolor: 'primary.main',
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
								'&:hover': { bgcolor: 'primary.dark' },
							}}
						>
							{mode === 'edit' ? 'Save Changes' : 'Add Level'}
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
