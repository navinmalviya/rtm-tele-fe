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
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

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
			uPosition: data.uPosition ? Number.parseInt(data.uPosition) : null,
		};
		console.log('pay', payload);
		addEquipment(payload);
	};

	// Blueprint Design System Styles
	const textFieldStyles = {
		bgcolor: 'white',
		borderRadius: 2,
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
			'& .MuiSelect-select': { bgcolor: 'white' },
			'& fieldset': { borderColor: '#E2E8F0' },
			'&:hover fieldset': { borderColor: '#CBD5E1' },
			'&.Mui-focused fieldset': { borderColor: '#3B82F6' },
		},
	};

	const customSelectProps = {
		autoFocus: false,
		PaperProps: {
			sx: {
				bgcolor: 'white',
				boxShadow: '0px 8px 24px rgba(149,157,165,0.2)',
				border: '1px solid #E2E8F0',
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
					bgcolor: 'white',
				}}
			>
				{/* HEADER */}
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
							Deploy New Asset
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
							Physical Instance Registration
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'addEquipmentDrawer' }))}
						sx={{ bgcolor: '#F1F5F9' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: '#F8FAFC' }}>
					<form id="equipment-form" onSubmit={handleSubmit(onFormSubmit)}>
						<Stack spacing={4}>
							{/* SECTION 1: IDENTITY & MODEL */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: '#475569', letterSpacing: '1px' }}
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
																<Inventory sx={{ color: '#3B82F6' }} />
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
																<Memory sx={{ color: '#8B5CF6' }} />
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
									sx={{ fontWeight: 700, mb: 2, color: '#475569', letterSpacing: '1px' }}
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
																<Dns sx={{ color: '#64748B' }} />
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
																<Place sx={{ color: '#F59E0B' }} />
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
									sx={{ fontWeight: 700, mb: 2, color: '#475569', letterSpacing: '1px' }}
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
																	<Pin sx={{ color: '#64748B' }} />
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
																	<Business sx={{ color: '#64748B' }} />
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
												sx={textFieldStyles}
												slotProps={{
													input: {
														startAdornment: (
															<InputAdornment position="start">
																<CalendarMonth sx={{ color: '#10B981' }} />
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
									sx={{ fontWeight: 700, mb: 2, color: '#475569', letterSpacing: '1px' }}
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
															<Description sx={{ color: '#64748B' }} />
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
				<Box sx={{ p: 3, bgcolor: '#F8FAFC' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'addEquipmentDrawer' }))}
							sx={{ fontWeight: 700, color: '#64748B' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="equipment-form"
							variant="contained"
							fullWidth
							disableElevation
							disabled={isSaving}
							sx={{
								bgcolor: '#3B82F6',
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
								'&:hover': { bgcolor: '#2563EB' },
							}}
						>
							{isSaving ? 'Deploying...' : 'Deploy Asset'}
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
