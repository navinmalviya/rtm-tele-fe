'use client';

import {
	Add,
	ArrowBack,
	Biotech,
	Cable,
	CallSplit,
	ContentCut,
	Hub,
	Inventory2,
	Map as MapIcon,
	Straighten,
} from '@mui/icons-material';
import { Box, Button, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useCableDetails } from '@/hooks/cable';
import { useTabs } from '@/hooks/common';
import RtmDataGrid from '@/lib/common/datagrid';
import RtmLoader from '@/lib/common/loader';
import RtmTabs from '@/lib/common/tabs';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import AddCableCutDrawer, { ADD_CABLE_CUT_DRAWER } from './AddCableCutDrawer';
import AddCableJointDrawer, { ADD_CABLE_JOINT_DRAWER } from './AddCableJointDrawer';
import AddCableTestReportDrawer, { ADD_CABLE_TEST_REPORT_DRAWER } from './AddCableTestReportDrawer';
import ConnectPairCircuitDrawer, {
	CONNECT_PAIR_CIRCUIT_DRAWER,
} from './ConnectPairCircuitDrawer';

const CABLE_TABS = [
	{ label: 'Cable Parameters', step: 'parameters', icon: <Inventory2 sx={{ fontSize: 18 }} /> },
	{ label: 'Cable Joints', step: 'joints', icon: <CallSplit sx={{ fontSize: 18 }} /> },
	{ label: 'Cable Cuts', step: 'cuts', icon: <ContentCut sx={{ fontSize: 18 }} /> },
	{ label: 'Cable Testings', step: 'testings', icon: <Biotech sx={{ fontSize: 18 }} /> },
];

const TEST_CAUSE_LABELS = {
	SCHEDULED: 'Scheduled',
	FAILURE: 'Failure',
	POST_RESTORATION: 'Post Restoration',
	COMMISSIONING: 'Commissioning',
	OTHER: 'Other',
};

const CORE_COLOR_MAP = {
	orange: '#f97316',
	blue: '#2563eb',
	brown: '#8b5a2b',
	green: '#16a34a',
	yellow: '#facc15',
	black: '#111827',
	white: '#f8fafc',
	red: '#dc2626',
	grey: '#6b7280',
	gray: '#6b7280',
	natural: '#e5e7eb',
};

const formatDateTime = (value) => {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleString('en-IN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
};

const formatDateOnly = (value) => {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleDateString('en-IN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

const getColorHex = (colorName) => {
	if (!colorName) return '#94a3b8';
	const normalized = String(colorName).trim().toLowerCase();
	return CORE_COLOR_MAP[normalized] || '#94a3b8';
};

const InfoCard = ({ icon, label, value, color = 'primary.main' }) => (
	<Paper
		elevation={0}
		sx={{
			p: 2,
			borderRadius: 3,
			border: '1px solid',
			borderColor: 'divider',
			bgcolor: 'background.paper',
		}}
	>
		<Stack direction="row" spacing={1.5} alignItems="center">
			<Box
				sx={{
					width: 36,
					height: 36,
					borderRadius: 2,
					bgcolor: 'action.hover',
					color,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{icon}
			</Box>
			<Box sx={{ minWidth: 0 }}>
				<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary' }}>
					{label}
				</Typography>
				<Typography
					sx={{
						fontSize: '0.95rem',
						fontWeight: 800,
						color: 'text.primary',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
					title={String(value || '')}
				>
					{value || '—'}
				</Typography>
			</Box>
		</Stack>
	</Paper>
);

export default function CableDetailsPage({ cableId }) {
	const router = useRouter();
	const dispatch = useDispatch();
	const { currentTab } = useTabs(`cable-details-${cableId}`, { currentTab: 'parameters' });
	const { data: cable, isLoading, isError, error } = useCableDetails(cableId);
	const [selectedTestingId, setSelectedTestingId] = useState('');

	const segmentRows = useMemo(
		() =>
			(cable?.sideSegments || []).map((segment) => ({
				id: segment.id,
				fromKm: segment.fromKm,
				toKm: segment.toKm,
				side: segment.side,
			})),
		[cable?.sideSegments]
	);

	const jointRows = useMemo(
		() =>
			(cable?.joints || []).map((joint) => ({
				id: joint.id,
				jointType: joint.jointType || 'NORMAL',
				jointKm:
					joint.jointKm !== null && joint.jointKm !== undefined
						? Number(joint.jointKm).toFixed(2)
						: '—',
				side: joint.side || '—',
				location: joint.locationKM || '—',
				socket: joint.ecSocket?.poleKm || '—',
				remarks: joint.remarks || '—',
				createdBy: joint.createdBy?.name || '—',
				jointDate: joint.jointDate || joint.createdAt,
				createdAt: joint.createdAt,
				updatedAt: joint.updatedAt,
			})),
		[cable?.joints]
	);

	const cutRows = useMemo(
		() =>
			(cable?.cuts || []).map((cut) => ({
				id: cut.id,
				locationKm: cut.locationKM || '—',
				reportedBy: cut.reportedBy?.name || '—',
				cutDateTime: cut.cutDateTime,
				restorationDateTime: cut.restorationDateTime,
				putRightDetails: cut.putRightDetails || '—',
			})),
		[cable?.cuts]
	);

	const testingRows = useMemo(
		() =>
			(cable?.testReports || []).map((report) => ({
				id: report.id,
				testDate: report.testDate,
				measuredOn: report.measuredOn,
				testCause: report.testCause || 'SCHEDULED',
				testedBy: report.testedBy?.name || '—',
				sectionName: report.sectionName || cable?.subsection?.name || '—',
				blockSectionName: report.blockSectionName || '—',
				measuredAt: report.measuredAtStation
					? `${report.measuredAtStation.name} (${report.measuredAtStation.code})`
					: '—',
				calculatedLoopResistance: report.calculatedLoopResistance ?? '—',
				calculatedAttenuation: report.calculatedAttenuation ?? '—',
				dbLoss: report.dbLoss ?? '—',
				overallRemarks: report.overallRemarks || '—',
				measuredCount: report.measuredValues?.length || 0,
				measuredValues: report.measuredValues || [],
			})),
		[cable?.subsection?.name, cable?.testReports]
	);

	const latestTestReport = useMemo(
		() => (Array.isArray(cable?.testReports) && cable.testReports.length ? cable.testReports[0] : null),
		[cable?.testReports]
	);

	const latestPairMeasuredMap = useMemo(() => {
		const map = new Map();
		for (const row of latestTestReport?.measuredValues || []) {
			if (row?.quadNo === null || row?.quadNo === undefined) continue;
			if (row?.pairNo === null || row?.pairNo === undefined) continue;
			map.set(`${row.quadNo}-${row.pairNo}`, row);
		}
		return map;
	}, [latestTestReport?.id, latestTestReport?.measuredValues]);

	const quadGroups = useMemo(() => {
		const grouped = new Map();
		for (const pair of cable?.copperPairs || []) {
			const key = pair.quadNo ?? 0;
			const current = grouped.get(key) || {
				quadNo: key,
				quadColor: pair.quadColor || '',
				pairs: [],
			};
			current.pairs.push(pair);
			grouped.set(key, current);
		}

		return Array.from(grouped.values())
			.sort((a, b) => a.quadNo - b.quadNo)
			.map((quad) => ({
				...quad,
				pairs: [...quad.pairs].sort((a, b) => a.pairNo - b.pairNo),
			}));
	}, [cable?.copperPairs]);

	useEffect(() => {
		if (!testingRows.length) {
			setSelectedTestingId('');
			return;
		}
		if (!selectedTestingId || !testingRows.some((row) => row.id === selectedTestingId)) {
			setSelectedTestingId(testingRows[0].id);
		}
	}, [selectedTestingId, testingRows]);

	const selectedTesting = useMemo(
		() => testingRows.find((row) => row.id === selectedTestingId) || null,
		[selectedTestingId, testingRows]
	);

	if (!cableId) {
		return <RtmLoader label="Loading cable..." minHeight="50vh" />;
	}

	if (isLoading) {
		return <RtmLoader label="Loading cable details..." minHeight="50vh" />;
	}

	if (isError) {
		const errorMessage =
			error?.response?.data?.message ||
			error?.response?.data?.error ||
			'Unable to load cable details.';
		return (
			<Box sx={{ p: 3 }}>
				<Button
					variant="outlined"
					size="small"
					startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
					onClick={() => router.back()}
					sx={{ mb: 2 }}
				>
					Back
				</Button>
				<Typography variant="h6" sx={{ fontWeight: 800 }}>
					Cable details unavailable
				</Typography>
				<Typography sx={{ mt: 0.5, color: 'text.secondary' }}>{errorMessage}</Typography>
			</Box>
		);
	}

	if (!cable) {
		return (
			<Box sx={{ p: 3 }}>
				<Button
					variant="outlined"
					size="small"
					startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
					onClick={() => router.back()}
					sx={{ mb: 2 }}
				>
					Back
				</Button>
				<Typography variant="h6" sx={{ fontWeight: 800 }}>
					Cable not found
				</Typography>
			</Box>
		);
	}

	const segmentColumns = [
		{ field: 'fromKm', headerName: 'From KM', flex: 1, minWidth: 120 },
		{ field: 'toKm', headerName: 'To KM', flex: 1, minWidth: 120 },
		{
			field: 'side',
			headerName: 'Side',
			flex: 1,
			minWidth: 120,
			renderCell: (params) => (
				<Chip
					size="small"
					label={params.value}
					color={params.value === 'DOWN' ? 'warning' : 'success'}
					variant="outlined"
				/>
			),
		},
	];

	const jointColumns = [
		{
			field: 'jointType',
			headerName: 'Type',
			flex: 0.6,
			minWidth: 110,
			renderCell: (params) => (
				<Chip
					size="small"
					label={params.value}
					color={params.value === 'EC' ? 'warning' : 'info'}
					variant="outlined"
				/>
			),
		},
		{ field: 'jointKm', headerName: 'Joint KM', flex: 0.7, minWidth: 120 },
		{ field: 'side', headerName: 'Side', flex: 0.5, minWidth: 90 },
		{ field: 'location', headerName: 'Joint Location', flex: 1.2, minWidth: 220 },
		{ field: 'socket', headerName: 'EC Socket', flex: 0.8, minWidth: 140 },
		{ field: 'remarks', headerName: 'Remarks', flex: 1, minWidth: 180 },
		{ field: 'createdBy', headerName: 'Created By', flex: 0.8, minWidth: 140 },
		{
			field: 'jointDate',
			headerName: 'Joint Date',
			flex: 0.9,
			minWidth: 170,
			renderCell: (params) => formatDateTime(params.value),
		},
		{
			field: 'createdAt',
			headerName: 'Created At',
			flex: 1,
			minWidth: 180,
			renderCell: (params) => formatDateTime(params.value),
		},
		{
			field: 'updatedAt',
			headerName: 'Updated At',
			flex: 1,
			minWidth: 180,
			renderCell: (params) => formatDateTime(params.value),
		},
	];

	const cutColumns = [
		{ field: 'locationKm', headerName: 'Location KM', flex: 1, minWidth: 150 },
		{ field: 'reportedBy', headerName: 'Reported By', flex: 1, minWidth: 180 },
		{
			field: 'cutDateTime',
			headerName: 'Failure Time',
			flex: 1,
			minWidth: 180,
			renderCell: (params) => formatDateTime(params.value),
		},
		{
			field: 'restorationDateTime',
			headerName: 'Restored At',
			flex: 1,
			minWidth: 180,
			renderCell: (params) => formatDateTime(params.value),
		},
		{ field: 'putRightDetails', headerName: 'Put Right Details', flex: 1.3, minWidth: 220 },
	];

	const testingColumns = [
		{
			field: 'testDate',
			headerName: 'Test Date',
			flex: 1,
			minWidth: 180,
			renderCell: (params) => formatDateTime(params.value),
		},
		{
			field: 'testCause',
			headerName: 'Cause',
			flex: 0.8,
			minWidth: 150,
			renderCell: (params) => (
				<Chip
					size="small"
					label={TEST_CAUSE_LABELS[params.value] || params.value}
					color={params.value === 'FAILURE' ? 'error' : 'info'}
					variant="outlined"
				/>
			),
		},
		{ field: 'testedBy', headerName: 'Tested By', flex: 1, minWidth: 170 },
		{
			field: 'measuredOn',
			headerName: 'Measured On',
			flex: 1,
			minWidth: 160,
			renderCell: (params) => formatDateOnly(params.value),
		},
		{ field: 'sectionName', headerName: 'Section', flex: 1, minWidth: 180 },
		{ field: 'blockSectionName', headerName: 'Block Section', flex: 1, minWidth: 180 },
		{ field: 'measuredAt', headerName: 'Measured At', flex: 1, minWidth: 180 },
		{
			field: 'calculatedLoopResistance',
			headerName: 'Calc. Loop (Ohm)',
			flex: 0.85,
			minWidth: 150,
		},
		{
			field: 'calculatedAttenuation',
			headerName: 'Calc. Attn (dB)',
			flex: 0.85,
			minWidth: 150,
		},
		{ field: 'measuredCount', headerName: 'Measured Rows', flex: 0.7, minWidth: 130 },
		{ field: 'overallRemarks', headerName: 'Remarks', flex: 1.2, minWidth: 200 },
	];

	const testingMeasuredValueColumns = [
		{ field: 'srNo', headerName: 'Sr.No', flex: 0.4, minWidth: 70 },
		{ field: 'quadNo', headerName: 'Quad', flex: 0.45, minWidth: 80 },
		{ field: 'pairNo', headerName: 'Pair', flex: 0.45, minWidth: 80 },
		{ field: 'circuitName', headerName: 'Circuit', flex: 1, minWidth: 160 },
		{ field: 'transmissionLossDb', headerName: 'Transmission (dB)', flex: 0.9, minWidth: 150 },
		{ field: 'loopResistanceOhm', headerName: 'Loop (Ohm)', flex: 0.9, minWidth: 130 },
		{ field: 'insulationL1E', headerName: 'L1E (MΩ)', flex: 0.8, minWidth: 120 },
		{ field: 'insulationL2E', headerName: 'L2E (MΩ)', flex: 0.8, minWidth: 120 },
		{ field: 'insulationL1L2', headerName: 'L1L2 (MΩ)', flex: 0.9, minWidth: 130 },
		{ field: 'remarks', headerName: 'Remarks', flex: 1, minWidth: 180 },
	];

	const selectedMeasuredRows = (selectedTesting?.measuredValues || []).map((row) => ({
		id: row.id || `${selectedTesting.id}-${row.srNo}`,
		srNo: row.srNo,
		quadNo: row.quadNo ?? '—',
		pairNo: row.pairNo ?? '—',
		circuitName: row.circuitName || '—',
		transmissionLossDb: row.transmissionLossDb ?? '—',
		loopResistanceOhm: row.loopResistanceOhm ?? '—',
		insulationL1E: row.insulationL1E ?? '—',
		insulationL2E: row.insulationL2E ?? '—',
		insulationL1L2: row.insulationL1L2 ?? '—',
		remarks: row.remarks || '—',
	}));

	return (
		<Box sx={{ px: 3, pb: 3, pt: 1 }}>
			<Button
				variant="outlined"
				size="small"
				startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
				onClick={() => router.back()}
				sx={{ mb: 1.25, minWidth: 'auto', px: 1.25, py: 0.25 }}
			>
				Back
			</Button>

			<Stack
				direction={{ xs: 'column', lg: 'row' }}
				spacing={1.5}
				justifyContent="space-between"
				sx={{ mb: 1 }}
			>
				<Box sx={{ minWidth: 0 }}>
					<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
						<Cable sx={{ color: 'primary.main' }} />
						<Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
							{cable.subType}
						</Typography>
						<Chip size="small" label={cable.type} color="primary" variant="outlined" />
					</Stack>
					<Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
						Cable ID: {cable.id}
					</Typography>
				</Box>
			</Stack>

			<RtmTabs
				tabs={CABLE_TABS}
				tabsName={`cable-details-${cableId}`}
				initialState={{ currentTab: 'parameters' }}
			/>

			{currentTab === 'parameters' && (
				<Stack spacing={2}>
					<Grid container spacing={2}>
						<Grid item xs={12} md={6} lg={3}>
							<InfoCard
								icon={<Straighten fontSize="small" />}
								label="Cable Length"
								value={`${cable.length} m`}
							/>
						</Grid>
						<Grid item xs={12} md={6} lg={3}>
							<InfoCard
								icon={<Hub fontSize="small" />}
								label="Track Side"
								value={cable.side}
								color="success.main"
							/>
						</Grid>
						<Grid item xs={12} md={6} lg={3}>
							<InfoCard
								icon={<MapIcon fontSize="small" />}
								label="Subsection"
								value={cable.subsection?.name || cable.subsection?.code || '—'}
								color="info.main"
							/>
						</Grid>
						<Grid item xs={12} md={6} lg={3}>
							<InfoCard
								icon={<Inventory2 fontSize="small" />}
								label="Commissioned On"
								value={formatDateOnly(cable.dateOfCommissioning)}
								color="warning.main"
							/>
						</Grid>
					</Grid>

					<Paper
						elevation={0}
						sx={{
							p: 2,
							borderRadius: 3,
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
						}}
					>
						<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
							<Chip label={`Maintenance By: ${cable.maintenanceBy || '—'}`} variant="outlined" />
							<Chip label={`Supervisor: ${cable.supervisor?.name || '—'}`} variant="outlined" />
							<Chip label={`Pairs: ${cable.copperPairs?.length || 0}`} variant="outlined" />
							<Chip label={`Fibers: ${cable.fibers?.length || 0}`} variant="outlined" />
							<Chip label={`EC Sockets: ${cable.ecSockets?.length || 0}`} variant="outlined" />
						</Stack>
					</Paper>

					{quadGroups.length > 0 && (
						<Paper
							elevation={0}
							sx={{
								p: 2,
								borderRadius: 3,
								border: '1px solid',
								borderColor: 'divider',
								bgcolor: 'background.paper',
							}}
						>
							<Stack spacing={1.25}>
								<Typography sx={{ fontWeight: 800 }}>Quad Pair Mapping</Typography>
								<Grid container spacing={1.5}>
									{quadGroups.map((quad) => (
										<Grid item xs={12} md={6} lg={4} key={`quad-${quad.quadNo}`}>
											<Paper
												elevation={0}
												sx={{
													p: 1.25,
													borderRadius: 2,
													border: '1px solid',
													borderColor: 'divider',
													bgcolor: 'background.default',
												}}
											>
												<Stack spacing={1}>
													<Stack direction="row" justifyContent="space-between" alignItems="center">
														<Stack direction="row" spacing={1} alignItems="center">
															<Box
																sx={{
																	width: 14,
																	height: 14,
																	borderRadius: '50%',
																	bgcolor: getColorHex(quad.quadColor),
																	border: '1px solid',
																	borderColor: 'divider',
																}}
															/>
															<Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
																Quad {quad.quadNo}
															</Typography>
														</Stack>
														<Chip
															size="small"
															label={quad.quadColor || '—'}
															variant="outlined"
															sx={{ height: 22 }}
														/>
													</Stack>

													{quad.pairs.map((pair) => {
														const pairColors = (pair.pairColor || '')
															.split('/')
															.map((item) => item.trim())
															.filter(Boolean);
														const circuits = pair.circuits || [];
														const connectedLabel = circuits.length
															? circuits.map((item) => item.circuitIdString).join(', ')
															: 'SPARE';
														const latestPairKey = `${pair.quadNo}-${pair.pairNo}`;
														const latestMeasured = latestPairMeasuredMap.get(latestPairKey) || null;
														const latestMeasuredLabel = latestMeasured
															? `Tx ${latestMeasured.transmissionLossDb ?? '—'} dB • Loop ${
																	latestMeasured.loopResistanceOhm ?? '—'
																} Ω • L1E ${latestMeasured.insulationL1E ?? '—'} • L2E ${
																	latestMeasured.insulationL2E ?? '—'
																} • L1L2 ${latestMeasured.insulationL1L2 ?? '—'}`
															: 'No latest test values';

														return (
															<Stack
																key={pair.id}
																direction={{ xs: 'column', sm: 'row' }}
																spacing={1}
																alignItems={{ xs: 'flex-start', sm: 'center' }}
																justifyContent="space-between"
																onClick={() =>
																	dispatch(
																		openDrawer({
																			drawerName: CONNECT_PAIR_CIRCUIT_DRAWER,
																			pairId: pair.id,
																		})
																	)
																}
																sx={{
																	py: 0.75,
																	px: 1,
																	borderRadius: 1.5,
																	bgcolor: 'background.paper',
																	border: '1px solid',
																	borderColor: 'divider',
																	cursor: 'pointer',
																	'&:hover': {
																		borderColor: 'primary.main',
																		bgcolor: 'action.hover',
																	},
																}}
															>
																<Stack sx={{ minWidth: 0 }}>
																	<Stack direction="row" spacing={0.75} alignItems="center">
																		<Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>
																			P{pair.pairNo}
																		</Typography>
																		<Stack direction="row" spacing={0.5}>
																			{pairColors.map((color) => (
																				<Box
																					key={`${pair.id}-${color}`}
																					title={color}
																					sx={{
																						width: 12,
																						height: 12,
																						borderRadius: '50%',
																						bgcolor: getColorHex(color),
																						border: '1px solid',
																						borderColor: 'divider',
																					}}
																				/>
																			))}
																		</Stack>
																		<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
																			{pair.pairColor || '—'}
																		</Typography>
																	</Stack>
																	<Typography
																		sx={{
																			fontSize: '0.68rem',
																			color: 'text.secondary',
																			mt: 0.35,
																			whiteSpace: 'nowrap',
																			overflow: 'hidden',
																			textOverflow: 'ellipsis',
																			maxWidth: { xs: '100%', sm: 320 },
																		}}
																		title={latestMeasuredLabel}
																	>
																		Last Test: {latestMeasuredLabel}
																	</Typography>
																</Stack>

																<Chip
																	size="small"
																	label={connectedLabel}
																	color={circuits.length ? 'success' : 'default'}
																	variant={circuits.length ? 'filled' : 'outlined'}
																	sx={{
																		maxWidth: 180,
																		'& .MuiChip-label': { textOverflow: 'ellipsis' },
																	}}
																/>
															</Stack>
														);
													})}
												</Stack>
											</Paper>
										</Grid>
									))}
								</Grid>
							</Stack>
						</Paper>
					)}

					<Box>
						<Typography sx={{ fontWeight: 800, mb: 1 }}>Side Segments</Typography>
						<RtmDataGrid
							rows={segmentRows}
							columns={segmentColumns}
							getRowId={(row) => row.id}
							autoHeight
							disableColumnFilter
							disableColumnSelector
							disableDensitySelector
						/>
					</Box>
				</Stack>
			)}

			{currentTab === 'joints' && (
				<Box>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						justifyContent="space-between"
						alignItems={{ xs: 'flex-start', sm: 'center' }}
						spacing={1}
						sx={{ mb: 1 }}
					>
						<Typography sx={{ fontWeight: 800 }}>Cable Joint Register</Typography>
						<Button
							variant="contained"
							startIcon={<Add sx={{ fontSize: 18 }} />}
							onClick={() => dispatch(openDrawer({ drawerName: ADD_CABLE_JOINT_DRAWER }))}
						>
							Add Joint
						</Button>
					</Stack>
					<RtmDataGrid
						rows={jointRows}
						columns={jointColumns}
						getRowId={(row) => row.id}
						autoHeight
						disableColumnFilter
						disableColumnSelector
						disableDensitySelector
					/>
				</Box>
			)}

			{currentTab === 'cuts' && (
				<Box>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						justifyContent="space-between"
						alignItems={{ xs: 'flex-start', sm: 'center' }}
						spacing={1}
						sx={{ mb: 1 }}
					>
						<Typography sx={{ fontWeight: 800 }}>Cable Cut Register</Typography>
						<Button
							variant="contained"
							startIcon={<Add sx={{ fontSize: 18 }} />}
							onClick={() => dispatch(openDrawer({ drawerName: ADD_CABLE_CUT_DRAWER }))}
						>
							Add Cable Cut
						</Button>
					</Stack>
					<RtmDataGrid
						rows={cutRows}
						columns={cutColumns}
						getRowId={(row) => row.id}
						autoHeight
						disableColumnFilter
						disableColumnSelector
						disableDensitySelector
					/>
				</Box>
			)}

			{currentTab === 'testings' && (
				<Stack spacing={2}>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						justifyContent="space-between"
						alignItems={{ xs: 'flex-start', sm: 'center' }}
						spacing={1}
					>
						<Typography sx={{ fontWeight: 800 }}>Cable Testing History</Typography>
						<Button
							variant="contained"
							startIcon={<Biotech sx={{ fontSize: 18 }} />}
							onClick={() => dispatch(openDrawer({ drawerName: ADD_CABLE_TEST_REPORT_DRAWER }))}
						>
							Add Test Report
						</Button>
					</Stack>

					<RtmDataGrid
						rows={testingRows}
						columns={testingColumns}
						getRowId={(row) => row.id}
						autoHeight
						disableColumnFilter
						disableColumnSelector
						disableDensitySelector
						onRowClick={(params) => setSelectedTestingId(params.row.id)}
					/>

					{selectedTesting && (
						<Box>
							<Stack
								direction={{ xs: 'column', sm: 'row' }}
								justifyContent="space-between"
								alignItems={{ xs: 'flex-start', sm: 'center' }}
								spacing={1}
								sx={{ mb: 1 }}
							>
								<Typography sx={{ fontWeight: 800 }}>
									Measured Values •{' '}
									{TEST_CAUSE_LABELS[selectedTesting.testCause] || selectedTesting.testCause}
								</Typography>
								<Chip
									size="small"
									label={`Measured on ${formatDateOnly(selectedTesting.measuredOn || selectedTesting.testDate)}`}
									variant="outlined"
								/>
							</Stack>
							<RtmDataGrid
								rows={selectedMeasuredRows}
								columns={testingMeasuredValueColumns}
								getRowId={(row) => row.id}
								autoHeight
								disableColumnFilter
								disableColumnSelector
								disableDensitySelector
							/>
						</Box>
					)}
				</Stack>
			)}

			<AddCableJointDrawer cable={cable} />
			<AddCableCutDrawer cable={cable} />
			<AddCableTestReportDrawer cable={cable} />
			<ConnectPairCircuitDrawer cable={cable} />
		</Box>
	);
}
