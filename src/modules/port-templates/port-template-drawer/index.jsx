'use client';

import { Bolt, Cable, Close, Lan, PowerSettingsNew, Speed } from '@mui/icons-material';
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

const SPEED_OPTIONS = ['100 Mbps', '1 Gbps', '10 Gbps', '40 Gbps', '100 Gbps'];
const VOLTAGE_OPTIONS = ['110V DC', '230V AC', '48V DC', '24V DC', '12V DC'];

const NETWORK_TYPES = [
	{ value: 'RJ45', label: 'RJ45 (Ethernet Copper)' },
	{ value: 'SFP_SLOT', label: 'SFP/SFP+ (Fiber/Trunk)' },
	{ value: 'CONSOLE', label: 'Console (Serial/Management)' },
];

const POWER_TYPES = [{ value: 'TERMINAL_BLOCK', label: 'Terminal Block' }];

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
		if (payload.category === 'POWER') {
			payload.speed = null;
			payload.isSFPInserted = false;
			payload.sfpType = 'NOT_APPLICABLE';
		} else {
			payload.voltage = null;
		}
		addPortTemplate(payload);
		reset();
		dispatch(closeDrawer({ drawerName: 'addPortTemplateDrawer' }));
	};

	// FIX: Forces the dropdown menu (Paper) to be white and styled
	const customSelectProps = {
		MenuProps: {
			PaperProps: {
				sx: {
					bgcolor: 'white',
					backgroundImage: 'none',
					boxShadow: '0px 8px 24px rgba(149, 157, 165, 0.2)',
					border: '1px solid #E2E8F0',
					'& .MuiMenuItem-root': {
						fontSize: '0.875rem',
						color: '#1E293B',
						'&:hover': { bgcolor: '#F8FAFC' },
						'&.Mui-selected': {
							bgcolor: '#EFF6FF',
							color: '#2563EB',
						},
					},
				},
			},
		},
	};

	// Shared styling for the Input boxes
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
		<RtmDrawer drawerName="addPortTemplateDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 500 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'white',
				}}
			>
				{/* Header */}
				<Box
					sx={{
						p: 3,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Box>
						<Typography
							variant="h6"
							sx={{ fontWeight: 800, color: '#0F172A' }}
						>
							New Port Blueprint
						</Typography>
						<Typography
							variant="caption"
							sx={{ fontWeight: 600, color: '#64748B' }}
						>
							Physical Interface Library
						</Typography>
					</Box>
					<IconButton
						onClick={() =>
							dispatch(
								closeDrawer({
									drawerName: 'addPortTemplateDrawer',
								})
							)
						}
						sx={{ bgcolor: '#F1F5F9' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
					<form
						id="port-template-form"
						onSubmit={handleSubmit(handleFormSubmit)}
					>
						<Stack spacing={4}>
							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										mb: 2,
										color: '#475569',
										fontSize: '0.75rem',
										letterSpacing:
											'1px',
									}}
								>
									CORE IDENTIFICATION
								</Typography>
								<Stack spacing={3}>
									{/* Name Field */}
									<Controller
										name="name"
										control={control}
										rules={{
											required: 'Name is required',
										}}
										render={({
											field,
										}) => (
											<TextField
												{...field}
												label="Blueprint Name"
												fullWidth
												error={
													!!errors.name
												}
												sx={
													textFieldStyles
												}
												placeholder="e.g. 1G Fiber Uplink"
											/>
										)}
									/>

									{/* Category Select (with restored icon logic) */}
									<Controller
										name="category"
										control={control}
										render={({
											field: {
												value,
												onChange,
											},
										}) => (
											<TextField
												select
												label="Category"
												fullWidth
												value={
													value
												}
												onChange={(
													e
												) =>
													handleCategoryChange(
														e,
														onChange
													)
												}
												SelectProps={
													customSelectProps
												}
												sx={
													textFieldStyles
												}
												InputProps={{
													startAdornment:
														(
															<InputAdornment position="start">
																{value ===
																'NETWORK' ? (
																	<Lan
																		fontSize="small"
																		sx={{
																			color: '#3B82F6',
																		}}
																	/>
																) : (
																	<PowerSettingsNew
																		fontSize="small"
																		sx={{
																			color: '#F59E0B',
																		}}
																	/>
																)}
															</InputAdornment>
														),
												}}
											>
												<MenuItem value="NETWORK">
													Network
													/
													Data
												</MenuItem>
												<MenuItem value="POWER">
													Power
													/
													Electrical
												</MenuItem>
											</TextField>
										)}
									/>

									{/* Type Select (Filtered) */}
									<Controller
										name="type"
										control={control}
										rules={{
											required: 'Required',
										}}
										render={({
											field,
										}) => (
											<TextField
												{...field}
												select
												label="Interface Type"
												fullWidth
												SelectProps={
													customSelectProps
												}
												sx={
													textFieldStyles
												}
											>
												{(selectedCategory ===
												'NETWORK'
													? NETWORK_TYPES
													: POWER_TYPES
												).map(
													(
														opt
													) => (
														<MenuItem
															key={
																opt.value
															}
															value={
																opt.value
															}
														>
															{
																opt.label
															}
														</MenuItem>
													)
												)}
											</TextField>
										)}
									/>
								</Stack>
							</Box>

							{/* Dynamic Specifications */}
							{selectedType && (
								<Box
									sx={{
										p: 3,
										bgcolor: '#F8FAFC',
										borderRadius: 3,
										border: '1px solid #E2E8F0',
									}}
								>
									<Typography
										variant="subtitle2"
										sx={{
											fontWeight: 700,
											mb: 2,
											color: '#475569',
										}}
									>
										TECHNICAL ATTRIBUTES
									</Typography>
									<Stack spacing={3}>
										{/* Speed Dropdown */}
										{selectedCategory ===
											'NETWORK' &&
											selectedType !==
												'CONSOLE' && (
												<Controller
													name="speed"
													control={
														control
													}
													render={({
														field,
													}) => (
														<TextField
															{...field}
															select
															label="Interface Speed"
															fullWidth
															SelectProps={
																customSelectProps
															}
															sx={
																textFieldStyles
															}
															InputProps={{
																startAdornment:
																	(
																		<InputAdornment position="start">
																			<Speed
																				fontSize="small"
																				sx={{
																					color: '#6366F1',
																				}}
																			/>
																		</InputAdornment>
																	),
															}}
														>
															{SPEED_OPTIONS.map(
																(
																	opt
																) => (
																	<MenuItem
																		key={
																			opt
																		}
																		value={
																			opt
																		}
																	>
																		{
																			opt
																		}
																	</MenuItem>
																)
															)}
														</TextField>
													)}
												/>
											)}

										{/* Voltage Dropdown */}
										{selectedCategory ===
											'POWER' && (
											<Controller
												name="voltage"
												control={
													control
												}
												render={({
													field,
												}) => (
													<TextField
														{...field}
														select
														label="Nominal Voltage"
														fullWidth
														SelectProps={
															customSelectProps
														}
														sx={
															textFieldStyles
														}
														InputProps={{
															startAdornment:
																(
																	<InputAdornment position="start">
																		<Bolt
																			fontSize="small"
																			sx={{
																				color: '#D97706',
																			}}
																		/>
																	</InputAdornment>
																),
														}}
													>
														{VOLTAGE_OPTIONS.map(
															(
																opt
															) => (
																<MenuItem
																	key={
																		opt
																	}
																	value={
																		opt
																	}
																>
																	{
																		opt
																	}
																</MenuItem>
															)
														)}
													</TextField>
												)}
											/>
										)}

										{/* SFP Logic with Icons */}
										{selectedType ===
											'SFP_SLOT' && (
											<Stack
												spacing={
													2
												}
											>
												<Controller
													name="isSFPInserted"
													control={
														control
													}
													render={({
														field:
															{
																value,
																onChange,
															},
													}) => (
														<FormControlLabel
															control={
																<Switch
																	checked={
																		value
																	}
																	onChange={
																		onChange
																	}
																/>
															}
															label={
																<Typography
																	variant="body2"
																	sx={{
																		fontWeight: 600,
																	}}
																>
																	Default
																	SFP
																	Included?
																</Typography>
															}
														/>
													)}
												/>
												{isSFPEnabled && (
													<Controller
														name="sfpType"
														control={
															control
														}
														render={({
															field,
														}) => (
															<TextField
																{...field}
																select
																label="Connector Type"
																fullWidth
																SelectProps={
																	customSelectProps
																}
																sx={
																	textFieldStyles
																}
																InputProps={{
																	startAdornment:
																		(
																			<InputAdornment position="start">
																				<Cable
																					fontSize="small"
																					sx={{
																						color: '#8B5CF6',
																					}}
																				/>
																			</InputAdornment>
																		),
																}}
															>
																<MenuItem value="LC_SINGLE_POLE">
																	LC
																	Simplex
																</MenuItem>
																<MenuItem value="LC_DUAL_POLE">
																	LC
																	Duplex
																</MenuItem>
																<MenuItem value="SC_SIMPLEX">
																	SC
																	Simplex
																</MenuItem>
															</TextField>
														)}
													/>
												)}
											</Stack>
										)}
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
							onClick={() =>
								dispatch(
									closeDrawer({
										drawerName: 'addPortTemplateDrawer',
									})
								)
							}
							sx={{ fontWeight: 700, color: '#64748B' }}
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
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
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
