'use client';

import {
	CalendarMonth,
	Category,
	Close,
	DeleteOutline,
	Engineering,
	Public,
	Straighten,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Grid,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useParams } from 'next/navigation';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddCable } from '@/hooks/cable';
import { useToast } from '@/hooks/common';
import { useSubSectionDetails } from '@/hooks/sub-sections';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

const CABLE_SUBTYPES = {
	PIJF: [
		{ value: 'QUAD_6', label: '6 Quad' },
		{ value: 'PAIR_10', label: '10 Pair' },
	],
	OFC: [
		{ value: 'OFC_24', label: '24 Fiber' },
		{ value: 'OFC_48', label: '48 Fiber' },
	],
};

const INPUT_STYLES = {
	'& .MuiOutlinedInput-root': {
		borderRadius: 2,
		bgcolor: 'background.paper',
		'& fieldset': { borderColor: 'divider' },
		'&:hover fieldset': { borderColor: 'text.disabled' },
		'&.Mui-focused fieldset': { borderColor: 'primary.main' },
	},
	'& .MuiInputLabel-root': {
		fontWeight: 600,
		color: 'text.secondary',
	},
};

export default function AddCableDrawer() {
	const dispatch = useDispatch();
	const params = useParams();
	const { mutate: addCable, isLoading } = useAddCable();
	const { data: subsection } = useSubSectionDetails(params.subsectionId);
	const showToast = useToast();

	const {
		control,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			type: 'PIJF',
			subType: 'QUAD_6',
			maintenanceBy: '',
			length: '',
			side: 'UP',
			dateOfCommissioning: '',
			sideSegments: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'sideSegments',
	});

	const buildKmOptions = () => {
		const startRaw = subsection?.startKm;
		const endRaw = subsection?.endKm;
		if (startRaw === undefined || startRaw === null || endRaw === undefined || endRaw === null) return [];
		const start = Number.parseFloat(startRaw);
		const end = Number.parseFloat(endRaw);
		if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return [];
		const step = 0.5;
		const options = [];
		for (let km = start; km <= end + 1e-6; km += step) {
			options.push(Number(km.toFixed(2)));
		}
		return options;
	};

	const kmOptions = buildKmOptions();

	const selectedType = watch('type');

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'addCableDrawer' }));
		reset();
	};

	return (
		<RtmDrawer drawerName="addCableDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 520 },
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'background.paper',
				}}
			>
				{/* Header: High-Contrast Branding */}
				<Box sx={{ p: 4, pb: 3 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
						<Box>
							<Typography
								variant="h5"
								sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.5rem' }}
							>
								New Cable Asset
							</Typography>
							<Typography
								variant="body2"
								sx={{ fontWeight: 600, color: 'text.secondary', mt: 0.5 }}
							>
								Transmission Specification Library
							</Typography>
						</Box>
						<IconButton
							onClick={handleClose}
							sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}
						>
							<Close fontSize="small" />
						</IconButton>
					</Stack>
				</Box>

				<Box sx={{ px: 4, flexGrow: 1, overflowY: 'auto' }}>
					<form
						id="cable-asset-form"
						onSubmit={handleSubmit((data) => {
							const rangeStart = subsection?.startKm;
							const rangeEnd = subsection?.endKm;

							if (
								rangeStart !== undefined &&
								rangeStart !== null &&
								rangeEnd !== undefined &&
								rangeEnd !== null &&
								data.sideSegments?.length
							) {
								const invalid = data.sideSegments.some((segment) => {
									const fromKm = Number.parseFloat(segment.fromKm);
									const toKm = Number.parseFloat(segment.toKm);
									if (!Number.isFinite(fromKm) || !Number.isFinite(toKm)) return true;
									if (fromKm >= toKm) return true;
									if (fromKm < rangeStart || toKm > rangeEnd) return true;
									return false;
								});

								if (invalid) {
									showToast(`Segments must be within KM ${rangeStart}-${rangeEnd}`, 'error');
									return;
								}
							}

							addCable({ ...data, subsectionId: params.subsectionId });
						})}
					>
						<Stack spacing={4}>
							{/* 1. Classification */}
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
								<Stack direction="row" spacing={2}>
									<Controller
										name="type"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Category"
												fullWidth
												sx={INPUT_STYLES}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Category sx={{ color: 'primary.main', fontSize: 20, mr: 1 }} />
														</InputAdornment>
													),
												}}
											>
												<MenuItem value="PIJF">PIJF (Copper)</MenuItem>
												<MenuItem value="OFC">OFC (Fiber)</MenuItem>
											</TextField>
										)}
									/>
									<Controller
										name="subType"
										control={control}
										render={({ field }) => (
											<TextField {...field} select label="Sub-Category" fullWidth sx={INPUT_STYLES}>
												{CABLE_SUBTYPES[selectedType].map((opt) => (
													<MenuItem key={opt.value} value={opt.value}>
														{opt.label}
													</MenuItem>
												))}
											</TextField>
										)}
									/>
								</Stack>
							</Box>

							{/* 2. Technical Specs: High-Radius Container */}
							<Box
								sx={(theme) => ({
									p: 3.5,
									bgcolor: alpha(theme.palette.primary.main, 0.08),
									borderRadius: 3,
									border: '1px solid',
									borderColor: alpha(theme.palette.primary.main, 0.2),
								})}
							>
								<Stack
									direction="row"
									justifyContent="space-between"
									alignItems="center"
									sx={{ mb: 3 }}
								>
									<Typography
										sx={{
											fontWeight: 800,
											color: 'primary.dark',
											fontSize: '0.75rem',
											textTransform: 'uppercase',
										}}
									>
										{selectedType} Specs
									</Typography>
									<Box
										sx={(theme) => ({
											bgcolor: alpha(theme.palette.primary.main, 0.16),
											px: 1.5,
											py: 0.5,
											borderRadius: 2,
										})}
									>
										<Typography
											sx={{ fontSize: '0.65rem', fontWeight: 900, color: 'primary.main' }}
										>
											AUTO-GENERATE
										</Typography>
									</Box>
								</Stack>

								<Controller
									name="length"
									control={control}
									rules={{ required: 'Length is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											label="Total Length (Meters)"
											fullWidth
											placeholder="e.g. 1200"
											error={!!errors.length}
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Straighten sx={{ color: 'primary.dark', fontSize: 18, mr: 1 }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
							</Box>

							{/* 3. Logistics & Supply: Grid Refactored */}
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
									LOGISTICS & SUPPLY
								</Typography>
								<Stack spacing={3}>
									{/* Track Side and Commissioning Date in One Line */}
									<Grid container spacing={2}>
										<Grid item xs={6}>
											<Controller
												name="side"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														select
														label="Track Side"
														fullWidth
														sx={INPUT_STYLES}
														InputProps={{
															startAdornment: (
																<InputAdornment position="start">
																	<Public sx={{ color: 'text.secondary', fontSize: 18, mr: 1 }} />
																</InputAdornment>
															),
														}}
													>
														<MenuItem value="UP">UP Side</MenuItem>
														<MenuItem value="DOWN">DOWN Side</MenuItem>
													</TextField>
												)}
											/>
										</Grid>
										<Grid item xs={6}>
											<Controller
												name="dateOfCommissioning"
												control={control}
												render={({ field }) => (
													<TextField
														{...field}
														type="date"
														label="Commissioning Date"
														fullWidth
														InputLabelProps={{ shrink: true }}
														onFocus={openNativeDateTimePicker}
														onClick={openNativeDateTimePicker}
														sx={INPUT_STYLES}
														InputProps={{
															startAdornment: (
																<InputAdornment position="start">
																	<CalendarMonth
																		sx={{ color: 'success.main', fontSize: 18, mr: 1 }}
																	/>
																</InputAdornment>
															),
														}}
													/>
												)}
											/>
										</Grid>
									</Grid>

									<Box
										sx={{
											p: 2.5,
											borderRadius: 3,
											border: '1px solid',
											borderColor: 'divider',
											bgcolor: 'background.default',
										}}
									>
										<Stack spacing={2}>
											<Box>
												<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
													Side Segments (Optional)
												</Typography>
												<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
													Use this if the cable switches from UP to DOWN side within the subsection.
												</Typography>
												{subsection?.startKm !== undefined &&
													subsection?.startKm !== null &&
													subsection?.endKm !== undefined &&
													subsection?.endKm !== null && (
														<Typography
															sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.5 }}
														>
															Subsection range: KM {subsection.startKm} - {subsection.endKm}
														</Typography>
													)}
											</Box>

											<Stack spacing={2} sx={{ width: '100%' }}>
												{fields.map((item, index) => (
													<Box
														key={item.id}
														sx={{
															width: '100%',
															p: 2,
															borderRadius: 2.5,
															border: '1px solid',
															borderColor: 'divider',
															bgcolor: 'background.paper',
														}}
													>
														<Stack
															direction="row"
															spacing={2}
															alignItems="center"
															sx={{ width: '100%', minWidth: 0 }}
														>
															<Box sx={{ flex: 2, minWidth: 0 }}>
																<Controller
																	name={`sideSegments.${index}.fromKm`}
																	control={control}
																	rules={{ required: 'Required' }}
																	render={({ field }) => (
																		<TextField
																			{...field}
																			select
																			label="From KM"
																			fullWidth
																			sx={{ ...INPUT_STYLES, width: '100%' }}
																		>
																			{kmOptions.length === 0 && (
																				<MenuItem value="">Set subsection KM range first</MenuItem>
																			)}
																			{kmOptions.map((km) => (
																				<MenuItem key={`from-${km}`} value={km}>
																					{km}
																				</MenuItem>
																			))}
																		</TextField>
																	)}
																/>
															</Box>
															<Box sx={{ flex: 2, minWidth: 0 }}>
																<Controller
																	name={`sideSegments.${index}.toKm`}
																	control={control}
																	rules={{ required: 'Required' }}
																	render={({ field }) => (
																		<TextField
																			{...field}
																			select
																			label="To KM"
																			fullWidth
																			sx={{ ...INPUT_STYLES, width: '100%' }}
																		>
																			{kmOptions.length === 0 && (
																				<MenuItem value="">Set subsection KM range first</MenuItem>
																			)}
																			{kmOptions.map((km) => (
																				<MenuItem key={`to-${km}`} value={km}>
																					{km}
																				</MenuItem>
																			))}
																		</TextField>
																	)}
																/>
															</Box>
															<Box sx={{ flex: 1, minWidth: 0 }}>
																<Controller
																	name={`sideSegments.${index}.side`}
																	control={control}
																	rules={{ required: 'Required' }}
																	render={({ field }) => (
																		<TextField
																			{...field}
																			select
																			label="Side"
																			fullWidth
																			sx={{ ...INPUT_STYLES, width: '100%' }}
																		>
																			<MenuItem value="UP">UP</MenuItem>
																			<MenuItem value="DOWN">DOWN</MenuItem>
																		</TextField>
																	)}
																/>
															</Box>
															<Box sx={{ flex: '0 0 auto' }}>
																<IconButton
																	onClick={() => remove(index)}
																	sx={{ color: 'error.main' }}
																>
																	<DeleteOutline fontSize="small" />
																</IconButton>
															</Box>
														</Stack>
													</Box>
												))}
												<Button
													variant="outlined"
													onClick={() => append({ fromKm: '', toKm: '', side: 'UP' })}
													sx={{ alignSelf: 'flex-start', borderRadius: 2 }}
												>
													Add Segment
												</Button>
											</Stack>
										</Stack>
									</Box>

									{/* Maintenance Authority - Full Width */}
									<Controller
										name="maintenanceBy"
										control={control}
										rules={{ required: 'Authority is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Maintenance Authority"
												fullWidth
												placeholder="e.g. SSE/Sig/RTM"
												error={!!errors.maintenanceBy}
												sx={INPUT_STYLES}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Engineering sx={{ color: 'info.main', fontSize: 18, mr: 1 }} />
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

				{/* Footer: Pill-shaped primary button */}
				<Box
					sx={{ p: 4, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}
				>
					<Stack direction="row" spacing={2} alignItems="center">
						<Button
							variant="text"
							fullWidth
							onClick={handleClose}
							sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'none' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="cable-asset-form"
							variant="contained"
							fullWidth
							disableElevation
							disabled={isLoading}
							sx={{
								bgcolor: 'primary.main',
								borderRadius: '100px', // Full Pill Radius
								py: 2,
								fontWeight: 800,
								textTransform: 'none',
								fontSize: '1rem',
								'&:hover': { bgcolor: 'primary.dark' },
							}}
						>
							{isLoading ? 'Processing...' : 'Create Cable Asset'}
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
