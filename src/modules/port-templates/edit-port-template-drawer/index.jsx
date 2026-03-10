'use client';

import {
	Bolt,
	Close,
	Lan,
	PowerSettingsNew,
	SettingsInputComponent,
	Speed,
} from '@mui/icons-material';
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
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useUpdatePortTemplate } from '@/hooks/port-templates';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const SPEED_OPTIONS = ['2Mb', '100 Mbps', '1 Gbps', '10 Gbps', '40 Gbps', '100 Gbps'];
const VOLTAGE_OPTIONS = ['110V DC', '230V AC', '48V DC', '24V DC', '12V DC'];

const NETWORK_TYPES = [
	{ value: 'RJ45', label: 'RJ45 (Ethernet Copper)' },
	{ value: 'SFP_SLOT', label: 'SFP/SFP+ (Fiber/Trunk)' },
	{ value: 'E1', label: 'E1 Port (single E1)' },
	{ value: 'CONSOLE', label: 'Console (Serial/Management)' },
];

const POWER_TYPES = [{ value: 'TERMINAL_BLOCK', label: 'Terminal Block' }];

const SERIAL_TYPES = [
	{ value: 'DB9', label: 'DB9 (Serial)' },
	{ value: 'RS232', label: 'RS232 Standard' },
	{ value: 'RS485', label: 'RS485 Industrial' },
	{ value: 'RJ11', label: 'RJ11 (Telecom/Voice)' },
	{ value: 'V35', label: 'V.35 High Speed' },
];

export default function EditPortTemplateDrawer({ template }) {
	const dispatch = useDispatch();
	const { mutate: updatePortTemplate, isLoading } = useUpdatePortTemplate();

	const {
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			name: '',
			category: 'NETWORK',
			type: '',
			speed: '',
			voltage: '',
			isSFPInserted: false,
			sfpType: 'NOT_APPLICABLE',
		},
	});

	useEffect(() => {
		if (!template) return;
		reset({
			name: template.name || '',
			category: template.category || 'NETWORK',
			type: template.type || '',
			speed: template.speed || '',
			voltage: template.voltage || '',
			isSFPInserted: template.isSFPInserted || false,
			sfpType: template.sfpType || 'NOT_APPLICABLE',
		});
	}, [template, reset]);

	const selectedCategory = watch('category');
	const selectedType = watch('type');

	const handleCategoryChange = (e, onChange) => {
		onChange(e);
		setValue('type', '');
		setValue('speed', '');
		setValue('voltage', '');
	};

	const handleFormSubmit = (formData) => {
		if (!template?.id) return;
		const payload = { ...formData };
		if (payload.category === 'POWER') {
			payload.speed = null;
			payload.isSFPInserted = false;
			payload.sfpType = 'NOT_APPLICABLE';
		} else if (payload.category === 'SERIAL') {
			payload.speed = null;
			payload.voltage = null;
			payload.isSFPInserted = false;
		} else {
			payload.voltage = null;
		}
		updatePortTemplate(
			{ id: template.id, data: payload },
			{
				onSuccess: () => dispatch(closeDrawer({ drawerName: 'editPortTemplateDrawer' })),
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
		'& .MuiInputLabel-root': { color: 'text.secondary', fontWeight: 600 },
	};

	return (
		<RtmDrawer drawerName="editPortTemplateDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 520 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 4, pb: 2 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
								Edit Port Blueprint
							</Typography>
							<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mt: 0.5 }}>
								Update port template attributes
							</Typography>
						</Box>
						<IconButton
							onClick={() => dispatch(closeDrawer({ drawerName: 'editPortTemplateDrawer' }))}
							sx={{ bgcolor: 'action.hover' }}
						>
							<Close fontSize="small" />
						</IconButton>
					</Stack>
				</Box>

				<Divider sx={{ mx: 4, borderColor: 'divider' }} />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
					<form id="port-template-edit-form" onSubmit={handleSubmit(handleFormSubmit)}>
						<Stack spacing={4}>
							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 800,
										mb: 3,
										color: 'text.primary',
										fontSize: '0.75rem',
										letterSpacing: '0.1em',
									}}
								>
									CLASSIFICATION
								</Typography>
								<Stack spacing={3}>
									<Controller
										name="name"
										control={control}
										rules={{ required: 'Name is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Blueprint Name"
												fullWidth
												error={!!errors.name}
												sx={textFieldStyles}
												placeholder="e.g. RS232 Management Port"
											/>
										)}
									/>

									<Controller
										name="category"
										control={control}
										render={({ field: { value, onChange } }) => (
											<TextField
												select
												label="Category"
												fullWidth
												value={value}
												onChange={(e) => handleCategoryChange(e, onChange)}
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															{value === 'NETWORK' && (
																<Lan fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />
															)}
															{value === 'POWER' && (
																<PowerSettingsNew
																	fontSize="small"
																	sx={{ color: 'warning.main', mr: 1 }}
																/>
															)}
															{value === 'SERIAL' && (
																<SettingsInputComponent
																	fontSize="small"
																	sx={{ color: 'secondary.main', mr: 1 }}
																/>
															)}
														</InputAdornment>
													),
												}}
											>
												<MenuItem value="NETWORK">Network / Data</MenuItem>
												<MenuItem value="SERIAL">Serial / Low Speed</MenuItem>
												<MenuItem value="POWER">Power / Electrical</MenuItem>
											</TextField>
										)}
									/>

									<Controller
										name="type"
										control={control}
										rules={{ required: 'Required' }}
										render={({ field }) => (
											<TextField select label="Interface Type" fullWidth sx={textFieldStyles} {...field}>
												{selectedCategory === 'NETWORK' &&
													NETWORK_TYPES.map((opt) => (
														<MenuItem key={opt.value} value={opt.value}>
															{opt.label}
														</MenuItem>
													))}
												{selectedCategory === 'POWER' &&
													POWER_TYPES.map((opt) => (
														<MenuItem key={opt.value} value={opt.value}>
															{opt.label}
														</MenuItem>
													))}
												{selectedCategory === 'SERIAL' &&
													SERIAL_TYPES.map((opt) => (
														<MenuItem key={opt.value} value={opt.value}>
															{opt.label}
														</MenuItem>
													))}
											</TextField>
										)}
									/>
								</Stack>
							</Box>

							{selectedType && (
								<Box
									sx={(theme) => ({
										p: 3.5,
										bgcolor: alpha(theme.palette.primary.main, 0.08),
										borderRadius: '24px',
										border: '1px solid',
										borderColor: alpha(theme.palette.primary.main, 0.2),
									})}
								>
									<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
										<Typography
											variant="subtitle2"
											sx={{
												fontWeight: 800,
												color: 'primary.dark',
												fontSize: '0.75rem',
												letterSpacing: '0.05em',
											}}
										>
											{selectedCategory} SPECIFICATIONS
										</Typography>
										<Box
											sx={(theme) => ({
												bgcolor: alpha(theme.palette.primary.main, 0.16),
												px: 1.5,
												py: 0.5,
												borderRadius: '8px',
											})}
										>
											<Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: 'primary.main' }}>
												PHY: {selectedType}
											</Typography>
										</Box>
									</Stack>

									<Stack spacing={3}>
										{selectedCategory === 'NETWORK' && selectedType !== 'CONSOLE' && (
											<Controller
												name="speed"
												control={control}
												render={({ field }) => (
													<TextField
														select
														label="Interface Speed"
														fullWidth
														sx={textFieldStyles}
														{...field}
														InputProps={{
															startAdornment: (
																<InputAdornment position="start">
																	<Speed fontSize="small" sx={{ color: 'info.main', mr: 1 }} />
																</InputAdornment>
															),
														}}
													>
														{SPEED_OPTIONS.map((opt) => (
															<MenuItem key={opt} value={opt}>
																{opt}
															</MenuItem>
														))}
													</TextField>
												)}
											/>
										)}

										{selectedCategory === 'POWER' && (
											<Controller
												name="voltage"
												control={control}
												render={({ field }) => (
													<TextField
														select
														label="Nominal Voltage"
														fullWidth
														sx={textFieldStyles}
														{...field}
														InputProps={{
															startAdornment: (
																<InputAdornment position="start">
																	<Bolt fontSize="small" sx={{ color: 'warning.dark', mr: 1 }} />
																</InputAdornment>
															),
														}}
													>
														{VOLTAGE_OPTIONS.map((opt) => (
															<MenuItem key={opt} value={opt}>
																{opt}
															</MenuItem>
														))}
													</TextField>
												)}
											/>
										)}

										{selectedType === 'SFP_SLOT' && (
											<Box
												sx={{
													bgcolor: 'background.paper',
													p: 2,
													borderRadius: 2,
													border: '1px solid',
													borderColor: 'divider',
												}}
											>
												<Controller
													name="isSFPInserted"
													control={control}
													render={({ field: { value, onChange } }) => (
														<FormControlLabel
															control={
																<Switch checked={value} onChange={onChange} color="primary" />
															}
															label={
																<Typography variant="body2" sx={{ fontWeight: 800 }}>
																	SFP Module Included?
																</Typography>
															}
														/>
													)}
												/>
											</Box>
										)}
									</Stack>
								</Box>
							)}
						</Stack>
					</form>
				</Box>

				<Divider sx={{ borderColor: 'divider' }} />

				<Box sx={{ p: 4, bgcolor: 'background.paper' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'editPortTemplateDrawer' }))}
							sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'none' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="port-template-edit-form"
							variant="contained"
							fullWidth
							disableElevation
							disabled={!isDirty || isLoading}
							sx={{
								bgcolor: 'primary.main',
								py: 2,
								fontWeight: 800,
								borderRadius: '16px',
								textTransform: 'none',
								fontSize: '1rem',
								'&:hover': { bgcolor: 'primary.dark' },
							}}
						>
							Save Changes
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
