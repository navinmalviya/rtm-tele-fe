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
import { useUpdateTnpItem } from '@/hooks/tnp';
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

export default function EditTnpDrawer({ item }) {
	const dispatch = useDispatch();
	const { data: stations = [] } = useStations();
	const { mutate: updateItem, isLoading } = useUpdateTnpItem();

	const {
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors, isDirty },
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
		if (!item) return;
		reset({
			tnpNumber: item.tnpNumber || '',
			name: item.name || '',
			description: item.description || '',
			type: item.type || 'TOOLS',
			stationId: item.stationId || '',
			locationId: item.locationId || '',
		});
	}, [item, reset]);

	const handleUpdate = (data) => {
		if (!item?.id) return;
		updateItem({ id: item.id, data });
		dispatch(closeDrawer({ drawerName: 'editTnpDrawer' }));
	};

	return (
		<RtmDrawer drawerName="editTnpDrawer">
			<Box sx={{ width: { xs: '100vw', sm: 520 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							Edit T&P Item
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Update tools & plants
						</Typography>
					</Box>
					<IconButton onClick={() => dispatch(closeDrawer({ drawerName: 'editTnpDrawer' }))} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>
				<Divider />
				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="tnp-edit-form" onSubmit={handleSubmit(handleUpdate)}>
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
									<TextField
										{...field}
										select
										label="Station"
										fullWidth
										onChange={(event) => {
											field.onChange(event);
											setValue('locationId', '', { shouldDirty: true });
										}}
									>
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
							onClick={() => dispatch(closeDrawer({ drawerName: 'editTnpDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="tnp-edit-form"
							variant="contained"
							fullWidth
							disableElevation
							disabled={!isDirty || isLoading}
							sx={{ bgcolor: 'primary.main', fontWeight: 700, borderRadius: 2 }}
						>
							Save
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
