'use client';

import {
	Business,
	CalendarMonth,
	Close,
	Description,
	Dns,
	Inventory,
	Memory,
	Pin,
	Place,
} from '@mui/icons-material';
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
import { useEquipmentTemplates } from '@/hooks/eqiuipment-templates';
import { useUpdateEquipment } from '@/hooks/equipment';
import { useStationRacks } from '@/hooks/racks';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

const STATUS_OPTIONS = [
	{ label: 'Operational', value: 'OPERATIONAL' },
	{ label: 'Faulty', value: 'FAULTY' },
	{ label: 'Maintenance', value: 'MAINTENANCE' },
	{ label: 'Spare', value: 'SPARE' },
	{ label: 'Decommissioned', value: 'DECOMMISSIONED' },
];

export default function EditEquipmentDrawer({ equipment, stationId }) {
	const dispatch = useDispatch();
	const { mutate: updateEquipment, isLoading } = useUpdateEquipment(stationId);
	const { data: templates = [] } = useEquipmentTemplates();
	const { data: racks = [] } = useStationRacks(stationId);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			name: '',
			description: '',
			providedBy: '',
			serialNumber: '',
			templateId: '',
			rackId: '',
			uPosition: '',
			installationDate: '',
			status: 'OPERATIONAL',
		},
	});

	useEffect(() => {
		if (!equipment) return;
		reset({
			name: equipment.name || '',
			description: equipment.description || '',
			providedBy: equipment.providedBy || '',
			serialNumber: equipment.serialNumber || '',
			templateId: equipment.templateId || '',
			rackId: equipment.rackId || '',
			uPosition: equipment.uPosition ?? '',
			installationDate: equipment.installationDate
				? new Date(equipment.installationDate).toISOString().split('T')[0]
				: '',
			status: equipment.status || 'OPERATIONAL',
		});
	}, [equipment, reset]);

	const onFormSubmit = (data) => {
		if (!equipment?.id) return;
		updateEquipment({
			id: equipment.id,
			...data,
			uPosition: data.uPosition ? Number.parseInt(data.uPosition, 10) : null,
		});
	};

	const textFieldStyles = {
		bgcolor: 'background.paper',
		borderRadius: 2,
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
			'& .MuiSelect-select': { bgcolor: 'background.paper' },
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
		<RtmDrawer drawerName="editEquipmentDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 550 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Edit Asset
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Update equipment metadata
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'editEquipmentDrawer' }))}
						sx={{ bgcolor: 'action.hover' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="equipment-edit-form" onSubmit={handleSubmit(onFormSubmit)}>
						<Stack spacing={4}>
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', letterSpacing: '1px' }}
								>
									IDENTITY & MODEL
								</Typography>
								<Stack spacing={2.5}>
									<Controller
										name="name"
										control={control}
										rules={{ required: 'Display name is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Asset Label / Hostname"
												placeholder="e.g. AGG-SW-01"
												fullWidth
												error={!!errors.name}
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<Inventory sx={{ color: 'primary.main' }} />
															</InputAdornment>
														),
													},
												}}
											/>
										)}
									/>
									<Controller
										name="templateId"
										control={control}
										rules={{ required: 'Model selection is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Hardware Template (Model)"
												fullWidth
												error={!!errors.templateId}
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<Memory sx={{ color: 'secondary.main' }} />
															</InputAdornment>
														),
													},
													select: { MenuProps: customSelectProps },
												}}
											>
												{templates.map((t) => (
													<MenuItem key={t.id} value={t.id}>
														{t.make} - {t.modelName} ({t.category})
													</MenuItem>
												))}
											</TextField>
										)}
									/>
									<Controller
										name="status"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Asset Status"
												fullWidth
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<Dns sx={{ color: 'warning.main' }} />
															</InputAdornment>
														),
													},
													select: { MenuProps: customSelectProps },
												}}
											>
												{STATUS_OPTIONS.map((opt) => (
													<MenuItem key={opt.value} value={opt.value}>
														{opt.label}
													</MenuItem>
												))}
											</TextField>
										)}
									/>
								</Stack>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', letterSpacing: '1px' }}
								>
									PHYSICAL PLACEMENT
								</Typography>
								<Stack spacing={2.5}>
									<Controller
										name="rackId"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Assigned Rack"
												fullWidth
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<Place sx={{ color: 'text.secondary' }} />
															</InputAdornment>
														),
													},
													select: { MenuProps: customSelectProps },
												}}
											>
												<MenuItem value="">Unracked</MenuItem>
												{racks.map((rack) => (
													<MenuItem key={rack.id} value={rack.id}>
														{rack.name}
													</MenuItem>
												))}
											</TextField>
										)}
									/>

									<Controller
										name="uPosition"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label="Rack U Position"
												type="number"
												fullWidth
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<Pin sx={{ color: 'text.secondary' }} />
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
									SUPPLY & TRACKING
								</Typography>
								<Stack spacing={2.5}>
									<Controller
										name="providedBy"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label="Provided By"
												fullWidth
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<Business sx={{ color: 'info.main' }} />
															</InputAdornment>
														),
													},
												}}
											/>
										)}
									/>
									<Controller
										name="serialNumber"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label="Serial Number"
												fullWidth
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<Pin sx={{ color: 'text.secondary' }} />
															</InputAdornment>
														),
													},
												}}
											/>
										)}
									/>
									<Controller
										name="installationDate"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												type="date"
												label="Installation Date"
												fullWidth
												InputLabelProps={{ shrink: true }}
												onFocus={openNativeDateTimePicker}
												onClick={openNativeDateTimePicker}
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<CalendarMonth sx={{ color: 'text.secondary' }} />
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
									ADDITIONAL NOTES
								</Typography>
								<Controller
									name="description"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Remarks / Notes"
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
							onClick={() => dispatch(closeDrawer({ drawerName: 'editEquipmentDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="equipment-edit-form"
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
