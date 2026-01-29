'use client';

import { Close, Description, MapsHomeWork, PushPin } from '@mui/icons-material';
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
import { useParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddLocation } from '@/hooks/locations';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function AddLocationForm() {
	const dispatch = useDispatch();
	const { mutate: addLocation } = useAddLocation();
	const { stationId } = useParams();

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
		const payload = {
			locationData,
			stationId,
		};
		console.log('payload==>', payload);

		addLocation(payload);
		reset();
		dispatch(closeDrawer({ drawerName: 'addLocationDrawer' }));
	};

	const textFieldStyles = {
		bgcolor: 'white',
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
			'& fieldset': { borderColor: '#E2E8F0' },
			'&:hover fieldset': { borderColor: '#CBD5E1' },
			'&.Mui-focused fieldset': { borderColor: '#3B82F6' },
		},
	};

	return (
		<RtmDrawer drawerName="addLocationDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 500 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'white',
				}}
			>
				{/* Header Section */}
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
							New Location
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
							Define a physical room or area
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'addLocationDrawer' }))}
						sx={{ bgcolor: '#F1F5F9' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				{/* Form Body */}
				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: '#F8FAFC' }}>
					<form id="location-form" onSubmit={handleSubmit(handleLocationSubmit)}>
						<Stack spacing={4}>
							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										mb: 2,
										color: '#475569',
										letterSpacing: '1px',
									}}
								>
									LOCATION DETAILS
								</Typography>
								<Stack spacing={3}>
									<Controller
										name="name"
										control={control}
										rules={{
											required: 'Location name is required',
										}}
										render={({ field }) => (
											<TextField
												{...field}
												label="Location Name"
												placeholder="e.g. OFC Hut, SM Office, Relay Room"
												fullWidth
												error={!!errors.name}
												helperText={errors.name?.message}
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<MapsHomeWork sx={{ color: '#3B82F6' }} />
														</InputAdornment>
													),
												}}
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
												placeholder="Briefly describe the purpose or notes for this room"
												multiline
												rows={4}
												fullWidth
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment
															position="start"
															sx={{ alignSelf: 'flex-start', mt: 1.5 }}
														>
															<Description sx={{ color: '#64748B' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
								</Stack>
							</Box>

							{/* Info Callout */}
							<Box
								sx={{
									p: 2,
									bgcolor: '#EFF6FF',
									borderRadius: 2,
									border: '1px solid #DBEAFE',
									display: 'flex',
									gap: 2,
								}}
							>
								<PushPin sx={{ color: '#3B82F6', mt: 0.2 }} fontSize="small" />
								<Typography variant="caption" sx={{ color: '#1E40AF', fontWeight: 500 }}>
									This location will be tied to the current station. Racks and equipment can later
									be placed inside this location.
								</Typography>
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
							onClick={() => dispatch(closeDrawer({ drawerName: 'addLocationDrawer' }))}
							sx={{ fontWeight: 700, color: '#64748B' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="location-form"
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
							Create Location
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
