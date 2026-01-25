'use client';

import { Close, Place } from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	IconButton,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddStation } from '@/hooks/stations';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function AddStationForm({ initialData }) {
	const dispatch = useDispatch();
	const { mutate: addStation } = useAddStation();
	const { data: session } = useSession();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			code: '',
			name: '',
			mapX: initialData?.x || 0,
			mapY: initialData?.y || 0,
		},
	});

	const handleStationSubmit = (formData) => {
		// Backend handles divisionId and createdById via JWT
		addStation(formData);
		reset();
		dispatch(closeDrawer({ drawerName: 'addStationDrawer' }));
	};

	return (
		<RtmDrawer drawerName="addStationDrawer">
			{/* Header */}
			<Box
				sx={{
					p: 3,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					bgcolor: 'white',
				}}
			>
				<Box>
					<Typography
						variant="h5"
						sx={{ fontWeight: 800, color: '#1E293B' }}
					>
						Create Station
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ fontWeight: 600 }}
					>
						Adding to Division: **
						{session?.user?.divisionCode || '...'}**
					</Typography>
				</Box>
				<IconButton
					onClick={() =>
						dispatch(
							closeDrawer({
								drawerName: 'addStationDrawer',
							})
						)
					}
					sx={{ bgcolor: '#F1F5F9' }}
				>
					<Close fontSize="small" />
				</IconButton>
			</Box>

			<Divider sx={{ borderColor: '#F1F5F9' }} />

			{/* Form Content */}
			<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'white' }}>
				<form
					id="station-form"
					onSubmit={handleSubmit(handleStationSubmit)}
				>
					<Stack spacing={4}>
						<Box>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: 700,
									mb: 2,
									color: '#64748B',
								}}
							>
								IDENTIFICATION
							</Typography>
							<Stack spacing={3}>
								<Controller
									name="code"
									control={control}
									rules={{
										required: 'Station code is required',
									}}
									render={({ field }) => (
										<TextField
											{...field}
											label="Station Code"
											placeholder="e.g. RTM"
											fullWidth
											error={
												!!errors.code
											}
											helperText={
												errors
													.code
													?.message
											}
											InputProps={{
												sx: {
													borderRadius: 2,
												},
												startAdornment:
													(
														<InputAdornment position="start">
															<Place
																sx={{
																	color: 'primary.main',
																	fontSize: 20,
																}}
															/>
														</InputAdornment>
													),
											}}
										/>
									)}
								/>

								<Controller
									name="name"
									control={control}
									rules={{
										required: 'Station name is required',
									}}
									render={({ field }) => (
										<TextField
											{...field}
											label="Station Name"
											placeholder="e.g. Ratlam Junction"
											fullWidth
											error={
												!!errors.name
											}
											helperText={
												errors
													.name
													?.message
											}
											InputProps={{
												sx: {
													borderRadius: 2,
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
								sx={{
									fontWeight: 700,
									mb: 2,
									color: '#64748B',
								}}
							>
								TOPOLOGY POSITION (CANVAS)
							</Typography>
							<Stack direction="row" spacing={2}>
								<Controller
									name="mapX"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="X coordinate"
											type="number"
											fullWidth
											InputProps={{
												sx: {
													borderRadius: 2,
												},
											}}
										/>
									)}
								/>
								<Controller
									name="mapY"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Y coordinate"
											type="number"
											fullWidth
											InputProps={{
												sx: {
													borderRadius: 2,
												},
											}}
										/>
									)}
								/>
							</Stack>
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
						onClick={() =>
							dispatch(
								closeDrawer({
									drawerName: 'addStationDrawer',
								})
							)
						}
						sx={{ color: '#64748B', fontWeight: 700 }}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="station-form"
						variant="contained"
						fullWidth
						disableElevation
						sx={{
							bgcolor: '#3B82F6',
							borderRadius: 2.5,
							py: 1.5,
							fontWeight: 700,
							textTransform: 'none',
							fontSize: '1rem',
							'&:hover': { bgcolor: '#2563EB' },
						}}
					>
						Save Station
					</Button>
				</Stack>
			</Box>
		</RtmDrawer>
	);
}
