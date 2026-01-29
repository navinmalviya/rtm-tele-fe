'use client';

import { Close, Description, Height, HomeWork, Inventory, ViewInAr } from '@mui/icons-material';
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
import { useParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddRack } from '@/hooks/racks';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const RACK_TYPE_OPTIONS = [
	{ label: 'Floor Standing', value: 'FLOOR_STANDING' },
	{ label: 'Wall Mounted', value: 'WALL_MOUNTED' },
	{ label: 'Outdoor Cabinet', value: 'OUTDOOR_CABINET' },
	{ label: 'Battery Stand', value: 'BATTERY_STAND' },
];

export default function AddRackForm({ locations = [], isLoading }) {
	const dispatch = useDispatch();
	const { mutate: addRack } = useAddRack();
	const { stationId } = useParams();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: '',
			type: 'WALL_MOUNTED',
			heightU: 42,
			locationId: '',
			description: '',
		},
	});

	const handleRackSubmit = (rackData) => {
		const payload = {
			...rackData,
			heightU: Number.parseInt(rackData.heightU),
			stationId,
		};
		addRack(payload);
		reset();
		dispatch(closeDrawer({ drawerName: 'addRackDrawer' }));
	};

	const textFieldStyles = {
		bgcolor: 'white',
		borderRadius: 2,
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
			'& .MuiSelect-select': {
				bgcolor: 'white', // Fixes internal black background
			},
			'& fieldset': { borderColor: '#E2E8F0' },
			'&:hover fieldset': { borderColor: '#CBD5E1' },
			'&.Mui-focused fieldset': { borderColor: '#3B82F6' },
		},
	};

	// Unified Select configuration to prevent black background in dropdowns
	const customSelectProps = {
		autoFocus: false,
		PaperProps: {
			sx: {
				bgcolor: 'white',
				boxShadow: '0px 8px 24px rgba(149, 157, 165, 0.2)',
				border: '1px solid #E2E8F0',
				backgroundImage: 'none', // Critical for preventing theme-based dark overlays
			},
		},
	};

	return (
		<RtmDrawer drawerName="addRackDrawer">
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
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
							New Rack Configuration
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
							Physical Infrastructure Asset
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'addRackDrawer' }))}
						sx={{ bgcolor: '#F1F5F9' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				{/* Form Body */}
				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: '#F8FAFC' }}>
					<form id="rack-form" onSubmit={handleSubmit(handleRackSubmit)}>
						<Stack spacing={4}>
							{/* SECTION 1: IDENTITY */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: '#475569', letterSpacing: '1px' }}
								>
									PLACEMENT & IDENTITY
								</Typography>
								<Stack spacing={2.5}>
									<Controller
										name="locationId"
										control={control}
										rules={{ required: 'Please select a location' }}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Select Location (Room)"
												fullWidth
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<HomeWork sx={{ color: '#3B82F6' }} />
															</InputAdornment>
														),
													},
													select: { MenuProps: customSelectProps },
												}}
											>
												{locations.map((loc) => (
													<MenuItem key={loc.id} value={loc.id}>
														{loc.name}
													</MenuItem>
												))}
											</TextField>
										)}
									/>

									<Controller
										name="name"
										control={control}
										rules={{ required: 'Rack name is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Rack Identifier"
												placeholder="e.g. Rack-01"
												fullWidth
												error={!!errors.name}
												helperText={errors.name?.message}
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<Inventory sx={{ color: '#64748B' }} />
															</InputAdornment>
														),
													},
												}}
											/>
										)}
									/>
								</Stack>
							</Box>

							{/* SECTION 2: SPECIFICATIONS */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: '#475569', letterSpacing: '1px' }}
								>
									PHYSICAL SPECIFICATIONS
								</Typography>
								<Stack spacing={2.5}>
									<Controller
										name="type"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Rack Mounting Type"
												fullWidth
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<ViewInAr sx={{ color: '#8B5CF6' }} />
															</InputAdornment>
														),
													},
													select: { MenuProps: customSelectProps },
												}}
											>
												{RACK_TYPE_OPTIONS.map((opt) => (
													<MenuItem key={opt.value} value={opt.value}>
														{opt.label}
													</MenuItem>
												))}
											</TextField>
										)}
									/>

									<Controller
										name="heightU"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												type="number"
												label="Vertical Capacity (U)"
												fullWidth
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<Height sx={{ color: '#F59E0B' }} />
															</InputAdornment>
														),
													},
												}}
											/>
										)}
									/>
								</Stack>
							</Box>

							{/* SECTION 3: ADDITIONAL DETAILS */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: '#475569', letterSpacing: '1px' }}
								>
									ADDITIONAL DETAILS
								</Typography>
								<Controller
									name="description"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Remarks / Notes"
											placeholder="e.g., Cooling notes or specific room placement"
											multiline
											rows={3}
											fullWidth
											sx={textFieldStyles}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment
															position="start"
															sx={{ alignSelf: 'flex-start', mt: 1.5 }}
														>
															<Description sx={{ color: '#64748B' }} />
														</InputAdornment>
													),
												},
											}}
										/>
									)}
								/>
							</Box>
						</Stack>
					</form>
				</Box>

				<Divider />

				{/* Footer Actions */}
				<Box sx={{ p: 3, bgcolor: '#F8FAFC' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'addRackDrawer' }))}
							sx={{ fontWeight: 700, color: '#64748B' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="rack-form"
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
							Deploy Rack
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
