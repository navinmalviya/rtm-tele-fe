'use client';

import {
	Add,
	Category,
	CheckCircle,
	CheckCircleOutline,
	Close,
	DeleteOutline,
	EditOutlined,
	ElectricalServices,
	FormatListBulleted,
	LabelOutlined,
	NotesOutlined,
	PlaylistAddCheckCircle,
	Straighten,
	Tag,
	Title,
	VisibilityOutlined,
	VpnKey,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Chip,
	Divider,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	useApproveStationCircuit,
	useCreateDivisionCircuit,
	useDeactivateDivisionCircuit,
	useDivisionCircuits,
	useRejectStationCircuit,
	useStationCircuits,
	useUpdateDivisionCircuit,
} from '@/hooks/circuits';
import { useTabs } from '@/hooks/common';
import RtmDataGrid from '@/lib/common/datagrid';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import RtmTabs from '@/lib/common/tabs';
import { closeDrawer, openDrawer } from '@/lib/store/slices/drawer-slice';

const CIRCUIT_TABS = [
	{
		label: 'Division Circuit Master',
		step: 'masters',
		icon: <ElectricalServices sx={{ fontSize: 18 }} />,
	},
	{
		label: 'Approval Queue',
		step: 'approvals',
		icon: <PlaylistAddCheckCircle sx={{ fontSize: 18 }} />,
	},
];

const VIEW_CIRCUIT_MASTER_DIALOG = 'viewCircuitMasterDialog';
const EDIT_CIRCUIT_MASTER_DIALOG = 'editCircuitMasterDialog';
const REJECT_CIRCUIT_DIALOG = 'rejectStationCircuitDialog';
const ADD_CIRCUIT_MASTER_DIALOG = 'addCircuitMasterDialog';

const emptyField = () => ({
	key: '',
	label: '',
	type: 'TEXT',
	required: false,
	unit: '',
	options: '',
});

const schemaToFields = (schema = []) => {
	if (!Array.isArray(schema) || schema.length === 0) return [emptyField()];
	return schema.map((field) => ({
		key: field?.key || '',
		label: field?.label || '',
		type: field?.type || 'TEXT',
		required: Boolean(field?.required),
		unit: field?.unit || '',
		options: Array.isArray(field?.options) ? field.options.join(', ') : '',
	}));
};

const fieldsToSchema = (fields = []) =>
	fields
		.filter((field) => field.label.trim())
		.map((field) => ({
			key: field.key,
			label: field.label,
			type: field.type,
			required: field.required,
			unit: field.unit || null,
			options:
				field.type === 'SELECT'
					? field.options
							.split(',')
							.map((item) => item.trim())
							.filter(Boolean)
					: [],
		}));

const withFieldIcon = (icon) => ({
	startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
});

export default function CircuitsPage() {
	const dispatch = useDispatch();
	const { currentTab } = useTabs('testroomCircuits', { currentTab: 'masters' });
	const { data: masterCircuits = [], isLoading: loadingMasters } = useDivisionCircuits({
		includeInactive: true,
	});
	const { data: pendingCircuits = [], isLoading: loadingPending } = useStationCircuits({
		status: 'PENDING',
	});
	const { mutate: createMaster, isLoading: creatingMaster } = useCreateDivisionCircuit();
	const { mutate: updateMaster, isLoading: updatingMaster } = useUpdateDivisionCircuit();
	const { mutate: deactivateMaster } = useDeactivateDivisionCircuit();
	const { mutate: approveCircuit } = useApproveStationCircuit();
	const { mutate: rejectCircuit } = useRejectStationCircuit();

	const [formState, setFormState] = useState({
		code: '',
		name: '',
		description: '',
		fields: [emptyField()],
	});
	const [editForm, setEditForm] = useState({
		code: '',
		name: '',
		description: '',
		isActive: true,
		fields: [emptyField()],
	});
	const [rejectReason, setRejectReason] = useState('');
	const viewDialogState = useSelector((state) => state.drawers?.[VIEW_CIRCUIT_MASTER_DIALOG]);
	const editDialogState = useSelector((state) => state.drawers?.[EDIT_CIRCUIT_MASTER_DIALOG]);
	const rejectDialogState = useSelector((state) => state.drawers?.[REJECT_CIRCUIT_DIALOG]);

	const masterById = useMemo(
		() => new Map(masterCircuits.map((item) => [item.id, item])),
		[masterCircuits]
	);
	const viewedMaster = useMemo(
		() => masterById.get(viewDialogState?.masterId) || null,
		[masterById, viewDialogState?.masterId]
	);
	const editingMaster = useMemo(
		() => masterById.get(editDialogState?.masterId) || null,
		[masterById, editDialogState?.masterId]
	);

	const hasCreateFields = useMemo(
		() => formState.fields.some((field) => field.label.trim()),
		[formState.fields]
	);
	const hasEditFields = useMemo(
		() => editForm.fields.some((field) => field.label.trim()),
		[editForm.fields]
	);

	useEffect(() => {
		if (!editDialogState?.isOpen || !editingMaster) return;
		setEditForm({
			code: editingMaster.code || '',
			name: editingMaster.name || '',
			description: editingMaster.description || '',
			isActive: Boolean(editingMaster.isActive),
			fields: schemaToFields(editingMaster.checklistSchema),
		});
	}, [editDialogState?.isOpen, editingMaster]);

	const onChangeField = (setter, index, key, value) => {
		setter((prev) => ({
			...prev,
			fields: prev.fields.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)),
		}));
	};

	const onAddField = (setter) => {
		setter((prev) => ({ ...prev, fields: [...prev.fields, emptyField()] }));
	};

	const onRemoveField = (setter, index) => {
		setter((prev) => ({
			...prev,
			fields: prev.fields.filter((_, idx) => idx !== index),
		}));
	};

	const submitMaster = () => {
		const checklistSchema = fieldsToSchema(formState.fields);

		createMaster(
			{
				code: formState.code || formState.name,
				name: formState.name,
				description: formState.description || null,
				checklistSchema,
			},
			{
				onSuccess: () => {
					setFormState({
						code: '',
						name: '',
						description: '',
						fields: [emptyField()],
					});
					dispatch(closeDrawer({ drawerName: ADD_CIRCUIT_MASTER_DIALOG }));
				},
			}
		);
	};

	const openAddDialog = () => {
		dispatch(openDrawer({ drawerName: ADD_CIRCUIT_MASTER_DIALOG }));
	};

	const closeAddDialog = () => {
		dispatch(closeDrawer({ drawerName: ADD_CIRCUIT_MASTER_DIALOG }));
		setFormState({
			code: '',
			name: '',
			description: '',
			fields: [emptyField()],
		});
	};

	const openEditDialog = (masterId) => {
		if (!masterById.get(masterId)) return;
		dispatch(
			openDrawer({
				drawerName: EDIT_CIRCUIT_MASTER_DIALOG,
				masterId,
			})
		);
	};

	const submitEditMaster = () => {
		if (!editingMaster?.id) return;
		const checklistSchema = fieldsToSchema(editForm.fields);
		updateMaster(
			{
				id: editingMaster.id,
				payload: {
					code: editForm.code || editForm.name,
					name: editForm.name,
					description: editForm.description || null,
					isActive: editForm.isActive,
					checklistSchema,
				},
			},
			{
				onSuccess: () => {
					dispatch(closeDrawer({ drawerName: EDIT_CIRCUIT_MASTER_DIALOG }));
					resetEditForm();
				},
			}
		);
	};

	const closeViewDialog = () => {
		dispatch(closeDrawer({ drawerName: VIEW_CIRCUIT_MASTER_DIALOG }));
	};

	const resetEditForm = () => {
		setEditForm({
			code: '',
			name: '',
			description: '',
			isActive: true,
			fields: [emptyField()],
		});
	};

	const closeEditDialog = () => {
		dispatch(closeDrawer({ drawerName: EDIT_CIRCUIT_MASTER_DIALOG }));
		resetEditForm();
	};

	const masterRows = useMemo(
		() =>
			masterCircuits.map((item) => ({
				id: item.id,
				code: item.code,
				name: item.name,
				description: item.description || '-',
				status: item.isActive ? 'ACTIVE' : 'INACTIVE',
				fields: Array.isArray(item.checklistSchema) ? item.checklistSchema.length : 0,
				linkedStations: item._count?.stationCircuits || 0,
			})),
		[masterCircuits]
	);

	const pendingRows = useMemo(
		() =>
			pendingCircuits.map((item) => ({
				id: item.id,
				circuit: `${item.circuitMaster?.name || '-'}${item.identifier ? ` • ${item.identifier}` : ''}`,
				station: item.station ? `${item.station.name} (${item.station.code})` : '-',
				location: item.location?.name || '-',
				requestedBy: item.requestedBy?.name || '-',
				maintainedBy: item.maintainedBy?.name || '-',
				createdAt: item.createdAt,
			})),
		[pendingCircuits]
	);
	const pendingById = useMemo(
		() => new Map(pendingRows.map((item) => [item.id, item])),
		[pendingRows]
	);
	const rejectingCircuit = useMemo(
		() => pendingById.get(rejectDialogState?.circuitId) || null,
		[pendingById, rejectDialogState?.circuitId]
	);

	const openRejectDialog = (circuitId) => {
		setRejectReason('');
		dispatch(
			openDrawer({
				drawerName: REJECT_CIRCUIT_DIALOG,
				circuitId,
			})
		);
	};

	const resetRejectDialog = () => {
		setRejectReason('');
	};

	const closeRejectDialog = () => {
		dispatch(closeDrawer({ drawerName: REJECT_CIRCUIT_DIALOG }));
		resetRejectDialog();
	};

	return (
		<Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, display: 'flex' }}>
						<ElectricalServices sx={{ color: 'text.secondary' }} />
					</Box>
					<Box>
						<Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
							Circuit Registry
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
							Division checklist masters and JE/SSE station-circuit approvals
						</Typography>
					</Box>
				</Stack>
			</Box>

			<RtmTabs
				tabs={CIRCUIT_TABS}
				tabsName="testroomCircuits"
				initialState={{ currentTab: 'masters' }}
			/>

			{currentTab === 'masters' && (
				<>
					<Stack direction="row" justifyContent="flex-end">
						<Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
							Add Circuit Master
						</Button>
					</Stack>

					<RtmDataGrid
						rows={masterRows}
						loading={loadingMasters}
						columns={[
							{ field: 'code', headerName: 'Code', flex: 0.8 },
							{ field: 'name', headerName: 'Name', flex: 1.2 },
							{ field: 'description', headerName: 'Description', flex: 1.4 },
							{ field: 'fields', headerName: 'Fields', flex: 0.6 },
							{ field: 'linkedStations', headerName: 'Linked', flex: 0.6 },
							{
								field: 'status',
								headerName: 'Status',
								flex: 0.7,
								renderCell: (params) => (
									<Chip
										size="small"
										label={params.value}
										color={params.value === 'ACTIVE' ? 'success' : 'default'}
									/>
								),
							},
							{
								field: 'actions',
								headerName: 'Actions',
								flex: 1.2,
								sortable: false,
								filterable: false,
								renderCell: (params) => (
									<Stack direction="row" spacing={0.5}>
										<Tooltip title="View">
											<IconButton
												onClick={() =>
													dispatch(
														openDrawer({
															drawerName: VIEW_CIRCUIT_MASTER_DIALOG,
															masterId: params.row.id,
														})
													)
												}
											>
												<VisibilityOutlined />
											</IconButton>
										</Tooltip>
										<Tooltip title="Edit">
											<IconButton onClick={() => openEditDialog(params.row.id)}>
												<EditOutlined />
											</IconButton>
										</Tooltip>
										<Tooltip title="Deactivate master">
											<IconButton
												onClick={() => deactivateMaster(params.row.id)}
												disabled={params.row.status !== 'ACTIVE'}
											>
												<DeleteOutline />
											</IconButton>
										</Tooltip>
									</Stack>
								),
							},
						]}
					/>
				</>
			)}

			{currentTab === 'approvals' && (
				<RtmDataGrid
					rows={pendingRows}
					loading={loadingPending}
					columns={[
						{ field: 'circuit', headerName: 'Circuit', flex: 1.4 },
						{ field: 'station', headerName: 'Station', flex: 1 },
						{ field: 'location', headerName: 'Location', flex: 0.8 },
						{ field: 'requestedBy', headerName: 'Requested By', flex: 1 },
						{ field: 'maintainedBy', headerName: 'Maintained By', flex: 1 },
						{
							field: 'createdAt',
							headerName: 'Requested On',
							flex: 0.9,
							renderCell: (params) => new Date(params.value).toLocaleDateString('en-IN'),
						},
						{
							field: 'actions',
							headerName: 'Actions',
							flex: 0.8,
							sortable: false,
							filterable: false,
							renderCell: (params) => (
								<Stack direction="row" spacing={1}>
									<Tooltip title="Approve">
										<IconButton onClick={() => approveCircuit({ id: params.row.id, payload: {} })}>
											<CheckCircle color="success" />
										</IconButton>
									</Tooltip>
									<Tooltip title="Reject">
										<IconButton onClick={() => openRejectDialog(params.row.id)}>
											<DeleteOutline color="error" />
										</IconButton>
									</Tooltip>
								</Stack>
							),
						},
					]}
				/>
			)}

			<RtmDrawer drawerName={VIEW_CIRCUIT_MASTER_DIALOG} onCancel={closeViewDialog}>
				<Box
					sx={{
						width: { xs: '100vw', md: 980 },
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						bgcolor: 'background.paper',
					}}
				>
					<Box
						sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
					>
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							Circuit Master Details
						</Typography>
						<IconButton onClick={closeViewDialog} sx={{ bgcolor: 'action.hover' }}>
							<Close fontSize="small" />
						</IconButton>
					</Box>
					<Divider />
					<Box sx={{ p: 3, flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
						{viewedMaster && (
							<Stack spacing={2}>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
									<TextField
										label="Code"
										value={viewedMaster.code || '-'}
										fullWidth
										InputProps={{
											readOnly: true,
											...withFieldIcon(<Tag sx={{ color: 'primary.main' }} fontSize="small" />),
										}}
									/>
									<TextField
										label="Name"
										value={viewedMaster.name || '-'}
										fullWidth
										InputProps={{
											readOnly: true,
											...withFieldIcon(<Title sx={{ color: 'primary.main' }} fontSize="small" />),
										}}
									/>
									<TextField
										label="Status"
										value={viewedMaster.isActive ? 'ACTIVE' : 'INACTIVE'}
										sx={{ minWidth: 160 }}
										InputProps={{
											readOnly: true,
											...withFieldIcon(
												<CheckCircleOutline sx={{ color: 'text.secondary' }} fontSize="small" />
											),
										}}
									/>
								</Stack>
								<TextField
									label="Description"
									value={viewedMaster.description || '-'}
									fullWidth
									InputProps={{
										readOnly: true,
										...withFieldIcon(
											<NotesOutlined sx={{ color: 'text.secondary' }} fontSize="small" />
										),
									}}
								/>
								<Stack direction="row" spacing={1.2} alignItems="center">
									<Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
										Checklist Fields
									</Typography>
									<Chip
										size="small"
										label={`${Array.isArray(viewedMaster.checklistSchema) ? viewedMaster.checklistSchema.length : 0} fields`}
									/>
								</Stack>
								<Stack spacing={1}>
									{Array.isArray(viewedMaster.checklistSchema) &&
									viewedMaster.checklistSchema.length > 0 ? (
										viewedMaster.checklistSchema.map((field, index) => (
											<Box
												key={`view-field-${index}`}
												sx={{
													p: 1.2,
													border: '1px solid',
													borderColor: 'divider',
													borderRadius: 2,
													bgcolor: 'background.paper',
												}}
											>
												<Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
													<Typography
														sx={{ fontWeight: 700, color: 'text.primary', minWidth: 180 }}
													>
														{field?.label || `Field ${index + 1}`}
													</Typography>
													<Typography sx={{ color: 'text.secondary', minWidth: 150 }}>
														Type: {field?.type || '-'}
													</Typography>
													<Typography sx={{ color: 'text.secondary', minWidth: 150 }}>
														Key: {field?.key || '-'}
													</Typography>
													<Typography sx={{ color: 'text.secondary', minWidth: 120 }}>
														Required: {field?.required ? 'Yes' : 'No'}
													</Typography>
													{field?.unit && (
														<Typography sx={{ color: 'text.secondary', minWidth: 120 }}>
															Unit: {field.unit}
														</Typography>
													)}
												</Stack>
												{Array.isArray(field?.options) && field.options.length > 0 && (
													<Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
														Options: {field.options.join(', ')}
													</Typography>
												)}
											</Box>
										))
									) : (
										<Typography sx={{ color: 'text.secondary' }}>
											No checklist fields found.
										</Typography>
									)}
								</Stack>
							</Stack>
						)}
					</Box>
					<Divider />
					<Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
						<Button onClick={closeViewDialog}>Close</Button>
					</Stack>
				</Box>
			</RtmDrawer>

			<RtmDrawer drawerName={ADD_CIRCUIT_MASTER_DIALOG} onCancel={closeAddDialog}>
				<Box
					sx={{
						width: { xs: '100vw', lg: 1120 },
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						bgcolor: 'background.paper',
					}}
				>
					<Box
						sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
					>
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							Add Circuit Master
						</Typography>
						<IconButton onClick={closeAddDialog} sx={{ bgcolor: 'action.hover' }}>
							<Close fontSize="small" />
						</IconButton>
					</Box>
					<Divider />
					<Box sx={{ p: 3, flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
						<Stack spacing={1.5}>
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<TextField
									label="Code"
									value={formState.code}
									onChange={(e) => setFormState((prev) => ({ ...prev, code: e.target.value }))}
									fullWidth
									InputProps={withFieldIcon(
										<Tag sx={{ color: 'primary.main' }} fontSize="small" />
									)}
								/>
								<TextField
									label="Name"
									value={formState.name}
									onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
									fullWidth
									InputProps={withFieldIcon(
										<Title sx={{ color: 'primary.main' }} fontSize="small" />
									)}
								/>
							</Stack>
							<TextField
								label="Description"
								value={formState.description}
								onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
								fullWidth
								InputProps={withFieldIcon(
									<NotesOutlined sx={{ color: 'text.secondary' }} fontSize="small" />
								)}
							/>

							<Typography sx={{ fontWeight: 700, color: 'text.secondary', mt: 1 }}>
								Checklist Fields
							</Typography>
							{formState.fields.map((field, index) => (
								<Stack key={`field-${index}`} direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
									<TextField
										label="Label"
										value={field.label}
										onChange={(e) => onChangeField(setFormState, index, 'label', e.target.value)}
										fullWidth
										InputProps={withFieldIcon(
											<LabelOutlined sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									/>
									<TextField
										label="Key (optional)"
										value={field.key}
										onChange={(e) => onChangeField(setFormState, index, 'key', e.target.value)}
										fullWidth
										InputProps={withFieldIcon(
											<VpnKey sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									/>
									<TextField
										select
										label="Type"
										value={field.type}
										onChange={(e) => onChangeField(setFormState, index, 'type', e.target.value)}
										sx={{ minWidth: 140 }}
										InputProps={withFieldIcon(
											<Category sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									>
										<MenuItem value="TEXT">Text</MenuItem>
										<MenuItem value="NUMBER">Number</MenuItem>
										<MenuItem value="BOOLEAN">Yes/No</MenuItem>
										<MenuItem value="SELECT">Select</MenuItem>
									</TextField>
									<TextField
										label="Unit"
										value={field.unit}
										onChange={(e) => onChangeField(setFormState, index, 'unit', e.target.value)}
										sx={{ minWidth: 120 }}
										InputProps={withFieldIcon(
											<Straighten sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									/>
									<TextField
										select
										label="Required"
										value={field.required ? 'yes' : 'no'}
										onChange={(e) =>
											onChangeField(setFormState, index, 'required', e.target.value === 'yes')
										}
										sx={{ minWidth: 120 }}
										InputProps={withFieldIcon(
											<CheckCircleOutline sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									>
										<MenuItem value="yes">Yes</MenuItem>
										<MenuItem value="no">No</MenuItem>
									</TextField>
									<TextField
										label="Options (CSV)"
										value={field.options}
										onChange={(e) => onChangeField(setFormState, index, 'options', e.target.value)}
										disabled={field.type !== 'SELECT'}
										fullWidth
										InputProps={withFieldIcon(
											<FormatListBulleted sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									/>
									<IconButton
										onClick={() => onRemoveField(setFormState, index)}
										disabled={formState.fields.length === 1}
										sx={{ alignSelf: 'center' }}
									>
										<DeleteOutline />
									</IconButton>
								</Stack>
							))}
							<Button
								variant="outlined"
								startIcon={<Add />}
								onClick={() => onAddField(setFormState)}
								sx={{ width: 'fit-content' }}
							>
								Add Field
							</Button>
						</Stack>
					</Box>
					<Divider />
					<Stack direction="row" spacing={1.2} justifyContent="flex-end" sx={{ p: 2 }}>
						<Button onClick={closeAddDialog}>Cancel</Button>
						<RtmLoadingButton
							variant="contained"
							onClick={submitMaster}
							loading={creatingMaster}
							loadingText="Saving..."
							disabled={!formState.name.trim() || !hasCreateFields}
						>
							Save Circuit Master
						</RtmLoadingButton>
					</Stack>
				</Box>
			</RtmDrawer>

			<RtmDrawer drawerName={EDIT_CIRCUIT_MASTER_DIALOG} onCancel={closeEditDialog}>
				<Box
					sx={{
						width: { xs: '100vw', lg: 1120 },
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						bgcolor: 'background.paper',
					}}
				>
					<Box
						sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
					>
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							Edit Circuit Master
						</Typography>
						<IconButton onClick={closeEditDialog} sx={{ bgcolor: 'action.hover' }}>
							<Close fontSize="small" />
						</IconButton>
					</Box>
					<Divider />
					<Box sx={{ p: 3, flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
						<Stack spacing={1.5}>
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
								<TextField
									label="Code"
									value={editForm.code}
									onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value }))}
									fullWidth
									InputProps={withFieldIcon(
										<Tag sx={{ color: 'primary.main' }} fontSize="small" />
									)}
								/>
								<TextField
									label="Name"
									value={editForm.name}
									onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
									fullWidth
									InputProps={withFieldIcon(
										<Title sx={{ color: 'primary.main' }} fontSize="small" />
									)}
								/>
								<TextField
									select
									label="Status"
									value={editForm.isActive ? 'ACTIVE' : 'INACTIVE'}
									onChange={(e) =>
										setEditForm((prev) => ({ ...prev, isActive: e.target.value === 'ACTIVE' }))
									}
									sx={{ minWidth: 170 }}
									InputProps={withFieldIcon(
										<CheckCircleOutline sx={{ color: 'text.secondary' }} fontSize="small" />
									)}
								>
									<MenuItem value="ACTIVE">Active</MenuItem>
									<MenuItem value="INACTIVE">Inactive</MenuItem>
								</TextField>
							</Stack>
							<TextField
								label="Description"
								value={editForm.description}
								onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
								fullWidth
								InputProps={withFieldIcon(
									<NotesOutlined sx={{ color: 'text.secondary' }} fontSize="small" />
								)}
							/>

							<Typography sx={{ fontWeight: 700, color: 'text.secondary', mt: 1 }}>
								Checklist Fields
							</Typography>
							{editForm.fields.map((field, index) => (
								<Stack
									key={`edit-field-${index}`}
									direction={{ xs: 'column', md: 'row' }}
									spacing={1.2}
								>
									<TextField
										label="Label"
										value={field.label}
										onChange={(e) => onChangeField(setEditForm, index, 'label', e.target.value)}
										fullWidth
										InputProps={withFieldIcon(
											<LabelOutlined sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									/>
									<TextField
										label="Key (optional)"
										value={field.key}
										onChange={(e) => onChangeField(setEditForm, index, 'key', e.target.value)}
										fullWidth
										InputProps={withFieldIcon(
											<VpnKey sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									/>
									<TextField
										select
										label="Type"
										value={field.type}
										onChange={(e) => onChangeField(setEditForm, index, 'type', e.target.value)}
										sx={{ minWidth: 140 }}
										InputProps={withFieldIcon(
											<Category sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									>
										<MenuItem value="TEXT">Text</MenuItem>
										<MenuItem value="NUMBER">Number</MenuItem>
										<MenuItem value="BOOLEAN">Yes/No</MenuItem>
										<MenuItem value="SELECT">Select</MenuItem>
									</TextField>
									<TextField
										label="Unit"
										value={field.unit}
										onChange={(e) => onChangeField(setEditForm, index, 'unit', e.target.value)}
										sx={{ minWidth: 120 }}
										InputProps={withFieldIcon(
											<Straighten sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									/>
									<TextField
										select
										label="Required"
										value={field.required ? 'yes' : 'no'}
										onChange={(e) =>
											onChangeField(setEditForm, index, 'required', e.target.value === 'yes')
										}
										sx={{ minWidth: 120 }}
										InputProps={withFieldIcon(
											<CheckCircleOutline sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									>
										<MenuItem value="yes">Yes</MenuItem>
										<MenuItem value="no">No</MenuItem>
									</TextField>
									<TextField
										label="Options (CSV)"
										value={field.options}
										onChange={(e) => onChangeField(setEditForm, index, 'options', e.target.value)}
										disabled={field.type !== 'SELECT'}
										fullWidth
										InputProps={withFieldIcon(
											<FormatListBulleted sx={{ color: 'text.secondary' }} fontSize="small" />
										)}
									/>
									<IconButton
										onClick={() => onRemoveField(setEditForm, index)}
										disabled={editForm.fields.length === 1}
										sx={{ alignSelf: 'center' }}
									>
										<DeleteOutline />
									</IconButton>
								</Stack>
							))}
							<Button
								variant="outlined"
								startIcon={<Add />}
								onClick={() => onAddField(setEditForm)}
								sx={{ width: 'fit-content' }}
							>
								Add Field
							</Button>
						</Stack>
					</Box>
					<Divider />
					<Stack direction="row" spacing={1.2} justifyContent="flex-end" sx={{ p: 2 }}>
						<Button onClick={closeEditDialog}>Cancel</Button>
						<RtmLoadingButton
							variant="contained"
							onClick={submitEditMaster}
							loading={updatingMaster}
							loadingText="Saving..."
							disabled={!editForm.name.trim() || !hasEditFields}
						>
							Update
						</RtmLoadingButton>
					</Stack>
				</Box>
			</RtmDrawer>

			<RtmDrawer drawerName={REJECT_CIRCUIT_DIALOG} onCancel={closeRejectDialog}>
				<Box
					sx={{
						width: { xs: '100vw', sm: 560 },
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						bgcolor: 'background.paper',
					}}
				>
					<Box
						sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
					>
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							Reject Circuit Request
						</Typography>
						<IconButton onClick={closeRejectDialog} sx={{ bgcolor: 'action.hover' }}>
							<Close fontSize="small" />
						</IconButton>
					</Box>
					<Divider />
					<Box sx={{ p: 3, flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
						<Typography sx={{ color: 'text.secondary', mb: 1 }}>
							{rejectingCircuit
								? `${rejectingCircuit.circuit} • ${rejectingCircuit.station}`
								: 'Selected circuit request'}
						</Typography>
						<TextField
							label="Rejection reason"
							fullWidth
							multiline
							rows={3}
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							InputProps={withFieldIcon(
								<NotesOutlined sx={{ color: 'text.secondary' }} fontSize="small" />
							)}
						/>
					</Box>
					<Divider />
					<Stack direction="row" spacing={1.2} justifyContent="flex-end" sx={{ p: 2 }}>
						<Button onClick={closeRejectDialog}>Cancel</Button>
						<Button
							color="error"
							variant="contained"
							onClick={() => {
								if (!rejectingCircuit?.id) return;
								rejectCircuit(
									{ id: rejectingCircuit.id, payload: { reason: rejectReason } },
									{
										onSuccess: closeRejectDialog,
									}
								);
							}}
						>
							Reject
						</Button>
					</Stack>
				</Box>
			</RtmDrawer>
		</Box>
	);
}
