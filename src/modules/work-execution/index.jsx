'use client';

import {
	Add,
	AddTask,
	ArrowBack,
	Assignment,
	Badge,
	Business,
	CalendarMonth,
	Category,
	Checklist,
	Close,
	Construction,
	CurrencyRupee,
	DeleteOutline,
	Description,
	EditOutlined,
	FactCheck,
	History,
	Inventory,
	Map as MapIcon,
	Numbers,
	Person,
	Place,
	Route,
	Straighten,
	Timeline,
	VisibilityOutlined,
} from '@mui/icons-material';
import {
	Alert,
	Box,
	Button,
	Chip,
	Divider,
	Grid,
	IconButton,
	InputAdornment,
	LinearProgress,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { PieChart } from '@mui/x-charts';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTabs, useToast } from '@/hooks/common';
import { useEquipmentTemplates } from '@/hooks/eqiuipment-templates';
import { useStationRacks } from '@/hooks/racks';
import { useStations } from '@/hooks/stations';
import { useSubsections } from '@/hooks/sub-sections';
import { useUsers } from '@/hooks/user';
import {
	useAddProgress,
	useAllocations,
	useCreateRound,
	useCreateWork,
	useCreateWorkItem,
	useDeleteWork,
	useDemands,
	useProgress,
	useSaveAllocations,
	useSaveWorkScope,
	useSubmitDemands,
	useUpdateRound,
	useUpdateWork,
	useUpdateWorkItem,
	useWorkDetail,
	useWorkScope,
	useWorks,
} from '@/hooks/work-execution';
import RtmDataGrid from '@/lib/common/datagrid';
import { RtmDialog, RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import RtmTabs from '@/lib/common/tabs';
import { closeDrawer, openDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

const managerRoles = new Set([
	'SUPER_ADMIN',
	'ADMIN',
	'TESTROOM',
	'SR_DSTE',
	'SR_DSTE_CO',
	'DSTE',
	'ADSTE',
]);

const itemCategoryOptions = [
	'EQUIPMENT',
	'CABLE',
	'LABOUR',
	'CIVIL',
	'INSTALLATION',
	'TESTING',
	'COMMISSIONING',
	'OTHER',
];

const unitOptions = [
	'Numbers',
	'Meters',
	'Kilometers',
	'RKM',
	'Set',
	'Each',
	'Pair',
	'Core',
	'Days',
	'Man-days',
	'Job',
	'Lot',
];
const CREATE_WORK_DRAWER = 'createWorkExecutionDrawer';
const ADD_PROGRESS_DIALOG = 'workProgressAddDialog';
const EDIT_ITEM_DIALOG = 'workExecutionEditItemDialog';
const CONSIGNEE_TABS = [
	{ label: 'Scope', step: 'scope', icon: <MapIcon sx={{ fontSize: 18 }} /> },
	{ label: 'LOA Items', step: 'items', icon: <Inventory sx={{ fontSize: 18 }} /> },
	{ label: 'JE/SSE Demands', step: 'demands', icon: <Checklist sx={{ fontSize: 18 }} /> },
	{ label: 'Progress', step: 'progress', icon: <Timeline sx={{ fontSize: 18 }} /> },
];

const formatDateTime = (value) => {
	if (!value) return '-';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '-';
	return date.toLocaleString('en-IN', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});
};

const asNumber = (value) => {
	const numeric = Number.parseFloat(value);
	return Number.isFinite(numeric) ? numeric : 0;
};

const statusColor = (status) => {
	if (status === 'DEMAND_OPEN') return 'success';
	if (status === 'DEMAND_CLOSED') return 'warning';
	if (status === 'ALLOCATED') return 'info';
	if (status === 'EXECUTION') return 'secondary';
	if (status === 'COMPLETED') return 'primary';
	return 'default';
};

const drawerTextFieldStyles = {
	bgcolor: 'background.paper',
	'& .MuiOutlinedInput-root': {
		borderRadius: 2,
		'& fieldset': { borderColor: 'divider' },
		'&:hover fieldset': { borderColor: 'text.disabled' },
		'&.Mui-focused fieldset': { borderColor: 'primary.main' },
	},
};

const sectionLabelSx = {
	fontWeight: 700,
	mb: 1.5,
	color: 'text.secondary',
	fontSize: '0.75rem',
	letterSpacing: '1px',
};
const EMPTY_LIST = [];

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Page-level orchestration for work flow UI.
export default function WorkExecutionModule({
	scope = 'testroom',
	mode = 'board',
	workId = null,
	routeBasePath = null,
}) {
	const dispatch = useDispatch();
	const router = useRouter();
	const { data: session } = useSession();
	const showToast = useToast();
	const role = session?.user?.role;
	const userId = session?.user?.id;
	const isManager = managerRoles.has(role);
	const isTestroomScope = scope === 'testroom';
	const isSectionalRole = [
		'JE_SSE_TELE_SECTIONAL',
		'FIELD_ENGINEER',
		'JE_SECTIONAL',
		'SSE_SECTIONAL',
	].includes(role);
	const basePath = routeBasePath || (isTestroomScope ? '/testroom' : '/field-engineer');
	const isListOnlyPage = mode === 'list';
	const isDetailPage = mode === 'detail';
	const canCreateWork = isManager && scope === 'testroom';
	const showConsigneeTabs = !isTestroomScope && isDetailPage;
	const { currentTab: consigneeTab } = useTabs('workExecutionConsigneeTabs', {
		currentTab: 'items',
	});

	const { data: works = [], isLoading: loadingWorks } = useWorks();
	const { data: users = [] } = useUsers();
	const { data: stations = [] } = useStations();
	const { data: subsections = [] } = useSubsections();

	const [selectedWorkId, setSelectedWorkId] = useState(workId || '');
	const { data: selectedWork } = useWorkDetail(selectedWorkId || null);

	const selectedRounds = useMemo(
		() => selectedWork?.demandRounds || EMPTY_LIST,
		[selectedWork?.demandRounds]
	);
	const selectedItems = selectedWork?.items || [];
	const canManageSelectedWork = Boolean(selectedWork && selectedWork.consigneeId === userId);

	const [selectedRoundId, setSelectedRoundId] = useState('');

	useEffect(() => {
		if (workId) {
			setSelectedWorkId(workId);
		}
	}, [workId]);

	useEffect(() => {
		if (isDetailPage || isListOnlyPage) return;
		if (!selectedWorkId && works.length) {
			setSelectedWorkId(works[0].id);
		}
	}, [isDetailPage, isListOnlyPage, selectedWorkId, works]);

	useEffect(() => {
		if (isListOnlyPage) return;
		if (!selectedRounds.length) {
			if (selectedRoundId !== '') {
				setSelectedRoundId('');
			}
			return;
		}
		if (!selectedRoundId || !selectedRounds.some((round) => round.id === selectedRoundId)) {
			const nextRoundId = selectedRounds[0]?.id || '';
			if (nextRoundId && nextRoundId !== selectedRoundId) {
				setSelectedRoundId(nextRoundId);
			}
		}
	}, [isListOnlyPage, selectedRoundId, selectedRounds]);

	const { data: demands = [] } = useDemands(selectedWorkId || null, selectedRoundId || null);
	const { data: allocations = [] } = useAllocations(
		selectedWorkId || null,
		selectedRoundId || null
	);
	const { data: workScopeData } = useWorkScope(selectedWorkId || null);
	const { data: progressEntries = [] } = useProgress(
		selectedWorkId || null,
		selectedRoundId || null
	);
	const { data: equipmentTemplates = [] } = useEquipmentTemplates();

	const { mutate: createWork, isLoading: creatingWork } = useCreateWork();
	const { mutate: updateWork, isLoading: updatingWork } = useUpdateWork();
	const { mutate: deleteWork, isLoading: deletingWork } = useDeleteWork();
	const { mutate: createWorkItem, isLoading: creatingItem } = useCreateWorkItem();
	const { mutate: createRound, isLoading: creatingRound } = useCreateRound();
	const { mutate: updateRound, isLoading: updatingRound } = useUpdateRound();
	const { mutate: updateWorkItem, isLoading: updatingItem } = useUpdateWorkItem();
	const { mutate: submitDemands, isLoading: savingDemands } = useSubmitDemands();
	const { mutate: saveAllocations, isLoading: savingAllocations } = useSaveAllocations();
	const { mutate: saveWorkScope, isLoading: savingWorkScope } = useSaveWorkScope();
	const { mutate: addProgress, isLoading: addingProgress } = useAddProgress();

	const engineerUsers = useMemo(
		() =>
			users.filter((user) =>
				[
					'JE_SSE_TELE_SECTIONAL',
					'SSE_TELE_INCHARGE',
					'FIELD_ENGINEER',
					'TCM',
					'TECHNICIAN',
				].includes(user.role)
			),
		[users]
	);

	const [workForm, setWorkForm] = useState({
		loaNo: '',
		loaDate: '',
		title: '',
		contractorName: '',
		acceptedValue: '',
		completionPeriodMonths: '',
		consigneeId: '',
		description: '',
	});
	const [editingWorkId, setEditingWorkId] = useState('');

	const [itemForm, setItemForm] = useState({
		itemName: '',
		category: 'OTHER',
		uom: 'Numbers',
		plannedQty: '',
	});
	const [editItemForm, setEditItemForm] = useState({
		id: '',
		itemName: '',
		category: 'OTHER',
		uom: 'Numbers',
		plannedQty: '',
	});

	const [roundForm, setRoundForm] = useState({
		name: '',
		notes: '',
	});

	const [demandScope, setDemandScope] = useState({
		stationId: '',
		subsectionId: '',
	});
	const [demandValues, setDemandValues] = useState({});

	const [allocationScope, setAllocationScope] = useState({
		allocatedToId: '',
		stationId: '',
		subsectionId: '',
	});
	const [allocationValues, setAllocationValues] = useState({});
	const [selectedScopeStationIds, setSelectedScopeStationIds] = useState([]);
	const [selectedScopeSubsectionIds, setSelectedScopeSubsectionIds] = useState([]);
	const [selectedProgressItem, setSelectedProgressItem] = useState(null);
	const [progressForm, setProgressForm] = useState({
		stationId: '',
		subsectionId: '',
		quantity: '',
		progressDate: new Date().toISOString().slice(0, 10),
		remarks: '',
		equipmentName: '',
		templateId: '',
		rackId: '',
		uPosition: '',
		serialNumber: '',
		providedBy: 'Indian Railways',
		description: '',
		installationDate: new Date().toISOString().slice(0, 10),
	});
	const [progressFilterValue, setProgressFilterValue] = useState('');
	const { data: stationRacks = [] } = useStationRacks(progressForm.stationId || null);

	const stationOptions = useMemo(
		() =>
			stations.map((station) => ({
				id: station.id,
				label: `${station.data?.label || station.id}${station.data?.code ? ` (${station.data.code})` : ''}`,
			})),
		[stations]
	);

	const subsectionOptions = useMemo(
		() =>
			subsections.map((sub) => ({
				id: sub.id,
				label: `${sub.code || ''}${sub.name ? ` - ${sub.name}` : ''}`,
			})),
		[subsections]
	);

	const scopeStationSet = useMemo(
		() => new Set(selectedScopeStationIds.filter(Boolean)),
		[selectedScopeStationIds]
	);
	const scopeSubsectionSet = useMemo(
		() => new Set(selectedScopeSubsectionIds.filter(Boolean)),
		[selectedScopeSubsectionIds]
	);
	const hasStationScope = scopeStationSet.size > 0;
	const hasSubsectionScope = scopeSubsectionSet.size > 0;
	const hasWorkScope = hasStationScope || hasSubsectionScope;

	const targetStationOptions = useMemo(() => {
		if (!hasStationScope) return stationOptions;
		return stationOptions.filter((station) => scopeStationSet.has(station.id));
	}, [hasStationScope, scopeStationSet, stationOptions]);

	const targetSubsectionOptions = useMemo(() => {
		if (!hasSubsectionScope) return subsectionOptions;
		return subsectionOptions.filter((subsection) => scopeSubsectionSet.has(subsection.id));
	}, [hasSubsectionScope, scopeSubsectionSet, subsectionOptions]);
	const progressStationFilterOptions = useMemo(
		() => (hasStationScope ? targetStationOptions : stationOptions),
		[hasStationScope, stationOptions, targetStationOptions]
	);
	const progressItemFilterOptions = useMemo(
		() =>
			selectedItems.map((item) => ({
				id: item.id,
				label: `${item.itemName}${item.uom ? ` (${item.uom})` : ''}`,
			})),
		[selectedItems]
	);
	const selectedProgressStationId = progressFilterValue.startsWith('station:')
		? progressFilterValue.replace('station:', '')
		: '';
	const selectedProgressItemId = progressFilterValue.startsWith('item:')
		? progressFilterValue.replace('item:', '')
		: '';
	const progressFilterOptions = useMemo(
		() => [
			{ value: '', label: 'All Progress' },
			...progressStationFilterOptions.map((station) => ({
				value: `station:${station.id}`,
				label: `Station: ${station.label}`,
			})),
			...progressItemFilterOptions.map((item) => ({
				value: `item:${item.id}`,
				label: `LOA Item: ${item.label}`,
			})),
		],
		[progressItemFilterOptions, progressStationFilterOptions]
	);

	const isEntryWithinScope = (row) => {
		if (!hasWorkScope) return true;
		const stationMatch = row?.stationId && scopeStationSet.has(row.stationId);
		const subsectionMatch = row?.subsectionId && scopeSubsectionSet.has(row.subsectionId);
		return Boolean(stationMatch || subsectionMatch);
	};

	const scopedDemands = useMemo(
		() => demands.filter((row) => isEntryWithinScope(row)),
		[demands, hasWorkScope, scopeStationSet, scopeSubsectionSet]
	);
	const scopedAllocations = useMemo(
		() => allocations.filter((row) => isEntryWithinScope(row)),
		[allocations, hasWorkScope, scopeStationSet, scopeSubsectionSet]
	);
	const scopedProgressEntries = useMemo(
		() => progressEntries.filter((row) => isEntryWithinScope(row)),
		[hasWorkScope, progressEntries, scopeStationSet, scopeSubsectionSet]
	);
	const filteredScopedDemands = useMemo(
		() =>
			scopedDemands.filter((row) => {
				const stationMatch = selectedProgressStationId
					? row.stationId === selectedProgressStationId
					: true;
				const itemMatch = selectedProgressItemId ? row.itemId === selectedProgressItemId : true;
				return stationMatch && itemMatch;
			}),
		[selectedProgressItemId, selectedProgressStationId, scopedDemands]
	);
	const filteredScopedAllocations = useMemo(
		() =>
			scopedAllocations.filter((row) => {
				const stationMatch = selectedProgressStationId
					? row.stationId === selectedProgressStationId
					: true;
				const itemMatch = selectedProgressItemId ? row.itemId === selectedProgressItemId : true;
				return stationMatch && itemMatch;
			}),
		[selectedProgressItemId, selectedProgressStationId, scopedAllocations]
	);
	const filteredProgressEntries = useMemo(
		() =>
			scopedProgressEntries.filter((row) => {
				const stationMatch = selectedProgressStationId
					? row.stationId === selectedProgressStationId
					: true;
				const itemMatch = selectedProgressItemId ? row.itemId === selectedProgressItemId : true;
				return stationMatch && itemMatch;
			}),
		[selectedProgressItemId, selectedProgressStationId, scopedProgressEntries]
	);

	useEffect(() => {
		if (!workScopeData) return;
		setSelectedScopeStationIds(
			(workScopeData.stationScopes || []).map((entry) => entry.stationId).filter(Boolean)
		);
		setSelectedScopeSubsectionIds(
			(workScopeData.subsectionScopes || []).map((entry) => entry.subsectionId).filter(Boolean)
		);
	}, [workScopeData]);

	useEffect(() => {
		if (!selectedWorkId) {
			setSelectedScopeStationIds([]);
			setSelectedScopeSubsectionIds([]);
		}
	}, [selectedWorkId]);

	useEffect(() => {
		setProgressFilterValue('');
	}, [selectedWorkId]);

	useEffect(() => {
		if (
			progressFilterValue &&
			!progressFilterOptions.some((option) => option.value === progressFilterValue)
		) {
			setProgressFilterValue('');
		}
	}, [progressFilterOptions, progressFilterValue]);

	useEffect(() => {
		if (
			demandScope.stationId &&
			!targetStationOptions.some((option) => option.id === demandScope.stationId)
		) {
			setDemandScope((prev) => ({ ...prev, stationId: '' }));
		}
	}, [demandScope.stationId, targetStationOptions]);

	useEffect(() => {
		if (
			demandScope.subsectionId &&
			!targetSubsectionOptions.some((option) => option.id === demandScope.subsectionId)
		) {
			setDemandScope((prev) => ({ ...prev, subsectionId: '' }));
		}
	}, [demandScope.subsectionId, targetSubsectionOptions]);

	useEffect(() => {
		if (
			allocationScope.stationId &&
			!targetStationOptions.some((option) => option.id === allocationScope.stationId)
		) {
			setAllocationScope((prev) => ({ ...prev, stationId: '' }));
		}
	}, [allocationScope.stationId, targetStationOptions]);

	useEffect(() => {
		if (
			allocationScope.subsectionId &&
			!targetSubsectionOptions.some((option) => option.id === allocationScope.subsectionId)
		) {
			setAllocationScope((prev) => ({ ...prev, subsectionId: '' }));
		}
	}, [allocationScope.subsectionId, targetSubsectionOptions]);

	useEffect(() => {
		if (
			progressForm.stationId &&
			!targetStationOptions.some((option) => option.id === progressForm.stationId)
		) {
			setProgressForm((prev) => ({ ...prev, stationId: '', rackId: '' }));
		}
	}, [progressForm.stationId, targetStationOptions]);

	useEffect(() => {
		if (
			progressForm.subsectionId &&
			!targetSubsectionOptions.some((option) => option.id === progressForm.subsectionId)
		) {
			setProgressForm((prev) => ({ ...prev, subsectionId: '' }));
		}
	}, [progressForm.subsectionId, targetSubsectionOptions]);

	const handleCreateWork = () => {
		if (!workForm.loaNo || !workForm.title || !workForm.consigneeId) return;
		const payload = { ...workForm };
		const resetForm = () => {
			setEditingWorkId('');
			setWorkForm({
				loaNo: '',
				loaDate: '',
				title: '',
				contractorName: '',
				acceptedValue: '',
				completionPeriodMonths: '',
				consigneeId: '',
				description: '',
			});
			dispatch(closeDrawer({ drawerName: CREATE_WORK_DRAWER }));
		};

		if (editingWorkId) {
			updateWork(
				{ id: editingWorkId, payload },
				{
					onSuccess: () => {
						resetForm();
					},
				}
			);
			return;
		}

		createWork(payload, {
			onSuccess: (response) => {
				const created = response?.data;
				if (created?.id) {
					setSelectedWorkId(created.id);
				}
				resetForm();
			},
		});
	};

	const openCreateWorkDrawer = () => {
		setEditingWorkId('');
		setWorkForm({
			loaNo: '',
			loaDate: '',
			title: '',
			contractorName: '',
			acceptedValue: '',
			completionPeriodMonths: '',
			consigneeId: '',
			description: '',
		});
		dispatch(openDrawer({ drawerName: CREATE_WORK_DRAWER }));
	};

	const openEditWorkDrawer = (work) => {
		setEditingWorkId(work.id);
		setWorkForm({
			loaNo: work.loaNo || '',
			loaDate: work.loaDate ? new Date(work.loaDate).toISOString().slice(0, 10) : '',
			title: work.title || '',
			contractorName: work.contractorName || '',
			acceptedValue: work.acceptedValue ?? '',
			completionPeriodMonths: work.completionPeriodMonths ?? '',
			consigneeId: work.consigneeId || '',
			description: work.description || '',
		});
		dispatch(openDrawer({ drawerName: CREATE_WORK_DRAWER }));
	};

	const handleDeleteWork = (work) => {
		if (!window.confirm(`Delete work "${work.title}"? This cannot be undone.`)) return;
		deleteWork(work.id, {
			onSuccess: () => {
				if (selectedWorkId === work.id) {
					setSelectedWorkId('');
				}
			},
		});
	};

	const handleAddItem = () => {
		if (!selectedWorkId || !itemForm.itemName) return;
		createWorkItem(
			{
				workId: selectedWorkId,
				payload: {
					itemName: itemForm.itemName,
					category: itemForm.category,
					uom: itemForm.uom || 'Numbers',
					plannedQty:
						itemForm.plannedQty === '' || itemForm.plannedQty === null
							? 0
							: Number.parseFloat(itemForm.plannedQty),
				},
			},
			{
				onSuccess: () => {
					setItemForm({
						itemName: '',
						category: 'OTHER',
						uom: 'Numbers',
						plannedQty: '',
					});
				},
			}
		);
	};

	const openEditItemDialog = (item) => {
		setEditItemForm({
			id: item.id,
			itemName: item.itemName || '',
			category: item.category || 'OTHER',
			uom: item.uom || 'Numbers',
			plannedQty: item.plannedQty ?? '',
		});
		dispatch(openDrawer({ drawerName: EDIT_ITEM_DIALOG }));
	};

	const closeEditItemDialog = () => {
		dispatch(closeDrawer({ drawerName: EDIT_ITEM_DIALOG }));
		setEditItemForm({
			id: '',
			itemName: '',
			category: 'OTHER',
			uom: 'Numbers',
			plannedQty: '',
		});
	};

	const handleUpdateItem = () => {
		if (!selectedWorkId || !editItemForm.id || !editItemForm.itemName.trim()) return;
		updateWorkItem(
			{
				workId: selectedWorkId,
				itemId: editItemForm.id,
				payload: {
					itemName: editItemForm.itemName.trim(),
					category: editItemForm.category,
					uom: editItemForm.uom,
					plannedQty:
						editItemForm.plannedQty === '' || editItemForm.plannedQty === null
							? 0
							: Number.parseFloat(editItemForm.plannedQty),
				},
			},
			{
				onSuccess: () => {
					closeEditItemDialog();
				},
			}
		);
	};

	const handleDeleteItem = (item) => {
		if (!selectedWorkId || !item?.id) return;
		if (!window.confirm(`Delete LOA item "${item.itemName}"?`)) return;
		updateWorkItem({
			workId: selectedWorkId,
			itemId: item.id,
			payload: { isActive: false },
		});
	};

	const handleCreateRound = () => {
		if (!selectedWorkId || !roundForm.name) return;
		createRound(
			{ workId: selectedWorkId, payload: roundForm },
			{
				onSuccess: (response) => {
					const created = response?.data;
					if (created?.id) {
						setSelectedRoundId(created.id);
					}
					setRoundForm({ name: '', notes: '' });
				},
			}
		);
	};

	const currentRound = useMemo(
		() => selectedRounds.find((round) => round.id === selectedRoundId) || null,
		[selectedRoundId, selectedRounds]
	);

	const toggleRoundStatus = () => {
		if (!selectedWorkId || !currentRound) return;
		const nextStatus = currentRound.status === 'OPEN' ? 'CLOSED' : 'OPEN';
		updateRound({
			workId: selectedWorkId,
			roundId: currentRound.id,
			payload: {
				status: nextStatus,
				closesAt: nextStatus === 'CLOSED' ? new Date().toISOString() : null,
			},
		});
	};

	const handleSubmitDemands = () => {
		if (!selectedWorkId || !selectedRoundId || !selectedItems.length) return;
		if (!demandScope.stationId && !demandScope.subsectionId) {
			showToast('Select station or subsection before submitting demand.', 'warning');
			return;
		}
		const entries = selectedItems
			.map((item) => ({
				itemId: item.id,
				requestedQty: demandValues[item.id],
			}))
			.filter((entry) => Number.parseFloat(entry.requestedQty) >= 0);

		if (!entries.length) return;

		submitDemands({
			workId: selectedWorkId,
			payload: {
				roundId: selectedRoundId,
				stationId: demandScope.stationId || null,
				subsectionId: demandScope.subsectionId || null,
				entries,
			},
		});
	};

	const handleSaveAllocations = () => {
		if (!selectedWorkId || !selectedRoundId || !allocationScope.allocatedToId) return;
		if (!allocationScope.stationId && !allocationScope.subsectionId) {
			showToast('Select station or subsection before saving allocation.', 'warning');
			return;
		}
		const entries = selectedItems
			.map((item) => ({
				itemId: item.id,
				allocatedQty: allocationValues[item.id],
			}))
			.filter((entry) => Number.parseFloat(entry.allocatedQty) >= 0);

		if (!entries.length) return;

		saveAllocations({
			workId: selectedWorkId,
			payload: {
				roundId: selectedRoundId,
				allocatedToId: allocationScope.allocatedToId,
				stationId: allocationScope.stationId || null,
				subsectionId: allocationScope.subsectionId || null,
				entries,
			},
		});
	};

	const handleSaveScope = () => {
		if (!selectedWorkId) return;
		saveWorkScope({
			workId: selectedWorkId,
			payload: {
				stationIds: selectedScopeStationIds,
				subsectionIds: selectedScopeSubsectionIds,
			},
		});
	};

	const openProgressDialog = (item) => {
		setSelectedProgressItem(item);
		setProgressForm({
			stationId: '',
			subsectionId: '',
			quantity: item?.category === 'EQUIPMENT' ? '1' : '',
			progressDate: new Date().toISOString().slice(0, 10),
			remarks: '',
			equipmentName: item?.category === 'EQUIPMENT' ? item.itemName : '',
			templateId: '',
			rackId: '',
			uPosition: '',
			serialNumber: '',
			providedBy: 'Indian Railways',
			description: '',
			installationDate: new Date().toISOString().slice(0, 10),
		});
		dispatch(openDrawer({ drawerName: ADD_PROGRESS_DIALOG }));
	};

	const closeProgressDialog = () => {
		setSelectedProgressItem(null);
		dispatch(closeDrawer({ drawerName: ADD_PROGRESS_DIALOG }));
	};

	const handleAddProgress = () => {
		if (!selectedWorkId || !selectedProgressItem) return;
		if (!progressForm.stationId && !progressForm.subsectionId) {
			showToast('Select station or subsection before adding progress.', 'warning');
			return;
		}

		const isEquipment = selectedProgressItem.category === 'EQUIPMENT';
		const quantity = isEquipment ? 1 : asNumber(progressForm.quantity);
		const payload = {
			roundId: selectedRoundId || null,
			itemId: selectedProgressItem.id,
			stationId: progressForm.stationId || null,
			subsectionId: progressForm.subsectionId || null,
			quantity,
			progressDate: progressForm.progressDate || null,
			remarks: progressForm.remarks || null,
		};

		if (isEquipment) {
			payload.equipment = {
				name: progressForm.equipmentName || selectedProgressItem.itemName,
				templateId: progressForm.templateId || null,
				rackId: progressForm.rackId || null,
				uPosition: progressForm.uPosition || null,
				serialNumber: progressForm.serialNumber || null,
				providedBy: progressForm.providedBy || 'Indian Railways',
				description: progressForm.description || '',
				installationDate: progressForm.installationDate || progressForm.progressDate || null,
			};
		}

		addProgress(
			{ workId: selectedWorkId, payload },
			{
				onSuccess: () => {
					closeProgressDialog();
				},
			}
		);
	};

	const itemWiseDemandAllocationSummary = useMemo(() => {
		const demandTotals = new Map();
		const allocationTotals = new Map();

		for (const row of filteredScopedDemands) {
			const current = demandTotals.get(row.itemId) || 0;
			demandTotals.set(row.itemId, current + asNumber(row.requestedQty));
		}

		for (const row of filteredScopedAllocations) {
			const current = allocationTotals.get(row.itemId) || 0;
			allocationTotals.set(row.itemId, current + asNumber(row.allocatedQty));
		}

		return selectedItems
			.filter((item) => (selectedProgressItemId ? item.id === selectedProgressItemId : true))
			.map((item) => {
				const availableQty = asNumber(item.plannedQty);
				const demandedQty = demandTotals.get(item.id) || 0;
				const allocatedQty = allocationTotals.get(item.id) || 0;
				const unallocatedDemandQty = Math.max(demandedQty - allocatedQty, 0);
				const balanceQty = Math.max(availableQty - allocatedQty, 0);

				return {
					id: item.id,
					itemName: item.itemName,
					uom: item.uom || '-',
					availableQty: Number(availableQty.toFixed(2)),
					demandedQty: Number(demandedQty.toFixed(2)),
					allocatedQty: Number(allocatedQty.toFixed(2)),
					balanceQty: Number(balanceQty.toFixed(2)),
					unallocatedDemandQty: Number(unallocatedDemandQty.toFixed(2)),
				};
			});
	}, [filteredScopedAllocations, filteredScopedDemands, selectedItems, selectedProgressItemId]);

	const workColumns = useMemo(
		() => [
			{
				field: 'loaNo',
				headerName: 'LOA NO',
				flex: 0.9,
				minWidth: 140,
				renderCell: (params) => (
					<Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem' }}>
						{params.value}
					</Typography>
				),
			},
			{
				field: 'title',
				headerName: 'TITLE',
				flex: 1.4,
				minWidth: 220,
				renderCell: (params) => (
					<Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.82rem' }}>
						{params.value}
					</Typography>
				),
			},
			{
				field: 'consignee',
				headerName: 'CONSIGNEE',
				flex: 1,
				minWidth: 180,
				valueGetter: (_value, row) => row.consignee?.name || '-',
				renderCell: (params) => (
					<Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.78rem' }}>
						{params.value}
					</Typography>
				),
			},
			{
				field: 'status',
				headerName: 'STATUS',
				width: 160,
				renderCell: (params) => (
					<Chip
						size="small"
						color={statusColor(params.value)}
						label={String(params.value || '').replace(/_/g, ' ')}
					/>
				),
			},
			{
				field: 'itemsCount',
				headerName: 'ITEMS',
				width: 90,
				sortable: false,
				valueGetter: (_value, row) => row._count?.items || 0,
			},
			{
				field: 'roundsCount',
				headerName: 'ROUNDS',
				width: 110,
				sortable: false,
				valueGetter: (_value, row) => row._count?.demandRounds || 0,
			},
			{
				field: 'actions',
				headerName: 'ACTION',
				width: isTestroomScope ? 140 : 70,
				sortable: false,
				filterable: false,
				renderCell: (params) => (
					<Stack direction="row" spacing={0.5} justifyContent="flex-end">
						<Tooltip title="View details">
							<IconButton
								size="small"
								onClick={() => {
									router.push(`${basePath}/work-execution/${params.row.id}`);
								}}
							>
								<VisibilityOutlined fontSize="small" />
							</IconButton>
						</Tooltip>
						{isTestroomScope && (
							<>
								<Tooltip title="Edit work">
									<IconButton size="small" onClick={() => openEditWorkDrawer(params.row)}>
										<EditOutlined fontSize="small" />
									</IconButton>
								</Tooltip>
								<Tooltip title="Delete work">
									<IconButton
										size="small"
										color="error"
										disabled={deletingWork}
										onClick={() => handleDeleteWork(params.row)}
									>
										<DeleteOutline fontSize="small" />
									</IconButton>
								</Tooltip>
							</>
						)}
					</Stack>
				),
			},
		],
		[basePath, deletingWork, isTestroomScope, router]
	);

	const itemColumns = useMemo(
		() =>
			[
				{
					field: 'itemName',
					headerName: 'ITEM',
					flex: 1.3,
					minWidth: 220,
				},
				{
					field: 'category',
					headerName: 'CATEGORY',
					flex: 0.9,
					minWidth: 140,
				},
				{
					field: 'uom',
					headerName: 'UNIT',
					flex: 0.7,
					minWidth: 120,
				},
				{
					field: 'plannedQty',
					headerName: 'PLANNED QTY',
					flex: 0.8,
					minWidth: 130,
					valueGetter: (value) => value || 0,
					renderCell: (params) => `${params.value} ${params.row.uom || ''}`.trim(),
				},
				...(canManageSelectedWork
					? [
							{
								field: 'actions',
								headerName: 'ACTION',
								width: 120,
								sortable: false,
								filterable: false,
								renderCell: (params) => (
									<Stack direction="row" spacing={0.5}>
										<Tooltip title="Edit item">
											<IconButton size="small" onClick={() => openEditItemDialog(params.row)}>
												<EditOutlined fontSize="small" />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete item">
											<IconButton
												size="small"
												color="error"
												onClick={() => handleDeleteItem(params.row)}
											>
												<DeleteOutline fontSize="small" />
											</IconButton>
										</Tooltip>
									</Stack>
								),
							},
						]
					: []),
			].filter((column) => (column.field === 'plannedQty' ? !isSectionalRole : true)),
		[canManageSelectedWork, isSectionalRole, selectedWorkId]
	);

	const demandColumns = useMemo(
		() => [
			{
				field: 'requestedBy',
				headerName: 'JE/SSE',
				flex: 1,
				minWidth: 180,
				valueGetter: (_value, row) => row.requestedBy?.name || '-',
			},
			{
				field: 'itemName',
				headerName: 'ITEM',
				flex: 1.1,
				minWidth: 190,
				valueGetter: (_value, row) => row.item?.itemName || '-',
			},
			{
				field: 'target',
				headerName: 'STATION/SUBSECTION',
				flex: 1.2,
				minWidth: 220,
				valueGetter: (_value, row) => {
					const station = row.station?.code || row.station?.name || '-';
					const subsection = row.subsection?.code ? ` / ${row.subsection.code}` : '';
					return `${station}${subsection}`;
				},
			},
			{
				field: 'requestedQty',
				headerName: 'QTY',
				flex: 0.7,
				minWidth: 120,
				renderCell: (params) => `${params.row.requestedQty} ${params.row.item?.uom || ''}`.trim(),
			},
			{
				field: 'createdAt',
				headerName: 'SUBMITTED',
				flex: 0.9,
				minWidth: 170,
				renderCell: (params) => formatDateTime(params.value),
			},
		],
		[]
	);

	const progressRows = useMemo(() => {
		const hasAllocationRows = filteredScopedAllocations.length > 0;
		const finalizedByItem = new Map();
		const executedByItem = new Map();

		for (const item of selectedItems) {
			const plannedFallback = hasWorkScope ? 0 : asNumber(item.plannedQty);
			finalizedByItem.set(item.id, hasAllocationRows ? 0 : plannedFallback);
		}

		for (const row of filteredScopedAllocations) {
			const current = finalizedByItem.get(row.itemId) || 0;
			finalizedByItem.set(row.itemId, current + asNumber(row.allocatedQty));
		}

		for (const row of filteredProgressEntries) {
			const current = executedByItem.get(row.itemId) || 0;
			executedByItem.set(row.itemId, current + asNumber(row.quantity));
		}

		return selectedItems
			.filter((item) => (selectedProgressItemId ? item.id === selectedProgressItemId : true))
			.map((item) => {
				const finalizedQty = finalizedByItem.get(item.id) || 0;
				const executedQty = executedByItem.get(item.id) || 0;
				const remainingQty = Math.max(finalizedQty - executedQty, 0);
				const progressPercent =
					finalizedQty > 0 ? Math.min((executedQty / finalizedQty) * 100, 100) : 0;

				return {
					id: item.id,
					itemName: item.itemName,
					category: item.category,
					uom: item.uom || '-',
					finalizedQty: Number(finalizedQty.toFixed(2)),
					executedQty: Number(executedQty.toFixed(2)),
					remainingQty: Number(remainingQty.toFixed(2)),
					progressPercent: Number(progressPercent.toFixed(1)),
				};
			});
	}, [
		filteredProgressEntries,
		filteredScopedAllocations,
		hasWorkScope,
		selectedItems,
		selectedProgressItemId,
	]);

	const canSubmitProgress = !isTestroomScope;

	const progressColumns = useMemo(() => {
		const columns = [
			{ field: 'itemName', headerName: 'ITEM', flex: 1.1, minWidth: 220 },
			{ field: 'category', headerName: 'CATEGORY', flex: 0.7, minWidth: 140 },
			{
				field: 'finalizedQty',
				headerName: 'FINALIZED',
				flex: 0.6,
				minWidth: 120,
				renderCell: (params) => `${params.value} ${params.row.uom}`.trim(),
			},
			{
				field: 'executedQty',
				headerName: 'EXECUTED',
				flex: 0.6,
				minWidth: 120,
				renderCell: (params) => `${params.value} ${params.row.uom}`.trim(),
			},
			{
				field: 'progressPercent',
				headerName: 'PROGRESS',
				flex: 1,
				minWidth: 220,
				renderCell: (params) => (
					<Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
						<LinearProgress
							variant="determinate"
							value={params.value || 0}
							sx={{
								height: 8,
								borderRadius: 6,
								flex: 1,
								bgcolor: 'action.hover',
								'& .MuiLinearProgress-bar': { borderRadius: 6 },
							}}
						/>
						<Typography sx={{ minWidth: 42, fontSize: '0.76rem', fontWeight: 700 }}>
							{params.value}%
						</Typography>
					</Stack>
				),
			},
			{
				field: 'remainingQty',
				headerName: 'REMAINING',
				flex: 0.6,
				minWidth: 120,
				renderCell: (params) => `${params.value} ${params.row.uom}`.trim(),
			},
		];

		if (canSubmitProgress) {
			columns.push({
				field: 'actions',
				headerName: 'ACTION',
				minWidth: 160,
				sortable: false,
				filterable: false,
				renderCell: (params) => (
					<Button
						size="small"
						variant="outlined"
						startIcon={<AddTask sx={{ fontSize: 16 }} />}
						onClick={() => openProgressDialog(params.row)}
						disabled={params.row.finalizedQty > 0 && params.row.remainingQty <= 0}
					>
						Add Progress
					</Button>
				),
			});
		}

		return columns;
	}, [canSubmitProgress, openProgressDialog]);

	const progressEntryColumns = useMemo(
		() => [
			{
				field: 'progressDate',
				headerName: 'DATE',
				flex: 0.8,
				minWidth: 170,
				renderCell: (params) => formatDateTime(params.value),
			},
			{
				field: 'itemName',
				headerName: 'ITEM',
				flex: 1,
				minWidth: 180,
				valueGetter: (_value, row) => row.item?.itemName || '-',
			},
			{
				field: 'reportedBy',
				headerName: 'REPORTED BY',
				flex: 0.9,
				minWidth: 170,
				valueGetter: (_value, row) => row.reportedBy?.name || '-',
			},
			{
				field: 'target',
				headerName: 'STATION/SUBSECTION',
				flex: 1.1,
				minWidth: 220,
				valueGetter: (_value, row) => {
					const station = row.station?.code || row.station?.name || '-';
					const subsection = row.subsection?.code ? ` / ${row.subsection.code}` : '';
					return `${station}${subsection}`;
				},
			},
			{
				field: 'quantity',
				headerName: 'QTY',
				flex: 0.6,
				minWidth: 110,
				renderCell: (params) =>
					`${params.row.quantity} ${params.row.item?.uom || params.row.uom || ''}`.trim(),
			},
			{
				field: 'linkedEquipment',
				headerName: 'EQUIPMENT LINK',
				flex: 0.9,
				minWidth: 170,
				renderCell: (params) => params.row.linkedEquipment?.name || '-',
			},
			{ field: 'remarks', headerName: 'REMARKS', flex: 1, minWidth: 190 },
		],
		[]
	);

	const demandAllocationSummaryColumns = useMemo(
		() => [
			{
				field: 'itemName',
				headerName: 'ITEM',
				flex: 1.2,
				minWidth: 220,
			},
			{
				field: 'uom',
				headerName: 'UNIT',
				flex: 0.5,
				minWidth: 110,
			},
			{
				field: 'availableQty',
				headerName: 'AVAILABLE',
				flex: 0.7,
				minWidth: 130,
				renderCell: (params) => `${params.value} ${params.row.uom}`.trim(),
			},
			{
				field: 'demandedQty',
				headerName: 'DEMANDED',
				flex: 0.7,
				minWidth: 130,
				renderCell: (params) => `${params.value} ${params.row.uom}`.trim(),
			},
			{
				field: 'allocatedQty',
				headerName: 'ALLOCATED',
				flex: 0.7,
				minWidth: 130,
				renderCell: (params) => `${params.value} ${params.row.uom}`.trim(),
			},
			{
				field: 'unallocatedDemandQty',
				headerName: 'PENDING DEMAND',
				flex: 0.8,
				minWidth: 150,
				renderCell: (params) => `${params.value} ${params.row.uom}`.trim(),
			},
			{
				field: 'balanceQty',
				headerName: 'BALANCE',
				flex: 0.7,
				minWidth: 130,
				renderCell: (params) => `${params.value} ${params.row.uom}`.trim(),
			},
		],
		[]
	);

	const showConsigneeTabMode = showConsigneeTabs && canManageSelectedWork;
	const showConsigneeScopeTab = showConsigneeTabMode && consigneeTab === 'scope';
	const showConsigneeItemsTab = showConsigneeTabMode && consigneeTab === 'items';
	const showConsigneeDemandsTab = showConsigneeTabMode && consigneeTab === 'demands';
	const showConsigneeProgressTab = showConsigneeTabMode && consigneeTab === 'progress';
	const isEquipmentProgress = selectedProgressItem?.category === 'EQUIPMENT';
	const hasProgressTarget = Boolean(progressForm.stationId || progressForm.subsectionId);
	const isProgressFormInvalid =
		!selectedProgressItem ||
		!hasProgressTarget ||
		(!isEquipmentProgress && asNumber(progressForm.quantity) <= 0) ||
		(isEquipmentProgress &&
			(!progressForm.stationId || !progressForm.templateId || !progressForm.equipmentName?.trim()));

	const workProgressOverview = useMemo(() => {
		const totalLoaQty = selectedItems.reduce((sum, item) => sum + asNumber(item.plannedQty), 0);
		const totalExecuted = scopedProgressEntries.reduce(
			(sum, entry) => sum + asNumber(entry.quantity),
			0
		);
		const cappedExecuted = totalLoaQty > 0 ? Math.min(totalExecuted, totalLoaQty) : totalExecuted;
		const totalPending = Math.max(totalLoaQty - cappedExecuted, 0);
		const completionPercent =
			totalLoaQty > 0 ? Math.min((cappedExecuted / totalLoaQty) * 100, 100) : 0;

		const pieData =
			totalLoaQty > 0
				? [
						{
							id: 'executed',
							label: 'Executed',
							value: Number(cappedExecuted.toFixed(2)),
							color: '#22c55e',
						},
						{
							id: 'pending',
							label: 'Remaining',
							value: Number(totalPending.toFixed(2)),
							color: '#f59e0b',
						},
					]
				: [{ id: 'no-target', label: 'No LOA Qty', value: 1, color: '#64748b' }];

		return {
			totalLoaQty: Number(totalLoaQty.toFixed(2)),
			totalExecuted: Number(cappedExecuted.toFixed(2)),
			totalPending: Number(totalPending.toFixed(2)),
			completionPercent: Number(completionPercent.toFixed(1)),
			pieData,
		};
	}, [scopedProgressEntries, selectedItems]);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				bgcolor: 'background.default',
			}}
		>
			{!isDetailPage && (
				<Box sx={{ px: 3, pt: 3, pb: 2, bgcolor: 'background.paper' }}>
					<Stack
						direction={{ xs: 'column', md: 'row' }}
						spacing={1.5}
						alignItems={{ xs: 'flex-start', md: 'center' }}
						justifyContent="space-between"
					>
						<Stack direction="row" spacing={1.5} alignItems="center">
							<Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, display: 'flex' }}>
								<Timeline sx={{ color: 'text.secondary' }} />
							</Box>
							<Box>
								<Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
									Work Execution & Progress
								</Typography>
								<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
									LOA-based supply, dynamic demand collection, and allocation tracking
								</Typography>
							</Box>
						</Stack>
						<Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
							{canCreateWork && (
								<Button
									variant="contained"
									startIcon={<Add />}
									onClick={openCreateWorkDrawer}
									sx={{ width: { xs: '100%', md: 'auto' } }}
								>
									Add Work
								</Button>
							)}
						</Stack>
					</Stack>
				</Box>
			)}

			<Box
				sx={{
					flex: 1,
					overflowY: 'auto',
					px: 3,
					pb: 3,
					pt: isDetailPage ? 1 : 3,
				}}
			>
				{!canCreateWork && !isListOnlyPage && !isDetailPage && (
					<Alert severity="info" sx={{ mb: 3 }}>
						Submit demand quantities for open rounds against consignee item lists. If you are
						assigned as consignee for a work, you can manage item list, rounds, and allocations for
						that work.
					</Alert>
				)}

				{!isDetailPage && (
					<Box sx={{ mb: 3 }}>
						<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
							<History sx={{ color: 'primary.main' }} />
							<Typography sx={{ fontWeight: 800 }}>Work Register</Typography>
						</Stack>
						<RtmDataGrid
							rows={works}
							columns={workColumns}
							loading={loadingWorks}
							getRowId={(row) => row.id}
							rowHeight={64}
							hideFooter={false}
							pagination
							pageSizeOptions={[10, 25, 50]}
							initialState={{
								pagination: { paginationModel: { page: 0, pageSize: 10 } },
							}}
						/>
					</Box>
				)}

				{!isListOnlyPage && selectedWork ? (
					<>
						{isDetailPage && (
							<Stack
								direction={{ xs: 'column', lg: 'row' }}
								spacing={2}
								justifyContent="space-between"
								alignItems={{ xs: 'flex-start', lg: 'center' }}
								sx={{ mb: 2 }}
							>
								<Box sx={{ minWidth: 0 }}>
									<Button
										variant="outlined"
										size="small"
										startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
										sx={{ mb: 1.25, minWidth: 'auto', px: 1.25, py: 0.25 }}
										onClick={() => router.push(`${basePath}/work-execution`)}
									>
										Back
									</Button>
									<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
										<Assignment sx={{ color: 'primary.main' }} />
										<Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
											{selectedWork.title}
										</Typography>
										<Chip
											size="small"
											color={statusColor(selectedWork.status)}
											label={selectedWork.status.replace(/_/g, ' ')}
										/>
									</Stack>
									<Typography sx={{ color: 'text.secondary', maxWidth: 720 }}>
										{selectedWork.description || 'No work description available.'}
									</Typography>
								</Box>

								<Stack direction="row" spacing={1.5} alignItems="center">
									<PieChart
										height={180}
										width={180}
										hideLegend
										margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
										series={[
											{
												data: workProgressOverview.pieData,
												innerRadius: 38,
												cornerRadius: 4,
												paddingAngle: 1.5,
											},
										]}
									/>
									<Stack spacing={0.4}>
										<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
											{workProgressOverview.completionPercent}% Complete
										</Typography>
										<Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap' }}>
											<Stack direction="row" spacing={0.5} alignItems="center">
												<Box
													sx={{
														width: 9,
														height: 9,
														borderRadius: '50%',
														bgcolor: '#22c55e',
													}}
												/>
												<Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
													Done
												</Typography>
											</Stack>
											<Stack direction="row" spacing={0.5} alignItems="center">
												<Box
													sx={{
														width: 9,
														height: 9,
														borderRadius: '50%',
														bgcolor: '#f59e0b',
													}}
												/>
												<Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
													Remaining
												</Typography>
											</Stack>
											<Stack direction="row" spacing={0.5} alignItems="center">
												<Box
													sx={{
														width: 9,
														height: 9,
														borderRadius: '50%',
														bgcolor: '#64748b',
													}}
												/>
												<Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
													No LOA Qty
												</Typography>
											</Stack>
										</Stack>
										<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
											Executed Qty: {workProgressOverview.totalExecuted}
										</Typography>
										<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
											Remaining Qty: {workProgressOverview.totalPending}
										</Typography>
										<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
											LOA Qty: {workProgressOverview.totalLoaQty}
										</Typography>
									</Stack>
								</Stack>
							</Stack>
						)}

						{showConsigneeTabMode && (
							<RtmTabs
								tabs={CONSIGNEE_TABS}
								tabsName="workExecutionConsigneeTabs"
								initialState={{ currentTab: 'items' }}
							/>
						)}

						{showConsigneeScopeTab && (
							<Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, mb: 3 }}>
								<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
									<MapIcon sx={{ color: 'primary.main' }} />
									<Typography sx={{ fontWeight: 800 }}>Work Scope</Typography>
								</Stack>
								<Typography sx={sectionLabelSx}>SELECT STATIONS / SUBSECTIONS</Typography>
								<Stack spacing={1.5}>
									<TextField
										select
										size="small"
										label="Stations In Scope"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={selectedScopeStationIds}
										onChange={(event) => {
											const value = event.target.value;
											setSelectedScopeStationIds(
												Array.isArray(value) ? value : String(value).split(',')
											);
										}}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Place sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
										SelectProps={{
											multiple: true,
											renderValue: (selected) =>
												selected.length
													? stationOptions
															.filter((option) => selected.includes(option.id))
															.map((option) => option.label)
															.join(', ')
													: 'No stations selected',
										}}
									>
										{stationOptions.map((station) => (
											<MenuItem key={station.id} value={station.id}>
												{station.label}
											</MenuItem>
										))}
									</TextField>

									<TextField
										select
										size="small"
										label="Subsections In Scope"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={selectedScopeSubsectionIds}
										onChange={(event) => {
											const value = event.target.value;
											setSelectedScopeSubsectionIds(
												Array.isArray(value) ? value : String(value).split(',')
											);
										}}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Route sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
										SelectProps={{
											multiple: true,
											renderValue: (selected) =>
												selected.length
													? subsectionOptions
															.filter((option) => selected.includes(option.id))
															.map((option) => option.label)
															.join(', ')
													: 'No subsections selected',
										}}
									>
										{subsectionOptions.map((subsection) => (
											<MenuItem key={subsection.id} value={subsection.id}>
												{subsection.label}
											</MenuItem>
										))}
									</TextField>

									<Stack direction="row" justifyContent="space-between" alignItems="center">
										<Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
											JE/SSE visibility will be based on supervisor mapping of these stations and
											subsections.
										</Typography>
										<RtmLoadingButton
											variant="contained"
											onClick={handleSaveScope}
											loading={savingWorkScope}
											loadingText="Saving..."
										>
											Save Scope
										</RtmLoadingButton>
									</Stack>
								</Stack>
							</Paper>
						)}

						{!isTestroomScope &&
							canManageSelectedWork &&
							(!showConsigneeTabMode || showConsigneeItemsTab) && (
								<Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, mb: 3 }}>
									<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
										<Inventory sx={{ color: 'primary.main' }} />
										<Typography sx={{ fontWeight: 800 }}>
											Consignee Item List (Dynamic Fields Source)
										</Typography>
									</Stack>
									<Grid container spacing={1.5}>
										<Grid item xs={12} md={4}>
											<TextField
												size="small"
												label="Item Name"
												fullWidth
												value={itemForm.itemName}
												onChange={(e) =>
													setItemForm((prev) => ({ ...prev, itemName: e.target.value }))
												}
												sx={drawerTextFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Inventory sx={{ color: 'primary.main' }} />
														</InputAdornment>
													),
												}}
											/>
										</Grid>
										<Grid item xs={12} md={2}>
											<TextField
												size="small"
												select
												label="Category"
												fullWidth
												value={itemForm.category}
												onChange={(e) =>
													setItemForm((prev) => ({ ...prev, category: e.target.value }))
												}
												sx={drawerTextFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Category sx={{ color: 'text.secondary' }} />
														</InputAdornment>
													),
												}}
											>
												{itemCategoryOptions.map((option) => (
													<MenuItem key={option} value={option}>
														{option}
													</MenuItem>
												))}
											</TextField>
										</Grid>
										<Grid item xs={12} md={2}>
											<TextField
												size="small"
												select
												label="Unit"
												fullWidth
												value={itemForm.uom}
												onChange={(e) => setItemForm((prev) => ({ ...prev, uom: e.target.value }))}
												sx={drawerTextFieldStyles}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Straighten sx={{ color: 'text.secondary' }} />
														</InputAdornment>
													),
												}}
											>
												{unitOptions.map((option) => (
													<MenuItem key={option} value={option}>
														{option}
													</MenuItem>
												))}
											</TextField>
										</Grid>
										{!isSectionalRole && (
											<Grid item xs={12} md={2}>
												<TextField
													size="small"
													type="number"
													label="LOA Quantity"
													fullWidth
													value={itemForm.plannedQty}
													onChange={(e) =>
														setItemForm((prev) => ({
															...prev,
															plannedQty: e.target.value,
														}))
													}
													sx={drawerTextFieldStyles}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<Numbers sx={{ color: 'text.secondary' }} />
															</InputAdornment>
														),
														inputProps: { min: 0, step: 0.01 },
													}}
												/>
											</Grid>
										)}
										<Grid item xs={12} md={2}>
											<RtmLoadingButton
												variant="contained"
												startIcon={<Add />}
												onClick={handleAddItem}
												loading={creatingItem}
												loadingText="Adding..."
												sx={{ height: '100%' }}
											>
												Add Item
											</RtmLoadingButton>
										</Grid>
									</Grid>

									<Box sx={{ mt: 2 }}>
										<RtmDataGrid
											rows={selectedItems}
											columns={itemColumns}
											getRowId={(row) => row.id}
											rowHeight={60}
											hideFooter={false}
											pagination
											pageSizeOptions={[10, 25, 50]}
											initialState={{
												pagination: { paginationModel: { page: 0, pageSize: 10 } },
											}}
										/>
									</Box>
								</Paper>
							)}

						{(!showConsigneeTabMode || showConsigneeDemandsTab) && (
							<Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, mb: 3 }}>
								<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
									<Checklist sx={{ color: 'primary.main' }} />
									<Typography sx={{ fontWeight: 800 }}>
										Demand Rounds & Dynamic Demand Form
									</Typography>
								</Stack>
								<Typography sx={sectionLabelSx}>ROUND MANAGEMENT</Typography>

								{!isTestroomScope && canManageSelectedWork && (
									<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
										<TextField
											size="small"
											label="Round Name"
											value={roundForm.name}
											onChange={(e) => setRoundForm((prev) => ({ ...prev, name: e.target.value }))}
											sx={{ ...drawerTextFieldStyles, minWidth: 280 }}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Checklist sx={{ color: 'primary.main' }} />
													</InputAdornment>
												),
											}}
										/>
										<TextField
											size="small"
											label="Notes"
											value={roundForm.notes}
											onChange={(e) => setRoundForm((prev) => ({ ...prev, notes: e.target.value }))}
											sx={{ ...drawerTextFieldStyles, minWidth: 300 }}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Description sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										/>
										<RtmLoadingButton
											variant="contained"
											onClick={handleCreateRound}
											loading={creatingRound}
											loadingText="Creating..."
										>
											Create Round
										</RtmLoadingButton>
									</Stack>
								)}

								<Stack
									direction={{ xs: 'column', md: 'row' }}
									spacing={1.5}
									alignItems="center"
									sx={{ mb: 2 }}
								>
									<TextField
										select
										size="small"
										label="Round"
										value={selectedRoundId}
										onChange={(e) => setSelectedRoundId(e.target.value)}
										sx={{ ...drawerTextFieldStyles, minWidth: 320 }}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<History sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									>
										{selectedRounds.map((round) => (
											<MenuItem key={round.id} value={round.id}>
												{round.name} ({round.status})
											</MenuItem>
										))}
									</TextField>
									{currentRound && (
										<Chip
											size="small"
											color={currentRound.status === 'OPEN' ? 'success' : 'warning'}
											label={`${currentRound.status} • ${currentRound._count?.demands || 0} demands`}
										/>
									)}
									{!isTestroomScope && canManageSelectedWork && currentRound && (
										<RtmLoadingButton
											variant="outlined"
											onClick={toggleRoundStatus}
											loading={updatingRound}
											loadingText="Updating..."
										>
											{currentRound.status === 'OPEN' ? 'Close Round' : 'Re-open Round'}
										</RtmLoadingButton>
									)}
								</Stack>

								<Divider sx={{ mb: 2 }} />

								{showConsigneeDemandsTab ? (
									<RtmDataGrid
										rows={scopedDemands}
										columns={demandColumns}
										loading={!selectedWorkId}
										getRowId={(row) => row.id}
										rowHeight={60}
										hideFooter={false}
										pagination
										pageSizeOptions={[10, 25, 50]}
										initialState={{
											pagination: { paginationModel: { page: 0, pageSize: 10 } },
										}}
									/>
								) : isTestroomScope ? (
									<Typography sx={{ color: 'text.secondary' }}>
										Testroom can monitor progression here. Demand submission is handled by consignee
										and JE/SSE users.
									</Typography>
								) : (
									<Stack spacing={1.5}>
										<Typography sx={{ fontWeight: 700 }}>
											Submit Demand (dynamic item fields)
										</Typography>
										<Typography sx={sectionLabelSx}>DEMAND SCOPE</Typography>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
											<TextField
												select
												size="small"
												label={hasStationScope ? 'Station (in scope)' : 'Station'}
												value={demandScope.stationId}
												onChange={(e) =>
													setDemandScope((prev) => ({ ...prev, stationId: e.target.value }))
												}
												sx={{ ...drawerTextFieldStyles, minWidth: 280 }}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Place sx={{ color: 'text.secondary' }} />
														</InputAdornment>
													),
												}}
											>
												<MenuItem value="">Not selected</MenuItem>
												{targetStationOptions.map((station) => (
													<MenuItem key={station.id} value={station.id}>
														{station.label}
													</MenuItem>
												))}
											</TextField>
											<TextField
												select
												size="small"
												label={hasSubsectionScope ? 'Subsection (in scope)' : 'Subsection'}
												value={demandScope.subsectionId}
												onChange={(e) =>
													setDemandScope((prev) => ({ ...prev, subsectionId: e.target.value }))
												}
												sx={{ ...drawerTextFieldStyles, minWidth: 280 }}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Route sx={{ color: 'text.secondary' }} />
														</InputAdornment>
													),
												}}
											>
												<MenuItem value="">Not selected</MenuItem>
												{targetSubsectionOptions.map((subsection) => (
													<MenuItem key={subsection.id} value={subsection.id}>
														{subsection.label}
													</MenuItem>
												))}
											</TextField>
										</Stack>
										<Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
											Demand is mandatory against a station or subsection.
										</Typography>

										{selectedItems.length === 0 ? (
											<Typography sx={{ color: 'text.secondary' }}>
												No items configured yet. Consignee must add item list first.
											</Typography>
										) : (
											<>
												<Typography sx={sectionLabelSx}>ITEM QUANTITIES</Typography>
												<Grid container spacing={1.2}>
													{selectedItems.map((item) => (
														<Grid item xs={12} md={4} key={item.id}>
															<TextField
																size="small"
																fullWidth
																type="number"
																label={`${item.itemName} (${item.uom})`}
																value={demandValues[item.id] || ''}
																onChange={(e) =>
																	setDemandValues((prev) => ({
																		...prev,
																		[item.id]: e.target.value,
																	}))
																}
																helperText={`Planned ${item.plannedQty || 0}`}
																sx={drawerTextFieldStyles}
																InputProps={{
																	startAdornment: (
																		<InputAdornment position="start">
																			<Numbers sx={{ color: 'text.secondary' }} />
																		</InputAdornment>
																	),
																}}
															/>
														</Grid>
													))}
												</Grid>
											</>
										)}

										<RtmLoadingButton
											variant="contained"
											startIcon={<FactCheck />}
											onClick={handleSubmitDemands}
											loading={savingDemands}
											loadingText="Submitting..."
											disabled={
												!selectedRoundId || (!demandScope.stationId && !demandScope.subsectionId)
											}
										>
											Submit Demand
										</RtmLoadingButton>
									</Stack>
								)}
							</Paper>
						)}

						{!isTestroomScope &&
							canManageSelectedWork &&
							(!showConsigneeTabMode || showConsigneeDemandsTab) && (
								<Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, mb: 3 }}>
									<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
										<Construction sx={{ color: 'primary.main' }} />
										<Typography sx={{ fontWeight: 800 }}>
											Allocation Matrix (Consignee/Testroom)
										</Typography>
									</Stack>
									<Typography sx={sectionLabelSx}>ALLOCATION SCOPE</Typography>
									<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
										<TextField
											select
											size="small"
											label="Allocate To"
											value={allocationScope.allocatedToId}
											onChange={(e) =>
												setAllocationScope((prev) => ({ ...prev, allocatedToId: e.target.value }))
											}
											sx={{ ...drawerTextFieldStyles, minWidth: 300 }}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Person sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										>
											{engineerUsers.map((user) => (
												<MenuItem key={user.id} value={user.id}>
													{user.name} ({user.designation || user.role})
												</MenuItem>
											))}
										</TextField>
										<TextField
											select
											size="small"
											label={hasStationScope ? 'Station (in scope)' : 'Station'}
											value={allocationScope.stationId}
											onChange={(e) =>
												setAllocationScope((prev) => ({ ...prev, stationId: e.target.value }))
											}
											sx={{ ...drawerTextFieldStyles, minWidth: 260 }}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Place sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										>
											<MenuItem value="">Not selected</MenuItem>
											{targetStationOptions.map((station) => (
												<MenuItem key={station.id} value={station.id}>
													{station.label}
												</MenuItem>
											))}
										</TextField>
										<TextField
											select
											size="small"
											label={hasSubsectionScope ? 'Subsection (in scope)' : 'Subsection'}
											value={allocationScope.subsectionId}
											onChange={(e) =>
												setAllocationScope((prev) => ({ ...prev, subsectionId: e.target.value }))
											}
											sx={{ ...drawerTextFieldStyles, minWidth: 260 }}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Route sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										>
											<MenuItem value="">Not selected</MenuItem>
											{targetSubsectionOptions.map((subsection) => (
												<MenuItem key={subsection.id} value={subsection.id}>
													{subsection.label}
												</MenuItem>
											))}
										</TextField>
									</Stack>
									<Typography sx={{ color: 'text.secondary', fontSize: '0.78rem', mb: 1.5 }}>
										Allocation is mandatory against a station or subsection.
									</Typography>

									<Typography sx={sectionLabelSx}>ALLOCATED QUANTITIES</Typography>
									<Grid container spacing={1.2} sx={{ mb: 2 }}>
										{selectedItems.map((item) => (
											<Grid item xs={12} md={4} key={`alloc-${item.id}`}>
												<TextField
													size="small"
													fullWidth
													type="number"
													label={`${item.itemName} (${item.uom})`}
													value={allocationValues[item.id] || ''}
													onChange={(e) =>
														setAllocationValues((prev) => ({ ...prev, [item.id]: e.target.value }))
													}
													sx={drawerTextFieldStyles}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<Numbers sx={{ color: 'text.secondary' }} />
															</InputAdornment>
														),
													}}
												/>
											</Grid>
										))}
									</Grid>

									<Button
										variant="contained"
										onClick={handleSaveAllocations}
										disabled={
											!selectedRoundId ||
											!allocationScope.allocatedToId ||
											(!allocationScope.stationId && !allocationScope.subsectionId) ||
											savingAllocations
										}
									>
										Save Allocation
									</Button>
								</Paper>
							)}

						{(!showConsigneeTabMode || showConsigneeProgressTab) && (
							<Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, mb: 2 }}>
								<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
									<Timeline sx={{ color: 'primary.main' }} />
									<Typography sx={{ fontWeight: 800 }}>
										Item-wise Progress (Finalized vs Executed)
									</Typography>
								</Stack>
								<Stack
									direction={{ xs: 'column', md: 'row' }}
									spacing={1.5}
									alignItems={{ xs: 'stretch', md: 'center' }}
									sx={{ mb: 2 }}
								>
									<TextField
										select
										size="small"
										label="Progress Filter"
										fullWidth
										value={progressFilterValue}
										onChange={(e) => setProgressFilterValue(e.target.value)}
										sx={{ ...drawerTextFieldStyles, maxWidth: { md: 320 } }}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<FactCheck sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									>
										{progressFilterOptions.map((option) => (
											<MenuItem key={option.value || 'all'} value={option.value}>
												{option.label}
											</MenuItem>
										))}
									</TextField>
									<Chip
										variant="outlined"
										color={progressFilterValue ? 'primary' : 'default'}
										label={
											progressFilterValue
												? `Applied: ${progressFilterOptions.find((o) => o.value === progressFilterValue)?.label || 'Custom'}`
												: 'Applied: All Progress'
										}
									/>
									<Button
										variant="outlined"
										onClick={() => {
											setProgressFilterValue('');
										}}
										disabled={!progressFilterValue}
									>
										Clear Filters
									</Button>
								</Stack>
								<RtmDataGrid
									rows={progressRows}
									columns={progressColumns}
									getRowId={(row) => row.id}
									rowHeight={60}
									hideFooter={false}
									pagination
									pageSizeOptions={[10, 25, 50]}
									initialState={{
										pagination: { paginationModel: { page: 0, pageSize: 10 } },
									}}
								/>
							</Paper>
						)}

						{(!showConsigneeTabMode || showConsigneeProgressTab) && (
							<Paper variant="outlined" sx={{ borderRadius: 3, p: 2, mt: 2 }}>
								<Typography sx={{ fontWeight: 800, mb: 1.25 }}>
									Item-wise Demand & Allocation Summary
								</Typography>
								<RtmDataGrid
									rows={itemWiseDemandAllocationSummary}
									columns={demandAllocationSummaryColumns}
									getRowId={(row) => row.id}
									rowHeight={58}
									hideFooter={false}
									pagination
									pageSizeOptions={[10, 25, 50]}
									initialState={{
										pagination: { paginationModel: { page: 0, pageSize: 10 } },
									}}
								/>
							</Paper>
						)}

						{(!showConsigneeTabMode || showConsigneeProgressTab) && (
							<Paper variant="outlined" sx={{ borderRadius: 3, p: 2, mt: 2 }}>
								<Typography sx={{ fontWeight: 800, mb: 1 }}>Recent Progress Entries</Typography>
								<RtmDataGrid
									rows={filteredProgressEntries}
									columns={progressEntryColumns}
									getRowId={(row) => row.id}
									rowHeight={58}
									hideFooter={false}
									pagination
									pageSizeOptions={[10, 25, 50]}
									initialState={{
										pagination: { paginationModel: { page: 0, pageSize: 10 } },
									}}
								/>
							</Paper>
						)}
					</>
				) : !isListOnlyPage ? (
					<Typography sx={{ color: 'text.secondary' }}>Select a work to continue.</Typography>
				) : null}
			</Box>

			<RtmDialog
				drawerName={ADD_PROGRESS_DIALOG}
				maxWidth="md"
				fullWidth
				onCancel={closeProgressDialog}
			>
				<Box sx={{ p: 2.5 }}>
					<Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
						Add Progress Entry
					</Typography>
					<Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', mb: 2 }}>
						{selectedProgressItem?.itemName || '-'} ({selectedProgressItem?.category || '-'})
					</Typography>
					<Typography sx={sectionLabelSx}>PROGRESS DETAILS</Typography>

					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: 'repeat(12, minmax(0, 1fr))' },
							gap: 1.5,
						}}
					>
						<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 3' } }}>
							<TextField
								select
								size="small"
								label={hasStationScope ? 'Station (in scope)' : 'Station'}
								fullWidth
								InputLabelProps={{ shrink: true }}
								value={progressForm.stationId}
								onChange={(e) =>
									setProgressForm((prev) => ({ ...prev, stationId: e.target.value, rackId: '' }))
								}
								sx={drawerTextFieldStyles}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Place sx={{ color: 'text.secondary' }} />
										</InputAdornment>
									),
								}}
							>
								<MenuItem value="">Not selected</MenuItem>
								{targetStationOptions.map((station) => (
									<MenuItem key={station.id} value={station.id}>
										{station.label}
									</MenuItem>
								))}
							</TextField>
						</Box>
						<Box sx={{ gridColumn: '1 / -1' }}>
							<Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
								Progress is mandatory against a station or subsection.
							</Typography>
						</Box>
						<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 3' } }}>
							<TextField
								select
								size="small"
								label={hasSubsectionScope ? 'Subsection (in scope)' : 'Subsection'}
								fullWidth
								InputLabelProps={{ shrink: true }}
								value={progressForm.subsectionId}
								onChange={(e) =>
									setProgressForm((prev) => ({ ...prev, subsectionId: e.target.value }))
								}
								sx={drawerTextFieldStyles}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Route sx={{ color: 'text.secondary' }} />
										</InputAdornment>
									),
								}}
							>
								<MenuItem value="">Not selected</MenuItem>
								{targetSubsectionOptions.map((subsection) => (
									<MenuItem key={subsection.id} value={subsection.id}>
										{subsection.label}
									</MenuItem>
								))}
							</TextField>
						</Box>
						<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 3' } }}>
							<TextField
								size="small"
								label="Progress Date"
								type="date"
								fullWidth
								InputLabelProps={{ shrink: true }}
								value={progressForm.progressDate}
								onChange={(e) =>
									setProgressForm((prev) => ({ ...prev, progressDate: e.target.value }))
								}
								onFocus={openNativeDateTimePicker}
								onClick={openNativeDateTimePicker}
								sx={drawerTextFieldStyles}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<CalendarMonth sx={{ color: 'text.secondary' }} />
										</InputAdornment>
									),
								}}
							/>
						</Box>
						<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 3' } }}>
							<TextField
								size="small"
								label={`Quantity (${selectedProgressItem?.uom || 'Numbers'})`}
								type="number"
								fullWidth
								InputLabelProps={{ shrink: true }}
								value={progressForm.quantity}
								onChange={(e) => setProgressForm((prev) => ({ ...prev, quantity: e.target.value }))}
								disabled={selectedProgressItem?.category === 'EQUIPMENT'}
								sx={drawerTextFieldStyles}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Numbers sx={{ color: 'text.secondary' }} />
										</InputAdornment>
									),
								}}
								helperText={
									selectedProgressItem?.category === 'EQUIPMENT'
										? 'Equipment installation is captured as 1 quantity per entry.'
										: ''
								}
							/>
						</Box>
						<Box sx={{ gridColumn: '1 / -1' }}>
							<TextField
								size="small"
								label="Remarks"
								fullWidth
								InputLabelProps={{ shrink: true }}
								value={progressForm.remarks}
								onChange={(e) => setProgressForm((prev) => ({ ...prev, remarks: e.target.value }))}
								sx={drawerTextFieldStyles}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Description sx={{ color: 'text.secondary' }} />
										</InputAdornment>
									),
								}}
							/>
						</Box>
					</Box>

					{selectedProgressItem?.category === 'EQUIPMENT' && (
						<>
							<Divider sx={{ my: 2 }} />
							<Typography sx={{ fontWeight: 800, mb: 1.5 }}>
								Equipment Installation Details
							</Typography>
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: { xs: '1fr', md: 'repeat(12, minmax(0, 1fr))' },
									gap: 1.5,
								}}
							>
								<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
									<TextField
										size="small"
										label="Equipment Name"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={progressForm.equipmentName}
										onChange={(e) =>
											setProgressForm((prev) => ({ ...prev, equipmentName: e.target.value }))
										}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Inventory sx={{ color: 'primary.main' }} />
												</InputAdornment>
											),
										}}
									/>
								</Box>
								<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
									<TextField
										select
										size="small"
										label="Template"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={progressForm.templateId}
										onChange={(e) =>
											setProgressForm((prev) => ({ ...prev, templateId: e.target.value }))
										}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Category sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									>
										{equipmentTemplates.map((template) => (
											<MenuItem key={template.id} value={template.id}>
												{template.make} - {template.modelName}
											</MenuItem>
										))}
									</TextField>
								</Box>
								<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
									<TextField
										select
										size="small"
										label="Rack"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={progressForm.rackId}
										onChange={(e) =>
											setProgressForm((prev) => ({ ...prev, rackId: e.target.value }))
										}
										sx={drawerTextFieldStyles}
										disabled={!progressForm.stationId}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Construction sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									>
										<MenuItem value="">Unracked / Loose</MenuItem>
										{stationRacks.map((rack) => (
											<MenuItem key={rack.id} value={rack.id}>
												{rack.name} ({rack.location?.name || '-'})
											</MenuItem>
										))}
									</TextField>
								</Box>
								<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
									<TextField
										size="small"
										label="U Position"
										type="number"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={progressForm.uPosition}
										onChange={(e) =>
											setProgressForm((prev) => ({ ...prev, uPosition: e.target.value }))
										}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Numbers sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								</Box>
								<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
									<TextField
										size="small"
										label="Serial Number"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={progressForm.serialNumber}
										onChange={(e) =>
											setProgressForm((prev) => ({ ...prev, serialNumber: e.target.value }))
										}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Badge sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								</Box>
								<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
									<TextField
										size="small"
										label="Provided By"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={progressForm.providedBy}
										onChange={(e) =>
											setProgressForm((prev) => ({ ...prev, providedBy: e.target.value }))
										}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Business sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								</Box>
								<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
									<TextField
										size="small"
										label="Installation Date"
										type="date"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={progressForm.installationDate}
										onChange={(e) =>
											setProgressForm((prev) => ({ ...prev, installationDate: e.target.value }))
										}
										onFocus={openNativeDateTimePicker}
										onClick={openNativeDateTimePicker}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<CalendarMonth sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								</Box>
								<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 8' } }}>
									<TextField
										size="small"
										label="Equipment Description"
										fullWidth
										InputLabelProps={{ shrink: true }}
										multiline
										minRows={2}
										value={progressForm.description}
										onChange={(e) =>
											setProgressForm((prev) => ({ ...prev, description: e.target.value }))
										}
										sx={drawerTextFieldStyles}
									/>
								</Box>
							</Box>
						</>
					)}

					<Stack direction="row" justifyContent="flex-end" spacing={1.2} sx={{ mt: 2.5 }}>
						<Button variant="outlined" onClick={closeProgressDialog}>
							Cancel
						</Button>
						<Button
							variant="contained"
							onClick={handleAddProgress}
							disabled={addingProgress || isProgressFormInvalid}
						>
							Save Progress
						</Button>
					</Stack>
				</Box>
			</RtmDialog>

			<RtmDialog
				drawerName={EDIT_ITEM_DIALOG}
				maxWidth="sm"
				fullWidth
				onCancel={closeEditItemDialog}
			>
				<Box sx={{ p: 2.5 }}>
					<Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
						Edit LOA Item
					</Typography>
					<Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', mb: 2 }}>
						Update item details for consignee list
					</Typography>

					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: 'repeat(12, minmax(0, 1fr))' },
							gap: 1.5,
						}}
					>
						<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 12' } }}>
							<TextField
								size="small"
								label="Item Name"
								fullWidth
								value={editItemForm.itemName}
								onChange={(e) => setEditItemForm((prev) => ({ ...prev, itemName: e.target.value }))}
								sx={drawerTextFieldStyles}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Inventory sx={{ color: 'primary.main' }} />
										</InputAdornment>
									),
								}}
							/>
						</Box>
						<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
							<TextField
								size="small"
								select
								label="Category"
								fullWidth
								value={editItemForm.category}
								onChange={(e) => setEditItemForm((prev) => ({ ...prev, category: e.target.value }))}
								sx={drawerTextFieldStyles}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Category sx={{ color: 'text.secondary' }} />
										</InputAdornment>
									),
								}}
							>
								{itemCategoryOptions.map((option) => (
									<MenuItem key={option} value={option}>
										{option}
									</MenuItem>
								))}
							</TextField>
						</Box>
						<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
							<TextField
								size="small"
								select
								label="Unit"
								fullWidth
								value={editItemForm.uom}
								onChange={(e) => setEditItemForm((prev) => ({ ...prev, uom: e.target.value }))}
								sx={drawerTextFieldStyles}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Straighten sx={{ color: 'text.secondary' }} />
										</InputAdornment>
									),
								}}
							>
								{unitOptions.map((option) => (
									<MenuItem key={option} value={option}>
										{option}
									</MenuItem>
								))}
							</TextField>
						</Box>
						{!isSectionalRole && (
							<Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
								<TextField
									size="small"
									type="number"
									label="LOA Quantity"
									fullWidth
									value={editItemForm.plannedQty}
									onChange={(e) =>
										setEditItemForm((prev) => ({ ...prev, plannedQty: e.target.value }))
									}
									sx={drawerTextFieldStyles}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<Numbers sx={{ color: 'text.secondary' }} />
											</InputAdornment>
										),
										inputProps: { min: 0, step: 0.01 },
									}}
								/>
							</Box>
						)}
					</Box>

					<Stack direction="row" justifyContent="flex-end" spacing={1.2} sx={{ mt: 2.5 }}>
						<Button variant="outlined" onClick={closeEditItemDialog}>
							Cancel
						</Button>
						<RtmLoadingButton
							variant="contained"
							onClick={handleUpdateItem}
							loading={updatingItem}
							loadingText="Saving..."
							disabled={!editItemForm.itemName.trim()}
						>
							Save Item
						</RtmLoadingButton>
					</Stack>
				</Box>
			</RtmDialog>

			<RtmDrawer drawerName={CREATE_WORK_DRAWER}>
				<Box
					sx={{
						width: { xs: '100vw', sm: 520 },
						display: 'flex',
						flexDirection: 'column',
						height: '100%',
						bgcolor: 'background.paper',
					}}
				>
					<Box
						sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
					>
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
								{editingWorkId ? 'Edit Work' : 'Add Work'}
							</Typography>
							<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
								{editingWorkId ? 'Update LoA work details' : 'Create new LoA work'}
							</Typography>
						</Box>
						<IconButton
							onClick={() => {
								setEditingWorkId('');
								dispatch(closeDrawer({ drawerName: CREATE_WORK_DRAWER }));
							}}
							sx={{ bgcolor: 'action.hover' }}
						>
							<Close fontSize="small" />
						</IconButton>
					</Box>
					<Divider />
					<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
						<form
							id="create-work-form"
							onSubmit={(event) => {
								event.preventDefault();
								handleCreateWork();
							}}
						>
							<Stack spacing={3}>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<TextField
										label="LoA No"
										fullWidth
										size="small"
										value={workForm.loaNo}
										onChange={(e) => setWorkForm((prev) => ({ ...prev, loaNo: e.target.value }))}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Badge sx={{ color: 'primary.main' }} />
												</InputAdornment>
											),
										}}
									/>
									<TextField
										label="LoA Date"
										type="date"
										fullWidth
										size="small"
										InputLabelProps={{ shrink: true }}
										value={workForm.loaDate}
										onChange={(e) => setWorkForm((prev) => ({ ...prev, loaDate: e.target.value }))}
										onFocus={openNativeDateTimePicker}
										onClick={openNativeDateTimePicker}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<CalendarMonth sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								</Stack>
								<TextField
									label="Work Title"
									fullWidth
									size="small"
									value={workForm.title}
									onChange={(e) => setWorkForm((prev) => ({ ...prev, title: e.target.value }))}
									sx={drawerTextFieldStyles}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<Description sx={{ color: 'primary.main' }} />
											</InputAdornment>
										),
									}}
								/>
								<TextField
									select
									label="Consignee"
									fullWidth
									size="small"
									value={workForm.consigneeId}
									onChange={(e) =>
										setWorkForm((prev) => ({ ...prev, consigneeId: e.target.value }))
									}
									sx={drawerTextFieldStyles}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<Person sx={{ color: 'text.secondary' }} />
											</InputAdornment>
										),
									}}
								>
									{engineerUsers.map((user) => (
										<MenuItem key={user.id} value={user.id}>
											{user.name} ({user.designation || user.role})
										</MenuItem>
									))}
								</TextField>
								<TextField
									label="Contractor"
									fullWidth
									size="small"
									value={workForm.contractorName}
									onChange={(e) =>
										setWorkForm((prev) => ({ ...prev, contractorName: e.target.value }))
									}
									sx={drawerTextFieldStyles}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<Business sx={{ color: 'text.secondary' }} />
											</InputAdornment>
										),
									}}
								/>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
									<TextField
										label="Accepted Value"
										type="number"
										fullWidth
										size="small"
										value={workForm.acceptedValue}
										onChange={(e) =>
											setWorkForm((prev) => ({ ...prev, acceptedValue: e.target.value }))
										}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<CurrencyRupee sx={{ color: 'primary.main' }} />
												</InputAdornment>
											),
										}}
									/>
									<TextField
										label="Completion (Months)"
										type="number"
										fullWidth
										size="small"
										value={workForm.completionPeriodMonths}
										onChange={(e) =>
											setWorkForm((prev) => ({ ...prev, completionPeriodMonths: e.target.value }))
										}
										sx={drawerTextFieldStyles}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Numbers sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								</Stack>
								<TextField
									label="Description"
									fullWidth
									size="small"
									multiline
									minRows={3}
									value={workForm.description}
									onChange={(e) =>
										setWorkForm((prev) => ({ ...prev, description: e.target.value }))
									}
									sx={drawerTextFieldStyles}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<Description sx={{ color: 'text.secondary' }} />
											</InputAdornment>
										),
									}}
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
								onClick={() => {
									setEditingWorkId('');
									dispatch(closeDrawer({ drawerName: CREATE_WORK_DRAWER }));
								}}
								sx={{ fontWeight: 700, color: 'text.secondary' }}
							>
								Cancel
							</Button>
							<RtmLoadingButton
								type="submit"
								form="create-work-form"
								variant="contained"
								fullWidth
								disableElevation
								loading={creatingWork || updatingWork}
								loadingText={editingWorkId ? 'Saving...' : 'Creating...'}
								sx={{ bgcolor: 'primary.main', fontWeight: 700, borderRadius: 2 }}
							>
								{editingWorkId ? 'Save Changes' : 'Create Work'}
							</RtmLoadingButton>
						</Stack>
					</Box>
				</Box>
			</RtmDrawer>
		</Box>
	);
}
