'use client';

import { Close } from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	FormControl,
	FormHelperText,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
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

// Options based on your Prisma Enum
const RACK_TYPE_OPTIONS = [
	{ label: 'Floor Standing', value: 'FLOOR_STANDING' },
	{ label: 'Wall Mounted', value: 'WALL_MOUNTED' },
	{ label: 'Outdoor Cabinet', value: 'OUTDOOR_CABINET' },
	{ label: 'Battery Stand', value: 'BATTERY_STAND' },
];

export default function AddRackForm({ locations, isLoading }) {
	const dispatch = useDispatch();
	const { mutate: addRack } = useAddRack();
	console.log('locations', locations);
	const { stationId } = useParams();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: '',
			type: 'WALL_MOUNTED', // Matching @default(WALL_MOUNTED) in schema
			heightU: 42, // Matching @default(42) in schema
			locationId: '',
		},
	});

	const handleRackSubmit = (rackData) => {
		const payload = {
			...rackData,
			heightU: parseInt(rackData.heightU),
			stationId,
		};
		console.log('payload=>', payload);
		addRack({ rackData });
		reset();
		dispatch(closeDrawer({ drawerName: 'addRackDrawer' }));
	};

	return (
		<RtmDrawer drawerName="addRackDrawer">
			{/* Header */}
			<Box
				sx={{
					p: 2,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					bgcolor: '#f8f9fa',
				}}
			>
				<Typography variant="h6" sx={{ fontWeight: 800 }}>
					Add Rack
				</Typography>
				<IconButton
					onClick={() =>
						dispatch(
							closeDrawer({ drawerName: 'addRackDrawer' })
						)
					}
				>
					<Close />
				</IconButton>
			</Box>

			<Divider />

			{/* Form Content */}
			<Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
				<form id="rack-form" onSubmit={handleSubmit(handleRackSubmit)}>
					<Stack spacing={3}>
						{/* <Typography
							variant="caption"
							color="text.secondary"
						>
							Adding to Location ID: {locationId}
						</Typography> */}

						{/* Rack Name */}
						<Controller
							name="name"
							control={control}
							rules={{
								required: 'Rack name is required',
							}}
							render={({ field }) => (
								<TextField
									{...field}
									label="Rack Name"
									placeholder="e.g. Rack-01"
									fullWidth
									error={!!errors.name}
									helperText={
										errors.name?.message
									}
								/>
							)}
						/>
						{/* { Location  } */}
						<FormControl fullWidth error={!!errors.locationId}>
							<InputLabel id="location-select-label">
								Select Location (Room)
							</InputLabel>
							<Controller
								name="locationId"
								control={control}
								rules={{
									required: 'Please select a location',
								}}
								render={({ field }) => (
									<Select
										{...field}
										labelId="location-select-label"
										label="Select Location (Room)"
										disabled={isLoading}
									>
										{locations.map(
											(loc) => (
												<MenuItem
													key={
														loc.id
													}
													value={
														loc.id
													}
												>
													{
														loc.name
													}
												</MenuItem>
											)
										)}
									</Select>
								)}
							/>
							{errors.locationId && (
								<FormHelperText>
									{errors.locationId.message}
								</FormHelperText>
							)}
						</FormControl>

						{/* Rack Type Select Field */}
						<FormControl fullWidth error={!!errors.type}>
							<InputLabel id="rack-type-label">
								Rack Type
							</InputLabel>
							<Controller
								name="type"
								control={control}
								render={({ field }) => (
									<Select
										{...field}
										labelId="rack-type-label"
										label="Rack Type"
									>
										{RACK_TYPE_OPTIONS.map(
											(opt) => (
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
									</Select>
								)}
							/>
							{errors.type && (
								<FormHelperText>
									{errors.type.message}
								</FormHelperText>
							)}
						</FormControl>

						{/* Height (U) */}
						<Controller
							name="heightU"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									type="number"
									label="Height (Rack Units)"
									placeholder="42"
									fullWidth
									helperText="Standard height in U (e.g., 42, 24, 12)"
								/>
							)}
						/>
					</Stack>
				</form>
			</Box>

			<Divider />

			{/* Footer Actions */}
			<Box sx={{ p: 2, bgcolor: '#f8f9fa' }}>
				<Stack direction="row" spacing={2}>
					<Button
						variant="outlined"
						fullWidth
						onClick={() =>
							dispatch(
								closeDrawer({
									drawerName: 'addRackDrawer',
								})
							)
						}
						color="inherit"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="rack-form"
						variant="contained"
						fullWidth
						sx={{
							bgcolor: '#1976d2',
							fontWeight: 700,
							'&:hover': { bgcolor: '#1565c0' },
						}}
					>
						Save Rack
					</Button>
				</Stack>
			</Box>
		</RtmDrawer>
	);
}
