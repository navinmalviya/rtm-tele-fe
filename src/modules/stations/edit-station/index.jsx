'use client';

import { Close, Place } from '@mui/icons-material';
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
import { useUpdateStation } from '@/hooks/stations';
import { useUsers } from '@/hooks/user';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function EditStationDrawer({ station }) {
	const dispatch = useDispatch();
	const { mutate: updateStation, isLoading } = useUpdateStation();
	const { data: users = [] } = useUsers();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			code: '',
			name: '',
			mapX: 0,
			mapY: 0,
			supervisorId: '',
		},
	});

	useEffect(() => {
		if (!station) return;
		reset({
			code: station.code || station.data?.code || '',
			name: station.name || station.data?.label || '',
			mapX: station.mapX ?? station.position?.x ?? 0,
			mapY: station.mapY ?? station.position?.y ?? 0,
			supervisorId: station.supervisor?.id || station.supervisorId || '',
		});
	}, [station, reset]);

	const handleStationSubmit = (data) => {
		if (!station?.id) return;
		updateStation({ id: station.id, data });
	};

	return (
		<RtmDrawer drawerName="editStationDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 520 },
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
							Edit Station
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Update station identity and ownership details
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'editStationDrawer' }))}
						sx={{ bgcolor: 'action.hover' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
					<form id="edit-station-form" onSubmit={handleSubmit(handleStationSubmit)}>
						<Stack spacing={3}>
							<Controller
								name="code"
								control={control}
								rules={{ required: 'Station code is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Station Code"
										placeholder="e.g. RTM"
										fullWidth
										error={!!errors.code}
										helperText={errors.code?.message}
										InputProps={{
											sx: { borderRadius: 2 },
											startAdornment: (
												<InputAdornment position="start">
													<Place sx={{ color: 'primary.main', fontSize: 20 }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>

							<Controller
								name="name"
								control={control}
								rules={{ required: 'Station name is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Station Name"
										placeholder="e.g. Ratlam Junction"
										fullWidth
										error={!!errors.name}
										helperText={errors.name?.message}
										InputProps={{ sx: { borderRadius: 2 } }}
									/>
								)}
							/>

							<Controller
								name="supervisorId"
								control={control}
								rules={{ required: 'Supervisor is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										select
										label="Supervisor"
										fullWidth
										error={!!errors.supervisorId}
										helperText={errors.supervisorId?.message}
										InputProps={{ sx: { borderRadius: 2 } }}
									>
										{users.map((user) => (
											<MenuItem key={user.id} value={user.id}>
												{user.name} ({user.designation || user.role})
											</MenuItem>
										))}
									</TextField>
								)}
							/>

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
											InputProps={{ sx: { borderRadius: 2 } }}
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
											InputProps={{ sx: { borderRadius: 2 } }}
										/>
									)}
								/>
							</Stack>
						</Stack>
					</form>
				</Box>

				<Divider />

				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'editStationDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="edit-station-form"
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
