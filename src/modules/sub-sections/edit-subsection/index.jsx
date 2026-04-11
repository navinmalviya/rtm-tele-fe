'use client';

import { Close, LinearScale, Place } from '@mui/icons-material';
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
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useStations } from '@/hooks/stations';
import { useUpdateSubSection } from '@/hooks/sub-sections';
import { useUsers } from '@/hooks/user';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function EditSubSectionDrawer({ subSection }) {
	const dispatch = useDispatch();
	const { mutate: updateSubSection, isLoading } = useUpdateSubSection();
	const { data: stations = [] } = useStations();
	const { data: users = [] } = useUsers();

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			fromStationId: '',
			toStationId: '',
			startKm: '',
			endKm: '',
			supervisorId: '',
		},
	});

	useEffect(() => {
		if (!subSection) return;
		reset({
			fromStationId: subSection.fromStation?.id || '',
			toStationId: subSection.toStation?.id || '',
			startKm: subSection.startKm ?? '',
			endKm: subSection.endKm ?? '',
			supervisorId: subSection.supervisor?.id || '',
		});
	}, [subSection, reset]);

	const selectedFrom = watch('fromStationId');
	const selectedTo = watch('toStationId');
	const stationOptions = useMemo(
		() =>
			stations.map((station) => ({
				id: station.id,
				code: station.data?.code || station.code || '',
				name: station.data?.label || station.name || station.id,
				label: `${station.data?.code || station.code || '-'} - ${station.data?.label || station.name || station.id}`,
			})),
		[stations]
	);

	const derivedIdentity = useMemo(() => {
		if (!selectedFrom || !selectedTo) return { code: '', name: '' };
		const from = stationOptions.find((station) => station.id === selectedFrom);
		const to = stationOptions.find((station) => station.id === selectedTo);
		if (!from || !to) return { code: '', name: '' };
		return {
			code: `${from.code}-${to.code}`,
			name: `${from.name} - ${to.name}`,
		};
	}, [selectedFrom, selectedTo, stationOptions]);

	const handleSubmitForm = (data) => {
		if (!subSection?.id) return;
		updateSubSection({
			id: subSection.id,
			data: {
				...data,
				startKm: data.startKm === '' ? null : Number(data.startKm),
				endKm: data.endKm === '' ? null : Number(data.endKm),
			},
		});
	};

	return (
		<RtmDrawer drawerName="editSubSectionDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 520 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Edit Sub-section
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Update subsection details and boundaries
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'editSubSectionDrawer' }))}
						sx={{ bgcolor: 'action.hover' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.paper' }}>
					<form id="edit-subsection-form" onSubmit={handleSubmit(handleSubmitForm)}>
						<Stack spacing={3}>
							<TextField
								label="Sub-section Code (Auto)"
								value={derivedIdentity.code}
								placeholder="Select From and To stations"
								fullWidth
								InputProps={{
									readOnly: true,
									sx: { borderRadius: 2 },
									startAdornment: (
										<InputAdornment position="start">
											<LinearScale sx={{ color: 'primary.main', fontSize: 20 }} />
										</InputAdornment>
									),
								}}
							/>
							<TextField
								label="Sub-section Name (Auto)"
								value={derivedIdentity.name}
								placeholder="Select From and To stations"
								fullWidth
								InputProps={{ readOnly: true, sx: { borderRadius: 2 } }}
							/>

							<Stack direction="row" spacing={2}>
								<Controller
									name="fromStationId"
									control={control}
									rules={{ required: 'From station is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="From Station"
											fullWidth
											error={!!errors.fromStationId}
											helperText={errors.fromStationId?.message}
											InputProps={{
												sx: { borderRadius: 2 },
												startAdornment: (
													<InputAdornment position="start">
														<Place sx={{ color: 'text.secondary', fontSize: 18 }} />
													</InputAdornment>
												),
											}}
										>
											{stationOptions.map((station) => (
												<MenuItem key={station.id} value={station.id}>
													{station.label}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
								<Controller
									name="toStationId"
									control={control}
									rules={{ required: 'To station is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="To Station"
											fullWidth
											error={!!errors.toStationId}
											helperText={errors.toStationId?.message}
											InputProps={{
												sx: { borderRadius: 2 },
												startAdornment: (
													<InputAdornment position="start">
														<Place sx={{ color: 'text.secondary', fontSize: 18 }} />
													</InputAdornment>
												),
											}}
										>
											{stationOptions
												.filter((station) => station.id !== selectedFrom)
												.map((station) => (
													<MenuItem key={station.id} value={station.id}>
														{station.label}
													</MenuItem>
												))}
										</TextField>
									)}
								/>
							</Stack>

							<Stack direction="row" spacing={2}>
								<Controller
									name="startKm"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Start KM"
											type="number"
											fullWidth
											InputProps={{ sx: { borderRadius: 2 } }}
										/>
									)}
								/>
								<Controller
									name="endKm"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="End KM"
											type="number"
											fullWidth
											InputProps={{ sx: { borderRadius: 2 } }}
										/>
									)}
								/>
							</Stack>

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
										{users
											.filter((user) => user.role !== 'VIEWER')
											.map((user) => (
												<MenuItem key={user.id} value={user.id}>
													{user.name} ({user.designation || user.role})
												</MenuItem>
											))}
									</TextField>
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
							onClick={() => dispatch(closeDrawer({ drawerName: 'editSubSectionDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<RtmLoadingButton
							type="submit"
							form="edit-subsection-form"
							variant="contained"
							fullWidth
							disableElevation
							loading={isLoading}
							loadingText="Saving..."
							disabled={!isDirty}
							sx={{
								bgcolor: 'primary.main',
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
								'&:hover': { bgcolor: 'primary.dark' },
							}}
						>
							Save Changes
						</RtmLoadingButton>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
