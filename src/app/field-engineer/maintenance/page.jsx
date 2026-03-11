'use client';

import {
	CheckCircle,
	ElectricalServices,
	EventRepeat,
	FilterAlt,
	Refresh,
	Timeline,
	WarningAmber,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Chip,
	IconButton,
	MenuItem,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { useCreateStationCircuit, useDivisionCircuits, useStationCircuits } from '@/hooks/circuits';
import { useTabs } from '@/hooks/common';
import { useStationLocations } from '@/hooks/locations';
import { useMyMaintenanceSummary } from '@/hooks/maintenance';
import { useStations } from '@/hooks/stations';
import RtmDataGrid from '@/lib/common/datagrid';
import RtmTabs from '@/lib/common/tabs';
import { openNativeDateTimePicker } from '@/lib/util/date-input';
import { CompleteMaintenanceDialog } from '@/modules/maintenance';

const MAINT_TABS = [
	{ label: 'My Queue', step: 'queue', icon: <EventRepeat sx={{ fontSize: 18 }} /> },
	{ label: 'Completed Log', step: 'completed', icon: <CheckCircle sx={{ fontSize: 18 }} /> },
	{ label: 'History Timeline', step: 'timeline', icon: <Timeline sx={{ fontSize: 18 }} /> },
	{
		label: 'Circuit Registry',
		step: 'circuits',
		icon: <ElectricalServices sx={{ fontSize: 18 }} />,
	},
];

const TYPE_LABELS = {
	STATION_INSPECTION_MAINTENANCE: 'Station Insp/Maint',
	CABLE_TESTING: 'Cable Testing',
	EC_SOCKET_TESTING: 'EC Socket Testing',
	CUSTOM: 'Custom',
};

const formatDate = (value) => {
	if (!value) return '-';
	return new Date(value).toLocaleDateString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
};

const formatDateTime = (value) => {
	if (!value) return '-';
	return new Date(value).toLocaleString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

const getTargetLabel = (item) => {
	if (item?.schedule?.targetScope === 'SUBSECTION' && item?.schedule?.subsection) {
		return `${item.schedule.subsection.code} (${item.schedule.subsection.name})`;
	}
	if (item?.schedule?.station) {
		return `${item.schedule.station.name} (${item.schedule.station.code})`;
	}
	return '-';
};

const getEffectiveDate = (item) => item.completedAt || item.dueDate || item.createdAt || null;

const getStatusChipProps = (status) => {
	if (status === 'COMPLETED') return { color: 'success', label: 'COMPLETED' };
	if (status === 'OVERDUE') return { color: 'error', label: 'OVERDUE' };
	return { color: 'warning', label: 'OPEN' };
};

const recordMatchesFilters = (item, filters) => {
	const schedule = item?.schedule || {};
	const normalizedSearch = filters.search.trim().toLowerCase();

	if (filters.status !== 'ALL' && item.status !== filters.status) return false;
	if (filters.type !== 'ALL' && schedule.scheduleType !== filters.type) return false;
	if (filters.scope !== 'ALL' && schedule.targetScope !== filters.scope) return false;

	const effectiveDate = getEffectiveDate(item);
	if (filters.from && effectiveDate) {
		const fromDate = new Date(filters.from);
		fromDate.setHours(0, 0, 0, 0);
		if (new Date(effectiveDate) < fromDate) return false;
	}
	if (filters.to && effectiveDate) {
		const toDate = new Date(filters.to);
		toDate.setHours(23, 59, 59, 999);
		if (new Date(effectiveDate) > toDate) return false;
	}

	if (!normalizedSearch) return true;
	const searchIn = [
		schedule.title,
		TYPE_LABELS[schedule.scheduleType] || schedule.scheduleType,
		getTargetLabel(item),
		item.remarks,
		item.jointDoneWithName,
	]
		.join(' ')
		.toLowerCase();
	return searchIn.includes(normalizedSearch);
};

const statusPillSx = (theme, status) => {
	if (status === 'COMPLETED') {
		return {
			bgcolor: alpha(theme.palette.success.main, 0.2),
			color: theme.palette.success.main,
			fontWeight: 700,
		};
	}
	if (status === 'OVERDUE') {
		return {
			bgcolor: alpha(theme.palette.error.main, 0.2),
			color: theme.palette.error.main,
			fontWeight: 700,
		};
	}
	return {
		bgcolor: alpha(theme.palette.warning.main, 0.2),
		color: theme.palette.warning.main,
		fontWeight: 700,
	};
};

export default function FieldEngineerMaintenancePage() {
	const { data: session } = useSession();
	const { currentTab } = useTabs('fieldMaintenance', { currentTab: 'queue' });
	const { data: maintenanceSummary, isLoading, refetch } = useMyMaintenanceSummary();
	const { data: masterCircuits = [] } = useDivisionCircuits();
	const { data: stationCircuits = [], isLoading: loadingStationCircuits } = useStationCircuits();
	const { data: stations = [] } = useStations();
	const { mutate: createStationCircuit, isLoading: creatingStationCircuit } =
		useCreateStationCircuit();
	const [selectedOccurrence, setSelectedOccurrence] = useState(null);
	const [circuitForm, setCircuitForm] = useState({
		stationId: '',
		locationId: '',
		circuitMasterId: '',
		identifier: '',
	});
	const [filters, setFilters] = useState({
		status: 'ALL',
		type: 'ALL',
		scope: 'ALL',
		from: '',
		to: '',
		search: '',
	});
	const { data: stationLocations = [] } = useStationLocations(circuitForm.stationId);

	const mySupervisedStations = useMemo(
		() => stations.filter((station) => station.supervisor?.id === session?.user?.id),
		[session?.user?.id, stations]
	);

	const pendingRows = maintenanceSummary?.pending || [];
	const completedRows = maintenanceSummary?.completed || [];

	const filteredPending = useMemo(
		() =>
			pendingRows.filter((item) => {
				if (filters.status === 'COMPLETED') return false;
				return recordMatchesFilters(item, filters);
			}),
		[pendingRows, filters]
	);

	const filteredCompleted = useMemo(
		() =>
			completedRows.filter((item) => {
				if (filters.status !== 'ALL' && filters.status !== 'COMPLETED') return false;
				return recordMatchesFilters(item, filters);
			}),
		[completedRows, filters]
	);

	const timelineRows = useMemo(
		() =>
			[...filteredPending, ...filteredCompleted].sort(
				(a, b) => new Date(getEffectiveDate(b) || 0) - new Date(getEffectiveDate(a) || 0)
			),
		[filteredCompleted, filteredPending]
	);

	const resetFilters = () => {
		setFilters({
			status: 'ALL',
			type: 'ALL',
			scope: 'ALL',
			from: '',
			to: '',
			search: '',
		});
	};

	return (
		<Box sx={{ p: 4 }}>
			<CompleteMaintenanceDialog
				open={!!selectedOccurrence}
				onClose={() => setSelectedOccurrence(null)}
				occurrence={selectedOccurrence}
			/>

			<Stack
				direction={{ xs: 'column', md: 'row' }}
				alignItems={{ xs: 'flex-start', md: 'center' }}
				justifyContent="space-between"
				spacing={2}
				sx={{ mb: 3 }}
			>
				<Box>
					<Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Maintenance Workspace
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
						Track assigned schedules, complete work, and review execution history.
					</Typography>
				</Box>
				<Stack direction="row" spacing={1}>
					<Chip
						label={`Pending: ${maintenanceSummary?.pendingCount || 0}`}
						sx={(theme) => statusPillSx(theme, 'OPEN')}
					/>
					<Chip
						label={`Completed: ${maintenanceSummary?.completedCount || 0}`}
						sx={(theme) => statusPillSx(theme, 'COMPLETED')}
					/>
					<Tooltip title="Refresh">
						<IconButton onClick={refetch} sx={{ bgcolor: 'action.hover' }}>
							<Refresh fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>
			</Stack>

			<RtmTabs
				tabs={MAINT_TABS}
				tabsName="fieldMaintenance"
				initialState={{ currentTab: 'queue' }}
			/>

			{currentTab !== 'circuits' && (
				<Box
					sx={{
						mt: 2,
						mb: 3,
						p: 2,
						border: '1px solid',
						borderColor: 'divider',
						borderRadius: 3,
						bgcolor: 'background.paper',
					}}
				>
					<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
						<FilterAlt sx={{ color: 'primary.main', fontSize: 18 }} />
						<Typography sx={{ fontWeight: 700, color: 'text.secondary' }}>Filters</Typography>
					</Stack>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField
							select
							label="Status"
							value={filters.status}
							onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
							sx={{ minWidth: 160 }}
						>
							<MenuItem value="ALL">All</MenuItem>
							<MenuItem value="OPEN">Open</MenuItem>
							<MenuItem value="OVERDUE">Overdue</MenuItem>
							<MenuItem value="COMPLETED">Completed</MenuItem>
						</TextField>

						<TextField
							select
							label="Type"
							value={filters.type}
							onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
							sx={{ minWidth: 220 }}
						>
							<MenuItem value="ALL">All</MenuItem>
							{Object.entries(TYPE_LABELS).map(([value, label]) => (
								<MenuItem key={value} value={value}>
									{label}
								</MenuItem>
							))}
						</TextField>

						<TextField
							select
							label="Scope"
							value={filters.scope}
							onChange={(e) => setFilters((prev) => ({ ...prev, scope: e.target.value }))}
							sx={{ minWidth: 160 }}
						>
							<MenuItem value="ALL">All</MenuItem>
							<MenuItem value="STATION">Station</MenuItem>
							<MenuItem value="SUBSECTION">Sub-section</MenuItem>
						</TextField>

						<TextField
							label="From"
							type="date"
							value={filters.from}
							onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
							InputLabelProps={{ shrink: true }}
							onFocus={openNativeDateTimePicker}
							onClick={openNativeDateTimePicker}
							sx={{ minWidth: 170 }}
						/>

						<TextField
							label="To"
							type="date"
							value={filters.to}
							onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
							InputLabelProps={{ shrink: true }}
							onFocus={openNativeDateTimePicker}
							onClick={openNativeDateTimePicker}
							sx={{ minWidth: 170 }}
						/>

						<TextField
							label="Search"
							placeholder="Title, target, remarks..."
							value={filters.search}
							onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
							sx={{ minWidth: 250, flex: 1 }}
						/>

						<Button variant="outlined" onClick={resetFilters} sx={{ minWidth: 110 }}>
							Reset
						</Button>
					</Stack>
				</Box>
			)}

			{currentTab === 'queue' && (
				<RtmDataGrid
					loading={isLoading}
					rows={filteredPending.map((item) => ({
						id: item.id,
						title: item.schedule?.title || '-',
						type: TYPE_LABELS[item.schedule?.scheduleType] || item.schedule?.scheduleType || '-',
						target: getTargetLabel(item),
						dueDate: item.dueDate,
						status: item.status,
						joint: item.schedule?.isJointSchedule ? 'Joint' : 'Regular',
						escalated: item.escalatedAt ? 'Yes' : 'No',
						occurrence: item,
					}))}
					columns={[
						{ field: 'title', headerName: 'Schedule', flex: 1.2 },
						{ field: 'type', headerName: 'Type', flex: 1 },
						{ field: 'target', headerName: 'Target', flex: 1.2 },
						{
							field: 'dueDate',
							headerName: 'Due',
							flex: 0.9,
							renderCell: (params) => formatDate(params.value),
						},
						{
							field: 'status',
							headerName: 'Status',
							flex: 0.8,
							renderCell: (params) => (
								<Chip
									size="small"
									label={params.value}
									sx={(theme) => statusPillSx(theme, params.value)}
								/>
							),
						},
						{ field: 'joint', headerName: 'Mode', flex: 0.8 },
						{ field: 'escalated', headerName: 'Escalated', flex: 0.8 },
						{
							field: 'actions',
							headerName: 'Action',
							flex: 0.8,
							sortable: false,
							filterable: false,
							renderCell: (params) => (
								<Button
									size="small"
									variant="contained"
									onClick={() => setSelectedOccurrence(params.row.occurrence)}
									sx={{ textTransform: 'none', fontWeight: 700 }}
								>
									Complete
								</Button>
							),
						},
					]}
				/>
			)}

			{currentTab === 'completed' && (
				<RtmDataGrid
					loading={isLoading}
					rows={filteredCompleted.map((item) => ({
						id: item.id,
						title: item.schedule?.title || '-',
						type: TYPE_LABELS[item.schedule?.scheduleType] || item.schedule?.scheduleType || '-',
						target: getTargetLabel(item),
						completedAt: item.completedAt,
						jointWith: item.jointDoneWithName || '-',
						remarks: item.remarks || '-',
						proofCount: item.proofUrls?.length || 0,
					}))}
					columns={[
						{ field: 'title', headerName: 'Schedule', flex: 1.2 },
						{ field: 'type', headerName: 'Type', flex: 0.9 },
						{ field: 'target', headerName: 'Target', flex: 1.2 },
						{
							field: 'completedAt',
							headerName: 'Completed On',
							flex: 1,
							renderCell: (params) => formatDateTime(params.value),
						},
						{ field: 'jointWith', headerName: 'Joint With', flex: 1 },
						{ field: 'proofCount', headerName: 'Proofs', flex: 0.6 },
						{ field: 'remarks', headerName: 'Remarks', flex: 1.2 },
					]}
				/>
			)}

			{currentTab === 'timeline' && (
				<Box
					sx={{
						p: 3,
						border: '1px solid',
						borderColor: 'divider',
						borderRadius: 3,
						bgcolor: 'background.paper',
					}}
				>
					{timelineRows.length === 0 ? (
						<Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
							No records found for the selected filters.
						</Typography>
					) : (
						<Stack spacing={2}>
							{timelineRows.map((item) => {
								const schedule = item.schedule || {};
								const statusProps = getStatusChipProps(item.status);
								return (
									<Box
										key={item.id}
										sx={{
											p: 2,
											borderRadius: 2.5,
											border: '1px solid',
											borderColor: 'divider',
											position: 'relative',
											overflow: 'hidden',
										}}
									>
										<Box
											sx={(theme) => ({
												position: 'absolute',
												left: 0,
												top: 0,
												bottom: 0,
												width: 4,
												bgcolor:
													item.status === 'COMPLETED'
														? theme.palette.success.main
														: item.status === 'OVERDUE'
															? theme.palette.error.main
															: theme.palette.warning.main,
											})}
										/>
										<Stack
											direction={{ xs: 'column', md: 'row' }}
											justifyContent="space-between"
											spacing={1}
											sx={{ pl: 1 }}
										>
											<Box>
												<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
													{schedule.title || '-'}
												</Typography>
												<Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mt: 0.5 }}>
													{TYPE_LABELS[schedule.scheduleType] || schedule.scheduleType} •{' '}
													{getTargetLabel(item)}
												</Typography>
											</Box>
											<Chip
												size="small"
												label={statusProps.label}
												color={statusProps.color}
												sx={{ fontWeight: 700 }}
											/>
										</Stack>

										<Stack
											direction={{ xs: 'column', md: 'row' }}
											spacing={2}
											sx={{ pl: 1, mt: 1.2 }}
										>
											<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
												Due: {formatDate(item.dueDate)}
											</Typography>
											{item.completedAt && (
												<Typography
													sx={{ fontSize: '0.8rem', color: 'success.main', fontWeight: 700 }}
												>
													Completed: {formatDateTime(item.completedAt)}
												</Typography>
											)}
											{item.escalatedAt && (
												<Stack direction="row" spacing={0.5} alignItems="center">
													<WarningAmber sx={{ fontSize: 14, color: 'error.main' }} />
													<Typography
														sx={{ fontSize: '0.8rem', color: 'error.main', fontWeight: 700 }}
													>
														Escalated: {formatDateTime(item.escalatedAt)}
													</Typography>
												</Stack>
											)}
										</Stack>

										{(item.remarks || item.jointDoneWithName) && (
											<Box sx={{ mt: 1.2, pl: 1 }}>
												{item.jointDoneWithName && (
													<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
														Joint with: {item.jointDoneWithName}
														{item.jointDoneWithDesignation
															? ` (${item.jointDoneWithDesignation})`
															: ''}
													</Typography>
												)}
												{item.remarks && (
													<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
														Remarks: {item.remarks}
													</Typography>
												)}
											</Box>
										)}
									</Box>
								);
							})}
						</Stack>
					)}
				</Box>
			)}

			{currentTab === 'circuits' && (
				<Stack spacing={2.5} sx={{ mt: 2 }}>
					<Box
						sx={{
							p: 2.5,
							border: '1px solid',
							borderColor: 'divider',
							borderRadius: 3,
							bgcolor: 'background.paper',
						}}
					>
						<Typography sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5 }}>
							Add Station Circuit
						</Typography>
						<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
							<TextField
								select
								label="Station"
								value={circuitForm.stationId}
								onChange={(e) =>
									setCircuitForm((prev) => ({
										...prev,
										stationId: e.target.value,
										locationId: '',
									}))
								}
								fullWidth
							>
								{mySupervisedStations.map((station) => (
									<MenuItem key={station.id} value={station.id}>
										{station.data?.label || station.name} ({station.data?.code || station.code})
									</MenuItem>
								))}
							</TextField>
							<TextField
								select
								label="Location (optional)"
								value={circuitForm.locationId}
								onChange={(e) =>
									setCircuitForm((prev) => ({ ...prev, locationId: e.target.value }))
								}
								fullWidth
								disabled={!circuitForm.stationId}
							>
								<MenuItem value="">No specific location</MenuItem>
								{stationLocations.map((location) => (
									<MenuItem key={location.id} value={location.id}>
										{location.name}
									</MenuItem>
								))}
							</TextField>
							<TextField
								select
								label="Circuit Type"
								value={circuitForm.circuitMasterId}
								onChange={(e) =>
									setCircuitForm((prev) => ({
										...prev,
										circuitMasterId: e.target.value,
									}))
								}
								fullWidth
							>
								{masterCircuits
									.filter((item) => item.isActive)
									.map((item) => (
										<MenuItem key={item.id} value={item.id}>
											{item.name} ({item.code})
										</MenuItem>
									))}
							</TextField>
							<TextField
								label="Identifier"
								placeholder="e.g. VHF-RTM-01"
								value={circuitForm.identifier}
								onChange={(e) =>
									setCircuitForm((prev) => ({ ...prev, identifier: e.target.value }))
								}
								fullWidth
							/>
							<Button
								variant="contained"
								disabled={
									creatingStationCircuit || !circuitForm.stationId || !circuitForm.circuitMasterId
								}
								onClick={() => {
									createStationCircuit(
										{
											stationId: circuitForm.stationId,
											locationId: circuitForm.locationId || null,
											circuitMasterId: circuitForm.circuitMasterId,
											identifier: circuitForm.identifier || null,
										},
										{
											onSuccess: () =>
												setCircuitForm((prev) => ({
													...prev,
													locationId: '',
													circuitMasterId: '',
													identifier: '',
												})),
										}
									);
								}}
								sx={{ minWidth: 140 }}
							>
								Submit
							</Button>
						</Stack>
					</Box>

					<RtmDataGrid
						loading={loadingStationCircuits}
						rows={stationCircuits.map((item) => ({
							id: item.id,
							circuit: `${item.circuitMaster?.name || '-'}${item.identifier ? ` • ${item.identifier}` : ''}`,
							station: item.station ? `${item.station.name} (${item.station.code})` : '-',
							location: item.location?.name || '-',
							status: item.status,
							requestedOn: item.createdAt,
							reviewedOn: item.approvedAt,
							rejectionReason: item.rejectionReason || '-',
						}))}
						columns={[
							{ field: 'circuit', headerName: 'Circuit', flex: 1.4 },
							{ field: 'station', headerName: 'Station', flex: 1.1 },
							{ field: 'location', headerName: 'Location', flex: 0.8 },
							{
								field: 'status',
								headerName: 'Status',
								flex: 0.8,
								renderCell: (params) => (
									<Chip
										size="small"
										label={params.value}
										color={
											params.value === 'APPROVED'
												? 'success'
												: params.value === 'REJECTED'
													? 'error'
													: 'warning'
										}
									/>
								),
							},
							{
								field: 'requestedOn',
								headerName: 'Requested On',
								flex: 0.9,
								renderCell: (params) => formatDate(params.value),
							},
							{
								field: 'reviewedOn',
								headerName: 'Reviewed On',
								flex: 0.9,
								renderCell: (params) => formatDate(params.value),
							},
							{ field: 'rejectionReason', headerName: 'Rejection Reason', flex: 1.2 },
						]}
					/>
				</Stack>
			)}
		</Box>
	);
}
