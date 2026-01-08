'use client';

import { Close } from '@mui/icons-material';
import { Box, Button, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddLocation } from '@/hooks/locations';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
// import { useAddLocation } from '@/hooks/locations'; // You'll create this hook next

export default function AddLocationForm() {
	const dispatch = useDispatch();
	const { mutate: addLocation } = useAddLocation();
	const { stationId } = useParams(); // Automatically get station context from URL
	// const { mutate: addLocation } = useAddLocation();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: '',
			description: '',
		},
	});

	const handleLocationSubmit = (locationData) => {
		// Prepare data with stationId from URL
		const payload = {
			locationData,
			stationId,
		};
		console.log('payload in form', payload);

		addLocation(payload);

		reset();
		dispatch(closeDrawer({ drawerName: 'addLocationDrawer' }));
	};

	return (
		<RtmDrawer drawerName="addLocationDrawer">
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
					Add Location
				</Typography>
				<IconButton
					onClick={() =>
						dispatch(
							closeDrawer({
								drawerName: 'addLocationDrawer',
							})
						)
					}
				>
					<Close />
				</IconButton>
			</Box>

			<Divider />

			{/* Form Content */}
			<Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
				<form
					id="location-form"
					onSubmit={handleSubmit(handleLocationSubmit)}
				>
					<Stack spacing={3}>
						<Typography
							variant="caption"
							color="text.secondary"
						>
							Creating location for Station ID:{' '}
							{stationId}
						</Typography>

						<Controller
							name="name"
							control={control}
							rules={{
								required: 'Location name is required (e.g. OFC Hut)',
							}}
							render={({ field }) => (
								<TextField
									{...field}
									label="Location Name"
									placeholder="e.g. OFC Room, Relay Room, SM Office"
									fullWidth
									error={!!errors.name}
									helperText={
										errors.name?.message
									}
								/>
							)}
						/>

						<Controller
							name="description"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Description (Optional)"
									placeholder="Brief details about this room"
									multiline
									rows={3}
									fullWidth
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
									drawerName: 'addLocationDrawer',
								})
							)
						}
						color="inherit"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="location-form"
						variant="contained"
						fullWidth
						sx={{
							bgcolor: '#2e7d32',
							fontWeight: 700,
							'&:hover': { bgcolor: '#1b5e20' },
						}}
					>
						Save Location
					</Button>
				</Stack>
			</Box>
		</RtmDrawer>
	);
}
