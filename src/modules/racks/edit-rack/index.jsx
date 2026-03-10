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
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useUpdateRack } from '@/hooks/racks';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const RACK_TYPE_OPTIONS = [
	{ label: 'Floor Standing', value: 'FLOOR_STANDING' },
	{ label: 'Wall Mounted', value: 'WALL_MOUNTED' },
	{ label: 'Outdoor Cabinet', value: 'OUTDOOR_CABINET' },
	{ label: 'Battery Stand', value: 'BATTERY_STAND' },
];

export default function EditRackDrawer({ rack, stationId, locations = [] }) {
	const dispatch = useDispatch();
	const { mutate: updateRack, isLoading } = useUpdateRack(stationId);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			name: '',
			type: 'WALL_MOUNTED',
			heightU: 42,
			locationId: '',
			description: '',
		},
	});

	useEffect(() => {
		if (!rack) return;
		reset({
			name: rack.name || '',
			type: rack.type || 'WALL_MOUNTED',
			heightU: rack.heightU ?? 42,
			locationId: rack.locationId || '',
			description: rack.description || '',
		});
	}, [rack, reset]);

	const handleRackSubmit = (data) => {
		if (!rack?.id) return;
		updateRack({
			id: rack.id,
			data: {
				...data,
				heightU: Number.parseInt(data.heightU, 10),
			},
		});
	};

	const textFieldStyles = {
		bgcolor: 'background.paper',
		borderRadius: 2,
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
			'& .MuiSelect-select': {
				bgcolor: 'background.paper',
			},
			'& fieldset': { borderColor: 'divider' },
			'&:hover fieldset': { borderColor: 'text.disabled' },
			'&.Mui-focused fieldset': { borderColor: 'primary.main' },
		},
	};

	const customSelectProps = {
		autoFocus: false,
		PaperProps: {
			sx: {
				bgcolor: 'background.paper',
				boxShadow: 6,
				border: '1px solid',
				borderColor: 'divider',
				backgroundImage: 'none',
			},
		},
	};

	return (
		<RtmDrawer drawerName="editRackDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 500 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				<Box
					sx={{
						p: 3,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Edit Rack
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Update rack configuration
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'editRackDrawer' }))}
						sx={{ bgcolor: 'action.hover' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="rack-edit-form" onSubmit={handleSubmit(handleRackSubmit)}>
						<Stack spacing={4}>
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', letterSpacing: '1px' }}
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
												error={!!errors.locationId}
												helperText={errors.locationId?.message}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<HomeWork sx={{ color: 'primary.main' }} />
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
																<Inventory sx={{ color: 'text.secondary' }} />
															</InputAdornment>
														),
													},
												}}
											/>
										)}
									/>
								</Stack>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', letterSpacing: '1px' }}
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
																<ViewInAr sx={{ color: 'secondary.main' }} />
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
																<Height sx={{ color: 'warning.main' }} />
															</InputAdornment>
														),
													},
												}}
											/>
										)}
									/>
								</Stack>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', letterSpacing: '1px' }}
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
															<Description sx={{ color: 'text.secondary' }} />
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

				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'editRackDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="rack-edit-form"
							variant="contained"
							fullWidth
							disableElevation
							disabled={!isDirty || isLoading}
							sx={{
								bgcolor: 'primary.main',
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
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
