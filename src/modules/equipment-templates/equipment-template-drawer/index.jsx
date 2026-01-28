'use client';

import {
	Business,
	Close,
	Memory,
	SettingsInputComponent,
	Straighten,
	Timer,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Checkbox,
	Divider,
	IconButton,
	InputAdornment,
	ListItemText,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddEquipmentTemplate } from '@/hooks/eqiuipment-templates';
import { usePortTemplates } from '@/hooks/port-templates'; // Assuming this exists to fetch library
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function AddEquipmentTemplateDrawer() {
	const dispatch = useDispatch();
	const { mutate: addTemplate, isLoading } = useAddEquipmentTemplate();
	const { data: portLibrary = [] } = usePortTemplates(); // Fetch standalone blueprints

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm({
		defaultValues: {
			make: '',
			modelName: '',
			category: 'NETWORKING',
			subCategory: 'L2_SWITCH',
			uHeight: 1,
			codalLifeYears: 12,
			isModular: false,
			supply: '230V AC',
			layer: 2,
			isPoe: false,
			switchingCapacity: '',
			capacityKva: '',
			operatingMode: 'Online Double Conversion',
			chemistry: 'VRLA',
			defaultCellCount: 1,
			capacityAh: '',
			nominalCellVolt: 2.0,
			portTemplateIds: [], // Linked IDs for Many-to-Many
		},
	});

	const selectedCategory = watch('category');
	const selectedSubCategory = watch('subCategory');

	const handleFormSubmit = (formData) => {
		// Ensure numeric types before sending to controller
		const payload = {
			...formData,
			uHeight: parseInt(formData.uHeight),
			codalLifeYears: parseInt(formData.codalLifeYears),
			switchingCapacity: formData.switchingCapacity
				? parseFloat(formData.switchingCapacity)
				: null,
			capacityKva: formData.capacityKva ? parseFloat(formData.capacityKva) : null,
			capacityAh: formData.capacityAh ? parseFloat(formData.capacityAh) : null,
		};
		addTemplate(payload);
	};

	// Design Language Styles
	const customSelectProps = {
		MenuProps: {
			PaperProps: {
				sx: {
					bgcolor: 'white',
					boxShadow: '0px 8px 24px rgba(149, 157, 165, 0.2)',
					border: '1px solid #E2E8F0',
					'& .MuiMenuItem-root': { fontSize: '0.875rem' },
				},
			},
		},
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
		<RtmDrawer drawerName="addTemplateDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 550 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'white',
				}}
			>
				{/* Header */}
				<Box
					sx={{
						p: 3,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Box>
						<Typography
							variant="h6"
							sx={{ fontWeight: 800, color: '#0F172A' }}
						>
							New Equipment Template
						</Typography>
						<Typography
							variant="caption"
							sx={{ fontWeight: 600, color: '#64748B' }}
						>
							Hardware Blueprint Library
						</Typography>
					</Box>
					<IconButton
						onClick={() =>
							dispatch(
								closeDrawer({
									drawerName: 'addTemplateDrawer',
								})
							)
						}
						sx={{ bgcolor: '#F1F5F9' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box
					sx={{
						p: 4,
						flexGrow: 1,
						overflowY: 'auto',
						bgcolor: '#F8FAFC',
					}}
				>
					<form
						id="template-form"
						onSubmit={handleSubmit(handleFormSubmit)}
					>
						<Stack spacing={4}>
							{/* SECTION 1: IDENTITY */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										mb: 2,
										color: '#475569',
										letterSpacing:
											'1px',
									}}
								>
									CORE IDENTITY
								</Typography>
								<Stack spacing={2.5}>
									<Controller
										name="modelName"
										control={control}
										rules={{
											required: 'Model Name is required',
										}}
										render={({
											field,
										}) => (
											<TextField
												{...field}
												label="Model Name"
												fullWidth
												error={
													!!errors.modelName
												}
												sx={
													textFieldStyles
												}
												InputProps={{
													startAdornment:
														(
															<InputAdornment position="start">
																<Memory
																	sx={{
																		color: '#3B82F6',
																	}}
																/>
															</InputAdornment>
														),
												}}
											/>
										)}
									/>
									<Controller
										name="make"
										control={control}
										render={({
											field,
										}) => (
											<TextField
												{...field}
												label="Manufacturer"
												fullWidth
												sx={
													textFieldStyles
												}
												InputProps={{
													startAdornment:
														(
															<InputAdornment position="start">
																<Business
																	sx={{
																		color: '#64748B',
																	}}
																/>
															</InputAdornment>
														),
												}}
											/>
										)}
									/>
								</Stack>
							</Box>

							{/* SECTION 2: CLASSIFICATION */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										mb: 2,
										color: '#475569',
										letterSpacing:
											'1px',
									}}
								>
									CLASSIFICATION
								</Typography>
								<Stack direction="row" spacing={2}>
									<Controller
										name="category"
										control={control}
										render={({
											field,
										}) => (
											<TextField
												select
												{...field}
												label="Category"
												fullWidth
												SelectProps={
													customSelectProps
												}
												sx={
													textFieldStyles
												}
											>
												{[
													'NETWORKING',
													'POWER',
													'TRANSMISSION',
													'COMPUTING',
												].map(
													(
														c
													) => (
														<MenuItem
															key={
																c
															}
															value={
																c
															}
														>
															{
																c
															}
														</MenuItem>
													)
												)}
											</TextField>
										)}
									/>
									<Controller
										name="subCategory"
										control={control}
										render={({
											field,
										}) => (
											<TextField
												select
												{...field}
												label="Sub-Category"
												fullWidth
												SelectProps={
													customSelectProps
												}
												sx={
													textFieldStyles
												}
											>
												{selectedCategory ===
													'NETWORKING' &&
													[
														'L2_SWITCH',
														'L3_SWITCH',
														'ROUTER',
														'FIREWALL',
													].map(
														(
															s
														) => (
															<MenuItem
																key={
																	s
																}
																value={
																	s
																}
															>
																{
																	s
																}
															</MenuItem>
														)
													)}
												{selectedCategory ===
													'POWER' &&
													[
														'UPS',
														'BATTERY_SET',
														'PDU',
													].map(
														(
															s
														) => (
															<MenuItem
																key={
																	s
																}
																value={
																	s
																}
															>
																{
																	s
																}
															</MenuItem>
														)
													)}
											</TextField>
										)}
									/>
								</Stack>
							</Box>

							{/* SECTION 3: PORT ASSIGNMENT (THE LIBRARY LINK) */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										mb: 2,
										color: '#475569',
										letterSpacing:
											'1px',
									}}
								>
									INTERFACE BLUEPRINTS
								</Typography>
								<Controller
									name="portTemplateIds"
									control={control}
									render={({ field }) => (
										<TextField
											select
											{...field}
											label="Assign Ports from Library"
											fullWidth
											sx={
												textFieldStyles
											}
											SelectProps={{
												multiple: true,
												...customSelectProps,
												renderValue:
													(
														selected
													) => {
														const names =
															portLibrary
																.filter(
																	(
																		p
																	) =>
																		selected.includes(
																			p.id
																		)
																)
																.map(
																	(
																		p
																	) =>
																		p.name
																);
														return names.join(
															', '
														);
													},
											}}
											InputProps={{
												startAdornment:
													(
														<InputAdornment position="start">
															<SettingsInputComponent
																sx={{
																	color: '#8B5CF6',
																}}
															/>
														</InputAdornment>
													),
											}}
										>
											{portLibrary.map(
												(
													port
												) => (
													<MenuItem
														key={
															port.id
														}
														value={
															port.id
														}
													>
														<Checkbox
															checked={
																field.value.indexOf(
																	port.id
																) >
																-1
															}
														/>
														<ListItemText
															primary={
																port.name
															}
															secondary={`${port.category} | ${port.type}`}
														/>
													</MenuItem>
												)
											)}
										</TextField>
									)}
								/>
							</Box>

							{/* SECTION 4: PHYSICAL & ELECTRICAL */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										mb: 2,
										color: '#475569',
										letterSpacing:
											'1px',
									}}
								>
									LOGISTICS & POWER
								</Typography>
								<Stack spacing={2.5}>
									<Stack
										direction="row"
										spacing={2}
									>
										<Controller
											name="uHeight"
											control={
												control
											}
											render={({
												field,
											}) => (
												<TextField
													{...field}
													label="Height (U)"
													type="number"
													fullWidth
													sx={
														textFieldStyles
													}
													InputProps={{
														startAdornment:
															(
																<InputAdornment position="start">
																	<Straighten />
																</InputAdornment>
															),
													}}
												/>
											)}
										/>
										<Controller
											name="supply"
											control={
												control
											}
											render={({
												field,
											}) => (
												<TextField
													select
													{...field}
													label="Power Supply"
													fullWidth
													sx={
														textFieldStyles
													}
													SelectProps={
														customSelectProps
													}
												>
													<MenuItem value="230V AC">
														230V
														AC
													</MenuItem>
													<MenuItem value="-48V DC">
														-48V
														DC
													</MenuItem>
												</TextField>
											)}
										/>
									</Stack>
									<Controller
										name="codalLifeYears"
										control={control}
										render={({
											field,
										}) => (
											<TextField
												{...field}
												label="Codal Life (Years)"
												type="number"
												fullWidth
												sx={
													textFieldStyles
												}
												InputProps={{
													startAdornment:
														(
															<InputAdornment position="start">
																<Timer />
															</InputAdornment>
														),
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

				<Box sx={{ p: 3, bgcolor: '#F8FAFC' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() =>
								dispatch(
									closeDrawer({
										drawerName: 'addTemplateDrawer',
									})
								)
							}
							sx={{ fontWeight: 700, color: '#64748B' }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="template-form"
							variant="contained"
							fullWidth
							disableElevation
							sx={{
								bgcolor: '#3B82F6',
								py: 1.5,
								fontWeight: 700,
								borderRadius: 2,
							}}
						>
							{isLoading
								? 'Saving...'
								: 'Create Template'}
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
