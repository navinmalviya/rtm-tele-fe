'use client';

import { Add, Close } from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	IconButton,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useStationLocations } from '@/hooks/locations';
import { useAddStationCable, useStationCables } from '@/hooks/station-cable';
import RtmDataGrid from '@/lib/common/datagrid';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer, openDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

const DRAWER_NAME = 'addLocationCableDrawer';

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

const getStructuralCounts = (subType) => {
	switch (subType) {
		case 'QUAD_6':
			return { quadCount: 6, pairCount: 24, fiberCount: 0, tubeCount: 0 };
		case 'OFC_24':
			return { quadCount: 0, pairCount: 0, fiberCount: 24, tubeCount: 6 };
		case 'OFC_48':
			return { quadCount: 0, pairCount: 0, fiberCount: 48, tubeCount: 6 };
		case 'PAIR_10':
			return { quadCount: 0, pairCount: 10, fiberCount: 0, tubeCount: 0 };
		default:
			return {};
	}
};

export default function LocationCablesPanel({ stationId }) {
	const dispatch = useDispatch();
	const { data: cables = [], isLoading } = useStationCables(stationId);
	const { data: locations = [] } = useStationLocations(stationId);
	const { mutate: addStationCable, isLoading: creating } = useAddStationCable({
		stationId,
		drawerName: DRAWER_NAME,
	});

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm({
		defaultValues: {
			type: 'PIJF',
			subType: 'QUAD_6',
			fromLocationId: '',
			toLocationId: '',
			maintenanceBy: '',
			length: '',
			dateOfCommissioning: '',
		},
	});

	const selectedType = watch('type');
	const fromLocationId = watch('fromLocationId');

	const columns = useMemo(
		() => [
			{ field: 'subType', headerName: 'Cable Type', flex: 0.9 },
			{
				field: 'route',
				headerName: 'Location Route',
				flex: 1.6,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
						{params.row.fromLocation?.name || '-'} {'->'} {params.row.toLocation?.name || '-'}
					</Typography>
				),
			},
			{ field: 'length', headerName: 'Length (m)', flex: 0.7 },
			{ field: 'maintenanceBy', headerName: 'Maintained By', flex: 1.1 },
		],
		[]
	);

	const handleCreate = (values) => {
		if (!values.fromLocationId || !values.toLocationId) return;
		const payload = {
			...values,
			...getStructuralCounts(values.subType),
		};
		addStationCable(payload, {
			onSuccess: () => {
				reset();
			},
		});
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
					Location-to-Location Cables
				</Typography>
				<Button
					variant="contained"
					startIcon={<Add />}
					onClick={() => dispatch(openDrawer({ drawerName: DRAWER_NAME }))}
				>
					Add Cable Link
				</Button>
			</Stack>

			<RtmDataGrid rows={cables} columns={columns} loading={isLoading} />

			<RtmDrawer drawerName={DRAWER_NAME}>
				<Box
					sx={{
						width: { xs: '100vw', sm: 520 },
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<Box
						sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
					>
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 800 }}>
								New Location Cable
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
								Connect telecom cable between station locations
							</Typography>
						</Box>
						<IconButton onClick={() => dispatch(closeDrawer({ drawerName: DRAWER_NAME }))}>
							<Close />
						</IconButton>
					</Box>
					<Divider />
					<Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
						<form id="location-cable-form" onSubmit={handleSubmit(handleCreate)}>
							<Stack spacing={2}>
								<Controller
									name="type"
									control={control}
									render={({ field }) => (
										<TextField {...field} select label="Cable Category" fullWidth>
											<MenuItem value="PIJF">PIJF (Copper)</MenuItem>
											<MenuItem value="OFC">OFC (Fiber)</MenuItem>
										</TextField>
									)}
								/>
								<Controller
									name="subType"
									control={control}
									render={({ field }) => (
										<TextField {...field} select label="Sub-Type" fullWidth>
											{CABLE_SUBTYPES[selectedType].map((opt) => (
												<MenuItem key={opt.value} value={opt.value}>
													{opt.label}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
								<Controller
									name="fromLocationId"
									control={control}
									rules={{ required: 'From location is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="From Location"
											fullWidth
											error={!!errors.fromLocationId}
											helperText={errors.fromLocationId?.message}
										>
											{locations.map((location) => (
												<MenuItem key={location.id} value={location.id}>
													{location.name}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
								<Controller
									name="toLocationId"
									control={control}
									rules={{ required: 'To location is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="To Location"
											fullWidth
											error={!!errors.toLocationId}
											helperText={errors.toLocationId?.message}
										>
											{locations
												.filter((location) => location.id !== fromLocationId)
												.map((location) => (
													<MenuItem key={location.id} value={location.id}>
														{location.name}
													</MenuItem>
												))}
										</TextField>
									)}
								/>
								<Controller
									name="length"
									control={control}
									rules={{ required: 'Length is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											label="Length (meters)"
											fullWidth
											error={!!errors.length}
											helperText={errors.length?.message}
										/>
									)}
								/>
								<Controller
									name="maintenanceBy"
									control={control}
									rules={{ required: 'Maintenance authority is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											label="Maintenance By"
											fullWidth
											error={!!errors.maintenanceBy}
											helperText={errors.maintenanceBy?.message}
										/>
									)}
								/>
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
										/>
									)}
								/>
							</Stack>
						</form>
					</Box>
					<Divider />
					<Box sx={{ p: 3 }}>
						<Stack direction="row" spacing={2}>
							<Button
								fullWidth
								variant="text"
								onClick={() => dispatch(closeDrawer({ drawerName: DRAWER_NAME }))}
							>
								Cancel
							</Button>
							<RtmLoadingButton
								fullWidth
								variant="contained"
								type="submit"
								form="location-cable-form"
								loading={creating}
								loadingText="Creating..."
							>
								Create Cable
							</RtmLoadingButton>
						</Stack>
					</Box>
				</Box>
			</RtmDrawer>
		</Box>
	);
}
