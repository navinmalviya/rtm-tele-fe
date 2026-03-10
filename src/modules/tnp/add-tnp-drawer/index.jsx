'use client';

import { Close, Inventory2, Numbers, Notes, Place } from '@mui/icons-material';
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
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useStationLocations } from '@/hooks/locations';
import { useStations } from '@/hooks/stations';
import { useCreateTnpItem } from '@/hooks/tnp';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const TNP_TYPES = [
	'FURNITURE',
	'TOOLS',
	'METERS',
	'ELECTRICAL',
	'ELECTRONICS',
	'CUTLARY',
	'SAFETY',
	'RACKS',
	'LINEN',
];

export default function AddTnpDrawer() {
	const dispatch = useDispatch();
	const { data: stations = [] } = useStations();
	const { mutate: createItem, isLoading } = useCreateTnpItem();

	const {
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm({
		defaultValues: {
			tnpNumber: '',
			name: '',
			description: '',
			type: 'TOOLS',
			stationId: '',
			locationId: '',
		},
	});
	const stationId = watch('stationId');
	const { data: stationLocations = [] } = useStationLocations(stationId);

	useEffect(() => {
		setValue('locationId', '');
	}, [stationId, setValue]);

	const handleCreate = (data) => {
		createItem(data, {
			onSuccess: () => {
				reset();
				dispatch(closeDrawer({ drawerName: 'addTnpDrawer' }));
			},
		});
	};

	return (
		<RtmDrawer drawerName="addTnpDrawer">
			<Box sx={{ width: { xs: '100vw', sm: 520 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							Add T&P Item
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Tools & Plants inventory
						</Typography>
					</Box>
					<IconButton onClick={() => dispatch(closeDrawer({ drawerName: 'addTnpDrawer' }))} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>
				<Divider />
				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="tnp-form" onSubmit={handleSubmit(handleCreate)}>
						<Stack spacing={3}>
							<Controller
								name="tnpNumber"
								control={control}
								rules={{ required: 'T&P number is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label="T&P Number"
										fullWidth
										error={!!errors.tnpNumber}
										helperText={errors.tnpNumber?.message}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Numbers sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
							<Controller
								name="name"
								control={control}
								rules={{ required: 'Name is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Item Name"
										fullWidth
										error={!!errors.name}
										helperText={errors.name?.message}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Inventory2 sx={{ color: 'primary.main' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
							<Controller
								name="type"
								control={control}
								rules={{ required: 'Type is required' }}
								render={({ field }) => (
									<TextField {...field} select label="Type" fullWidth>
										{TNP_TYPES.map((t) => (
											<MenuItem key={t} value={t}>
												{t}
											</MenuItem>
										))}
									</TextField>
								)}
							/>
							<Controller
								name="stationId"
								control={control}
								rules={{ required: 'Station is required' }}
								render={({ field }) => (
									<TextField {...field} select label="Station" fullWidth>
										{stations.map((s) => (
											<MenuItem key={s.id} value={s.id}>
												{s.data?.label || s.name} ({s.data?.code || s.code})
											</MenuItem>
										))}
									</TextField>
								)}
							/>
							<Controller
								name="locationId"
								control={control}
								rules={{ required: 'Location is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										select
										label="Location"
										fullWidth
										disabled={!stationId}
										error={!!errors.locationId}
										helperText={
											errors.locationId?.message ||
											(!stationId ? 'Select station first' : undefined)
										}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Place sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									>
										{stationLocations.map((location) => (
											<MenuItem key={location.id} value={location.id}>
												{location.name}
											</MenuItem>
										))}
									</TextField>
								)}
							/>
							<Controller
								name="description"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Description"
										fullWidth
										multiline
										minRows={3}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Notes sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
						</Stack>
					</form>
				</Box>
				<Divider />
				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'addTnpDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="tnp-form"
							variant="contained"
							fullWidth
							disableElevation
							disabled={isLoading}
							sx={{ bgcolor: 'primary.main', fontWeight: 700, borderRadius: 2 }}
						>
							Create
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
