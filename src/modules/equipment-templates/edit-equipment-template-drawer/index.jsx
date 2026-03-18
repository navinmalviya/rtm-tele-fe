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
	MenuItem,
	Paper,
	Stack,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useUpdateEquipmentTemplate } from '@/hooks/eqiuipment-templates';
import { usePortTemplates } from '@/hooks/port-templates';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function EditEquipmentTemplateDrawer({ template }) {
	const dispatch = useDispatch();
	const { mutate: updateTemplate, isLoading } = useUpdateEquipmentTemplate();
	const { data: portLibrary = [] } = usePortTemplates();
	const [searchTerm, setSearchTerm] = useState('');

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors, isDirty },
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

	useEffect(() => {
		if (!template) return;
		reset({
			make: template.make || '',
			modelName: template.modelName || '',
			category: template.category || 'NETWORKING',
			subCategory: template.subCategory || 'L2_SWITCH',
			uHeight: template.uHeight ?? 1,
			codalLifeYears: template.codalLifeYears ?? 12,
			isModular: template.isModular ?? false,
			supply: template.supply || '230V AC',
			isPoe: template.isPoe ?? false,
			switchingCapacity: template.switchingCapacity ?? '',
			isMPLSEnables: template.isMPLSEnables ?? false,
			capacityKva: template.capacityKva ?? '',
			operatingMode: template.operatingMode || 'Online Double Conversion',
			batteryType: template.batteryType || 'VRLA',
			defaultCellCount: template.defaultCellCount ?? 1,
			capacityAh: template.capacityAh ?? '',
			nominalCellVolt: template.nominalCellVolt ?? 2.0,
			isSMRBased: template.isSMRBased ?? false,
			portConfigs: (template.portConfigs || []).map((cfg) => ({
				portTemplateId: cfg.portTemplateId,
				quantity: cfg.quantity ?? 1,
				name: cfg.portTemplate?.name || cfg.portTemplate?.type || 'Unknown Port',
				meta: cfg.portTemplate ? `${cfg.portTemplate.category} | ${cfg.portTemplate.type}` : '',
			})),
		});
	}, [template, reset]);

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'portConfigs',
	});

	const selectedCategory = watch('category');
	const currentConfigs = watch('portConfigs');

	const handleCategoryChange = (e, onChange) => {
		const newCat = e.target.value;
		onChange(e);
		if (newCat === 'SIGNALLING') {
			setValue('subCategory', 'BPAC');
			setValue('uHeight', 0);
		} else if (newCat === 'NETWORKING') {
			setValue('subCategory', 'L2_SWITCH');
			setValue('uHeight', 1);
		}
	};

	const handleFormSubmit = (formData) => {
		const parseOptionalInt = (value, fallback = null) => {
			const parsed = Number.parseInt(value, 10);
			return Number.isFinite(parsed) ? parsed : fallback;
		};
		const parseOptionalFloat = (value, fallback = null) => {
			const parsed = Number.parseFloat(value);
			return Number.isFinite(parsed) ? parsed : fallback;
		};

		if (!template?.id) return;
		let autoLayer = null;
		if (formData.category === 'NETWORKING') {
			const layer3Types = ['L3_SWITCH', 'ROUTER', 'FIREWALL'];
			const layer2Types = ['L2_SWITCH', 'ACCESS_POINT'];
			if (layer3Types.includes(formData.subCategory)) autoLayer = 3;
			else if (layer2Types.includes(formData.subCategory)) autoLayer = 2;
		}

		const payload = {
			...formData,
			layer: autoLayer,
			uHeight: formData.category === 'SIGNALLING' ? null : parseOptionalInt(formData.uHeight, 1),
			codalLifeYears: parseOptionalInt(formData.codalLifeYears, 12),
			switchingCapacity: parseOptionalFloat(formData.switchingCapacity),
			capacityKva: parseOptionalFloat(formData.capacityKva),
			capacityAh: parseOptionalFloat(formData.capacityAh),
			defaultCellCount: parseOptionalInt(formData.defaultCellCount, 1),
			nominalCellVolt: parseOptionalFloat(formData.nominalCellVolt, 2.0),
		};
		updateTemplate({ id: template.id, templateData: payload });
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
		bgcolor: 'background.paper',
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
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
			},
		},
	};

	const filteredPorts = portLibrary.filter((port) =>
		port.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<RtmDrawer drawerName="editEquipmentTemplateDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 550 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 4, pb: 2 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
								Edit Template
							</Typography>
							<Typography
								variant="body2"
								sx={{ fontWeight: 600, color: 'text.secondary', mt: 0.5 }}
							>
								Update equipment blueprint metadata
							</Typography>
						</Box>
						<IconButton
							onClick={() => dispatch(closeDrawer({ drawerName: 'editEquipmentTemplateDrawer' }))}
							sx={{ bgcolor: 'action.hover' }}
						>
							<Close fontSize="small" />
						</IconButton>
					</Stack>
				</Box>

				<Divider sx={{ mx: 4, borderColor: 'divider' }} />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="edit-template-form" onSubmit={handleSubmit(handleFormSubmit)}>
						<Stack spacing={4}>
							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}
								>
									BASIC INFORMATION
								</Typography>
								<Stack spacing={2.5}>
									<Controller
										name="make"
										control={control}
										rules={{ required: 'Manufacturer is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Manufacturer"
												fullWidth
												error={!!errors.make}
												helperText={errors.make?.message}
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Business sx={{ color: 'primary.main' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
									<Controller
										name="modelName"
										control={control}
										rules={{ required: 'Model name is required' }}
										render={({ field }) => (
											<TextField
												{...field}
												label="Model Name"
												fullWidth
												error={!!errors.modelName}
												helperText={errors.modelName?.message}
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Memory sx={{ color: 'secondary.main' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
									<Controller
										name="category"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												select
												label="Category"
												fullWidth
												sx={textFieldStyles}
												onChange={(e) => handleCategoryChange(e, field.onChange)}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Category sx={{ color: 'warning.main' }} />
														</InputAdornment>
													),
												}}
												SelectProps={{ MenuProps: customSelectProps }}
											>
												<MenuItem value="NETWORKING">Networking</MenuItem>
												<MenuItem value="SIGNALLING">Signalling</MenuItem>
												<MenuItem value="POWER">Power</MenuItem>
												<MenuItem value="WIRELESS">Wireless</MenuItem>
												<MenuItem value="OFC">OFC</MenuItem>
											</TextField>
										)}
									/>
									{selectedCategory && (
										<Controller
											name="subCategory"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Sub Category"
													fullWidth
													sx={textFieldStyles}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<Numbers sx={{ color: 'info.main' }} />
															</InputAdornment>
														),
													}}
													SelectProps={{ MenuProps: customSelectProps }}
												>
													{selectedCategory === 'NETWORKING' && (
														<>
															<MenuItem value="L2_SWITCH">L2 Switch</MenuItem>
															<MenuItem value="L3_SWITCH">L3 Switch</MenuItem>
															<MenuItem value="ROUTER">Router</MenuItem>
															<MenuItem value="FIREWALL">Firewall</MenuItem>
															<MenuItem value="ACCESS_POINT">Access Point</MenuItem>
														</>
													)}
													{selectedCategory === 'SIGNALLING' && (
														<MenuItem value="BPAC">BPAC</MenuItem>
													)}
												</TextField>
											)}
										/>
									)}
								</Stack>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}
								>
									TECHNICAL SPECS
								</Typography>
								<Stack spacing={2.5}>
									<Controller
										name="uHeight"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label="U Height"
												type="number"
												fullWidth
												disabled={selectedCategory === 'SIGNALLING'}
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Straighten sx={{ color: 'text.secondary' }} />
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
												{...field}
												label="Power Supply"
												fullWidth
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<ElectricBolt sx={{ color: 'warning.main' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
									<Controller
										name="codalLifeYears"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												type="number"
												label="Codal Life (Years)"
												fullWidth
												sx={textFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Numbers sx={{ color: 'info.main' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
								</Stack>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}
								>
									ADVANCED OPTIONS
								</Typography>
								<Stack spacing={2}>
									<FormControlLabel
										control={
											<Controller
												name="isModular"
												control={control}
												render={({ field }) => <Switch {...field} checked={!!field.value} />}
											/>
										}
										label="Modular Design"
									/>
									<FormControlLabel
										control={
											<Controller
												name="isPoe"
												control={control}
												render={({ field }) => <Switch {...field} checked={!!field.value} />}
											/>
										}
										label="PoE Enabled"
									/>
									<FormControlLabel
										control={
											<Controller
												name="isMPLSEnables"
												control={control}
												render={({ field }) => <Switch {...field} checked={!!field.value} />}
											/>
										}
										label="MPLS Enabled"
									/>
									<FormControlLabel
										control={
											<Controller
												name="isSMRBased"
												control={control}
												render={({ field }) => <Switch {...field} checked={!!field.value} />}
											/>
										}
										label="SMR Based"
									/>
								</Stack>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}
								>
									PORT CONFIGURATION
								</Typography>

								<Paper
									variant="outlined"
									sx={{
										p: 2,
										borderRadius: 3,
										bgcolor: 'background.paper',
										borderColor: 'divider',
									}}
								>
									<TextField
										fullWidth
										placeholder="Search port template..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Search sx={{ color: 'text.disabled' }} />
												</InputAdornment>
											),
										}}
										sx={textFieldStyles}
									/>
									{searchTerm.length > 0 && (
										<Paper
											variant="outlined"
											sx={{
												mt: 1,
												maxHeight: 200,
												overflowY: 'auto',
												borderColor: 'divider',
											}}
										>
											{filteredPorts.length === 0 && (
												<Typography sx={{ p: 2, color: 'text.secondary' }}>
													No port templates found.
												</Typography>
											)}
											{filteredPorts.map((port) => (
												<MenuItem key={port.id} onClick={() => handleAddPortType(port.id)}>
													<ListItemText
														primary={port.name}
														secondary={`${port.category} • ${port.type}`}
													/>
												</MenuItem>
											))}
										</Paper>
									)}

									<Stack spacing={2} sx={{ mt: 2 }}>
										{fields.map((field, index) => (
											<Paper
												key={field.id}
												variant="outlined"
												sx={{
													p: 1.5,
													borderRadius: 2,
													borderColor: 'divider',
													display: 'flex',
													gap: 2,
													alignItems: 'center',
													bgcolor: alpha('#000', 0.02),
												}}
											>
												<Box sx={{ flex: 1 }}>
													<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
														{field.name}
													</Typography>
													<Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
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
															sx={{ width: 100 }}
														/>
													)}
												/>
												<IconButton onClick={() => remove(index)}>
													<Delete fontSize="small" />
												</IconButton>
											</Paper>
										))}
									</Stack>

									<Button
										variant="text"
										startIcon={<AddCircleOutline />}
										sx={{ mt: 2, textTransform: 'none', fontWeight: 700 }}
										onClick={() => setSearchTerm('')}
									>
										Add Port Type
									</Button>
								</Paper>
							</Box>
						</Stack>
					</form>
				</Box>

				<Divider sx={{ mx: 4, borderColor: 'divider' }} />

				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() => dispatch(closeDrawer({ drawerName: 'editEquipmentTemplateDrawer' }))}
							sx={{ fontWeight: 700, color: 'text.secondary' }}
						>
							Cancel
						</Button>
						<RtmLoadingButton
							type="submit"
							form="edit-template-form"
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
