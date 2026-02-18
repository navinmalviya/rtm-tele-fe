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
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddPortTemplate } from '@/hooks/port-templates';
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

export default function AddPortTemplateDrawer() {
	const dispatch = useDispatch();
	const { mutate: addPortTemplate } = useAddPortTemplate();

	const {
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
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

	const selectedCategory = watch('category');
	const selectedType = watch('type');
	const isSFPEnabled = watch('isSFPInserted');

	const handleCategoryChange = (e, onChange) => {
		onChange(e);
		setValue('type', '');
		setValue('speed', '');
		setValue('voltage', '');
	};

	const handleFormSubmit = (formData) => {
		const payload = { ...formData };
		// Data Cleaning based on Category
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
		addPortTemplate(payload);
		reset();
		dispatch(closeDrawer({ drawerName: 'addPortTemplateDrawer' }));
	};

	const textFieldStyles = {
		bgcolor: 'white',
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
			'& fieldset': { borderColor: '#E2E8F0' },
			'&:hover fieldset': { borderColor: '#CBD5E1' },
			'&.Mui-focused fieldset': { borderColor: '#3B82F6' },
		},
		'& .MuiInputLabel-root': { color: '#64748B', fontWeight: 600 },
	};

	return (
		<RtmDrawer drawerName="addPortTemplateDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 520 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'white',
				}}
			>
				{/* Header Section */}
				<Box sx={{ p: 4, pb: 2 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B' }}>
								New Port Blueprint
							</Typography>
							<Typography variant="body2" sx={{ fontWeight: 600, color: '#64748B', mt: 0.5 }}>
								Physical Interface Library
							</Typography>
						</Box>
						<IconButton
							onClick={() => dispatch(closeDrawer({ drawerName: 'addPortTemplateDrawer' }))}
							sx={{ bgcolor: '#F1F5F9' }}
						>
							<Close fontSize="small" />
						</IconButton>
					</Stack>
				</Box>

				<Divider sx={{ mx: 4, borderColor: '#F1F5F9' }} />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
					<form id="port-template-form" onSubmit={handleSubmit(handleFormSubmit)}>
						<Stack spacing={4}>
							{/* Section 1: Classification */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 800,
										mb: 3,
										color: '#1E293B',
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
																<Lan fontSize="small" sx={{ color: '#3B82F6', mr: 1 }} />
															)}
															{value === 'POWER' && (
																<PowerSettingsNew
																	fontSize="small"
																	sx={{ color: '#F59E0B', mr: 1 }}
																/>
															)}
															{value === 'SERIAL' && (
																<SettingsInputComponent
																	fontSize="small"
																	sx={{ color: '#8B5CF6', mr: 1 }}
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
											<TextField
												select
												label="Interface Type"
												fullWidth
												sx={textFieldStyles}
												{...field}
											>
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

							{/* Section 2: Technical Specs (Containerized) */}
							{selectedType && (
								<Box
									sx={{
										p: 3.5,
										bgcolor: '#F0F9FF',
										borderRadius: '24px',
										border: '1px solid #BAE6FD',
									}}
								>
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										sx={{ mb: 3 }}
									>
										<Typography
											variant="subtitle2"
											sx={{
												fontWeight: 800,
												color: '#0369A1',
												fontSize: '0.75rem',
												letterSpacing: '0.05em',
											}}
										>
											{selectedCategory} SPECIFICATIONS
										</Typography>
										<Box sx={{ bgcolor: '#DBEAFE', px: 1.5, py: 0.5, borderRadius: '8px' }}>
											<Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#2563EB' }}>
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
																	<Speed fontSize="small" sx={{ color: '#6366F1', mr: 1 }} />
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
																	<Bolt fontSize="small" sx={{ color: '#D97706', mr: 1 }} />
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
													bgcolor: 'white',
													p: 2,
													borderRadius: 2,
													border: '1px solid #E2E8F0',
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

				<Divider sx={{ borderColor: '#F1F5F9' }} />

				{/* Footer Actions */}
				<Box sx={{ p: 4, bgcolor: 'white' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'addPortTemplateDrawer' }))}
							sx={{ fontWeight: 800, color: '#64748B', textTransform: 'none' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="port-template-form"
							variant="contained"
							fullWidth
							disableElevation
							sx={{
								bgcolor: '#3B82F6',
								py: 2,
								fontWeight: 800,
								borderRadius: '16px',
								textTransform: 'none',
								fontSize: '1rem',
							}}
						>
							Save Blueprint
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
