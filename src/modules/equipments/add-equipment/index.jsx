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
import { useParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useEquipmentTemplates } from '@/hooks/eqiuipment-templates';
import { useAddEquipment } from '@/hooks/equipment';
import { useStationRacks } from '@/hooks/racks';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

export default function AddEquipmentDrawer() {
	const dispatch = useDispatch();
	const { stationId } = useParams();

	// Data Fetching
	const { mutate: addEquipment, isLoading: isSaving } = useAddEquipment();
	const { data: templates = [], isLoading: templatesLoading } = useEquipmentTemplates();
	const { data: racks = [] } = useStationRacks(stationId);

	console.log(templatesLoading);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: '',
			description: '',
			providedBy: 'Indian Railways',
			serialNumber: '',
			templateId: '',
			rackId: '',
			uPosition: '',
			installationDate: new Date().toISOString().split('T')[0],
		},
	});

	const onFormSubmit = (data) => {
		const payload = {
			...data,
			stationId,
			uPosition: data.uPosition ? Number.parseInt(data.uPosition, 10) : null,
		};
		console.log('pay', payload);
		addEquipment(payload);
	};

	// Blueprint Design System Styles
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
		<RtmDrawer drawerName="addEquipmentDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 550 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				{/* HEADER */}
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Deploy New Asset
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Physical Instance Registration
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'addEquipmentDrawer' }))}
						sx={{ bgcolor: 'action.hover' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="equipment-form" onSubmit={handleSubmit(onFormSubmit)}>
						<Stack spacing={4}>
							{/* SECTION 1: IDENTITY & MODEL */}
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
								</Stack>
							</Box>

							{/* SECTION 2: PHYSICAL PLACEMENT */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', letterSpacing: '1px' }}
								>
									PHYSICAL PLACEMENT
								</Typography>
								<Stack direction="row" spacing={2}>
									<Controller
										name="rackId"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Target Rack"
												fullWidth
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<Dns sx={{ color: 'text.secondary' }} />
															</InputAdornment>
														),
													},
													select: { MenuProps: customSelectProps },
												}}
											>
												<MenuItem value="">Unracked / Loose</MenuItem>
												{racks.map((r) => (
													<MenuItem key={r.id} value={r.id}>
														{r.name} ({r.location?.name})
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
												type="number"
												label="U Position"
												placeholder="e.g. 21"
												sx={{ ...textFieldStyles, width: '180px' }}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<Place sx={{ color: 'warning.main' }} />
															</InputAdornment>
														),
													},
												}}
											/>
										)}
									/>
								</Stack>
							</Box>

							{/* SECTION 3: TECHNICAL DETAILS */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', letterSpacing: '1px' }}
								>
									TECHNICAL AUDIT
								</Typography>
								<Stack spacing={2.5}>
									<Stack direction="row" spacing={2}>
										<Controller
											name="serialNumber"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													label="Serial Number (S/N)"
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
											name="providedBy"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													label="Vendor / Agency"
													fullWidth
													sx={textFieldStyles}
													slotProps={{
														input: {
															startAdornment: (
																<InputAdornment position="start">
																	<Business sx={{ color: 'text.secondary' }} />
																</InputAdornment>
															),
														},
													}}
												/>
											)}
										/>
									</Stack>
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
																<CalendarMonth sx={{ color: 'success.main' }} />
															</InputAdornment>
														),
													},
												}}
											/>
										)}
									/>
								</Stack>
							</Box>

							{/* SECTION 4: REMARKS */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', letterSpacing: '1px' }}
								>
									ADDITIONAL INFO
								</Typography>
								<Controller
									name="description"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											multiline
											rows={3}
											label="Notes / Maintenance History"
											placeholder="Specify any initial configuration or port status..."
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

				{/* FOOTER */}
				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'addEquipmentDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<RtmLoadingButton
							type="submit"
							form="equipment-form"
							variant="contained"
							fullWidth
							disableElevation
							loading={isSaving}
							loadingText="Deploying..."
							sx={{
								bgcolor: 'primary.main',
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
								'&:hover': { bgcolor: 'primary.dark' },
							}}
						>
							Deploy Asset
						</RtmLoadingButton>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
