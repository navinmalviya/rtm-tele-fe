'use client';

import {
	AddCircleOutline,
	Business,
	Category,
	Close,
	Delete,
	ElectricBolt,
	Memory,
	Numbers,
	Search,
	Speed,
	Straighten,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	FormControlLabel,
	IconButton,
	InputAdornment,
	ListItemText,
	ListSubheader,
	MenuItem,
	Paper,
	Stack,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddEquipmentTemplate } from '@/hooks/eqiuipment-templates';
import { usePortTemplates } from '@/hooks/port-templates';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function AddEquipmentTemplateDrawer() {
	const dispatch = useDispatch();
	const { mutate: addTemplate, isLoading } = useAddEquipmentTemplate();
	const { data: portLibrary = [] } = usePortTemplates();
	const [searchTerm, setSearchTerm] = useState('');

	const {
		control,
		handleSubmit,
		watch,
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
			isPoe: false,
			switchingCapacity: '',
			isMPLSEnables: false,
			capacityKva: '',
			operatingMode: 'Online Double Conversion',
			batteryType: 'VRLA',
			defaultCellCount: 1,
			capacityAh: '',
			nominalCellVolt: 2.0,
			isSMRBased: false,
			portConfigs: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'portConfigs',
	});

	const selectedCategory = watch('category');
	const selectedSubCategory = watch('subCategory');
	const currentConfigs = watch('portConfigs');

	const handleFormSubmit = (formData) => {
		// Logic: Automatic Layer Assignment based on Sub-Category
		let autoLayer = null;
		if (formData.category === 'NETWORKING') {
			const layer3Types = ['L3_SWITCH', 'ROUTER', 'FIREWALL'];
			const layer2Types = ['L2_SWITCH', 'ACCESS_POINT'];

			if (layer3Types.includes(formData.subCategory)) autoLayer = 3;
			else if (layer2Types.includes(formData.subCategory)) autoLayer = 2;
		}

		const payload = {
			...formData,
			layer: autoLayer, // Automatically calculated
			uHeight: Number.parseInt(formData.uHeight),
			codalLifeYears: Number.parseInt(formData.codalLifeYears),
			switchingCapacity: formData.switchingCapacity
				? Number.parseFloat(formData.switchingCapacity)
				: null,
			capacityKva: formData.capacityKva ? Number.parseFloat(formData.capacityKva) : null,
			capacityAh: formData.capacityAh ? Number.parseFloat(formData.capacityAh) : null,
			defaultCellCount: Number.parseInt(formData.defaultCellCount),
			nominalCellVolt: Number.parseFloat(formData.nominalCellVolt),
		};
		addTemplate(payload);
	};

	const handleAddPortType = (portId) => {
		if (!portId) return;
		const exists = currentConfigs.some((cfg) => cfg.portTemplateId === portId);
		if (!exists) {
			const portData = portLibrary.find((p) => p.id === portId);
			append({
				portTemplateId: portId,
				quantity: 1,
				name: portData?.name || 'Unknown Port',
				meta: portData ? `${portData.category} | ${portData.type}` : '',
			});
		}
		setSearchTerm('');
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

	const customSelectProps = {
		MenuProps: {
			autoFocus: false,
			PaperProps: {
				sx: {
					bgcolor: 'white',
					boxShadow: '0px 8px 24px rgba(149, 157, 165, 0.2)',
					border: '1px solid #E2E8F0',
				},
			},
		},
	};

	const filteredPorts = portLibrary.filter((port) =>
		port.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

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
				{/* HEADER */}
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
							New Template
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
							Device Specification Library
						</Typography>
					</Box>
					<IconButton
						onClick={() => dispatch(closeDrawer({ drawerName: 'addTemplateDrawer' }))}
						sx={{ bgcolor: '#F1F5F9' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: '#F8FAFC' }}>
					<form id="template-form" onSubmit={handleSubmit(handleFormSubmit)}>
						<Stack spacing={4}>
							{/* SECTION 1: CORE IDENTITY */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: '#475569', letterSpacing: '1px' }}
								>
									CORE IDENTITY
								</Typography>
								<Stack spacing={2.5}>
									<Controller
										name="modelName"
										control={control}
										rules={{ required: 'Model Name is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Model Name"
												placeholder="e.g. C9200L-24T-4G"
												fullWidth
												error={!!errors.modelName}
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Memory sx={{ color: '#3B82F6' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
									<Stack direction="row" spacing={2} alignItems="center">
										<Controller
											name="make"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													label="Manufacturer"
													placeholder="Cisco"
													fullWidth
													sx={textFieldStyles}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<Business sx={{ color: '#64748B' }} />
															</InputAdornment>
														),
													}}
												/>
											)}
										/>
										<Controller
											name="isModular"
											control={control}
											render={({ field }) => (
												<FormControlLabel
													control={<Switch checked={field.value} onChange={field.onChange} />}
													label={
														<Typography variant="body2" sx={{ fontWeight: 600 }}>
															Modular
														</Typography>
													}
												/>
											)}
										/>
									</Stack>
								</Stack>
							</Box>

							{/* SECTION 2: CLASSIFICATION */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: '#475569', letterSpacing: '1px' }}
								>
									CLASSIFICATION
								</Typography>
								<Stack direction="row" spacing={2}>
									<Controller
										name="category"
										control={control}
										render={({ field }) => (
											<TextField
												select
												{...field}
												label="Category"
												fullWidth
												SelectProps={customSelectProps}
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Category sx={{ color: '#3B82F6' }} />
														</InputAdornment>
													),
												}}
											>
												{['NETWORKING', 'POWER', 'TRANSMISSION', 'COMPUTING'].map((c) => (
													<MenuItem key={c} value={c}>
														{c}
													</MenuItem>
												))}
											</TextField>
										)}
									/>
									<Controller
										name="subCategory"
										control={control}
										render={({ field }) => (
											<TextField
												select
												{...field}
												label="Sub-Category"
												fullWidth
												SelectProps={customSelectProps}
												sx={textFieldStyles}
											>
												{selectedCategory === 'NETWORKING' &&
													['L2_SWITCH', 'L3_SWITCH', 'ROUTER', 'FIREWALL'].map((s) => (
														<MenuItem key={s} value={s}>
															{s}
														</MenuItem>
													))}
												{selectedCategory === 'POWER' &&
													['UPS', 'BATTERY_SET', 'CHARGER', 'PDU'].map((s) => (
														<MenuItem key={s} value={s}>
															{s}
														</MenuItem>
													))}
											</TextField>
										)}
									/>
								</Stack>
							</Box>

							{/* SECTION 3: NETWORKING SPECS (AUTO-LAYER) */}
							{selectedCategory === 'NETWORKING' && (
								<Box
									sx={{ p: 3, bgcolor: '#EFF6FF', borderRadius: 3, border: '1px solid #DBEAFE' }}
								>
									<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
										<Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E40AF' }}>
											NETWORKING SPECS
										</Typography>
										<Typography
											variant="caption"
											sx={{
												bgcolor: '#DBEAFE',
												px: 1,
												py: 0.5,
												borderRadius: 1,
												fontWeight: 700,
												color: '#1E40AF',
											}}
										>
											{['L3_SWITCH', 'ROUTER', 'FIREWALL'].includes(selectedSubCategory)
												? 'AUTO: LAYER 3'
												: 'AUTO: LAYER 2'}
										</Typography>
									</Stack>
									<Stack spacing={2.5}>
										<Controller
											name="switchingCapacity"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													label="Switching Capacity (Gbps)"
													type="number"
													fullWidth
													sx={textFieldStyles}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<Speed sx={{ color: '#1E40AF' }} />
															</InputAdornment>
														),
													}}
												/>
											)}
										/>
										<Stack direction="row" spacing={4}>
											<Controller
												name="isPoe"
												control={control}
												render={({ field }) => (
													<FormControlLabel
														control={
															<Switch
																checked={field.value}
																onChange={field.onChange}
																color="primary"
															/>
														}
														label={
															<Typography variant="body2" sx={{ fontWeight: 600 }}>
																PoE Support
															</Typography>
														}
													/>
												)}
											/>
											<Controller
												name="isMPLSEnables"
												control={control}
												render={({ field }) => (
													<FormControlLabel
														control={<Switch checked={field.value} onChange={field.onChange} />}
														label={
															<Typography variant="body2" sx={{ fontWeight: 600 }}>
																MPLS Capable
															</Typography>
														}
													/>
												)}
											/>
										</Stack>
									</Stack>
								</Box>
							)}

							{/* SECTION 4: PORT CONFIGURATION */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: '#475569', letterSpacing: '1px' }}
								>
									PORT CONFIGURATION
								</Typography>
								<TextField
									select
									fullWidth
									label="Select Port Type from Library"
									value=""
									onChange={(e) => handleAddPortType(e.target.value)}
									sx={{ ...textFieldStyles, mb: 2 }}
									SelectProps={customSelectProps}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<AddCircleOutline sx={{ color: '#8B5CF6' }} />
											</InputAdornment>
										),
									}}
								>
									<ListSubheader disableSticky sx={{ bgcolor: 'white' }}>
										<TextField
											size="small"
											fullWidth
											placeholder="Search..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											onKeyDown={(e) => e.stopPropagation()}
											InputProps={{
												startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
											}}
										/>
									</ListSubheader>
									{filteredPorts.map((port) => (
										<MenuItem key={port.id} value={port.id}>
											<ListItemText
												primary={port.name}
												secondary={`${port.category} | ${port.type}`}
											/>
										</MenuItem>
									))}
								</TextField>

								<Stack spacing={1.5}>
									{fields.map((field, index) => (
										<Paper
											key={field.id}
											variant="outlined"
											sx={{ p: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #E2E8F0' }}
										>
											<Stack direction="row" spacing={2} alignItems="center">
												<Box sx={{ flexGrow: 1 }}>
													<Typography variant="body2" sx={{ fontWeight: 700 }}>
														{field.name}
													</Typography>
													<Typography variant="caption" sx={{ color: '#64748B' }}>
														{field.meta}
													</Typography>
												</Box>
												<Controller
													name={`portConfigs.${index}.quantity`}
													control={control}
													render={({ field: qtyField }) => (
														<TextField
															{...qtyField}
															label="Qty"
															type="number"
															size="small"
															sx={{ width: 80 }}
															InputProps={{
																startAdornment: (
																	<InputAdornment position="start">
																		<Numbers sx={{ fontSize: 16 }} />
																	</InputAdornment>
																),
															}}
														/>
													)}
												/>
												<IconButton onClick={() => remove(index)} color="error" size="small">
													<Delete fontSize="small" />
												</IconButton>
											</Stack>
										</Paper>
									))}
								</Stack>
							</Box>

							{/* SECTION 5: LOGISTICS */}
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: '#475569', letterSpacing: '1px' }}
								>
									LOGISTICS & SUPPLY
								</Typography>
								<Stack direction="row" spacing={2}>
									<Controller
										name="uHeight"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label="U Height"
												type="number"
												fullWidth
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Straighten sx={{ color: '#64748B' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
									<Controller
										name="supply"
										control={control}
										render={({ field }) => (
											<TextField
												select
												{...field}
												label="Supply"
												fullWidth
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<ElectricBolt sx={{ color: '#F59E0B' }} />
														</InputAdornment>
													),
												}}
											>
												<MenuItem value="230V AC">230V AC</MenuItem>
												<MenuItem value="-48V DC">-48V DC</MenuItem>
											</TextField>
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
							onClick={() => dispatch(closeDrawer({ drawerName: 'addTemplateDrawer' }))}
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
							sx={{ bgcolor: '#3B82F6', py: 1.5, fontWeight: 700, borderRadius: 2 }}
						>
							{isLoading ? 'Saving...' : 'Create Template'}
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
