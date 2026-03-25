'use client';

import {
	Add,
	Assessment,
	Cable,
	Campaign,
	CheckCircleOutline,
	ContentCut,
	DeleteOutline,
	Description,
	DirectionsWalk,
	EditOutlined,
	Event,
	FactCheck,
	InfoOutlined,
	Map,
	Notes,
	Person,
	PhoneInTalk,
	QueryStats,
	Route,
	SettingsEthernet,
	TaskAlt,
	Troubleshoot,
	Videocam,
	WarningAmber,
	Wifi,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Chip,
	Drawer,
	IconButton,
	InputAdornment,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { BarChart, PieChart } from '@mui/x-charts';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { useTabs } from '@/hooks/common';
import {
	useCreateDailyReportInput,
	useDailyFeedCoverage,
	useDailyReportDashboard,
	useDailyReportInputs,
	useDailyReportRuns,
	useDeleteDailyReportInput,
	useExportDailyReport,
	useUpdateDailyReportInput,
} from '@/hooks/daily-report';
import { useStations } from '@/hooks/stations';
import { useSubsections } from '@/hooks/sub-sections';
import RtmDataGrid from '@/lib/common/datagrid';
import RtmTabs from '@/lib/common/tabs';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

const REPORT_TABS = [
	{
		label: 'Daily Telecom Position',
		step: 'daily-telecom-position',
		icon: <Assessment sx={{ fontSize: 18 }} />,
	},
	{ label: 'Cable Cut Reports', step: 'cable-cut', icon: <ContentCut sx={{ fontSize: 18 }} /> },
	{
		label: 'Cable Testing Reports',
		step: 'cable-testing',
		icon: <FactCheck sx={{ fontSize: 18 }} />,
	},
];

const SECTION_OPTIONS = [
	{ value: 'CORE_FAILURE', label: 'Core Failure' },
	{ value: 'BSNL_FCT', label: 'BSNL / FCT' },
	{ value: 'OFC_DEFICIENCY', label: 'OFC Deficiency' },
	{ value: 'QUAD6_DEFICIENCY', label: '6-Quad Deficiency' },
	{ value: 'EXPOSED_CABLE', label: 'Exposed Cable' },
	{ value: 'WIFI_STATUS', label: 'Wi-Fi Status' },
	{ value: 'CCTV_STATUS', label: 'CCTV Status' },
	{ value: 'WT_TESTING', label: 'Walkie-Talkie Testing' },
	{ value: 'MOVEMENT', label: 'JE/SSE Movement' },
	{ value: 'NOTE', label: 'Note' },
	{ value: 'OTHER', label: 'Other' },
];

const SOURCE_TYPE_OPTIONS = [
	{ value: 'FIELD_APP', label: 'Field App' },
	{ value: 'TELEPHONIC', label: 'Telephonic' },
	{ value: 'WHATSAPP', label: 'WhatsApp' },
	{ value: 'MANUAL', label: 'Manual' },
];

const SECTION_DYNAMIC_TEMPLATES = {
	CORE_FAILURE: {
		label: 'Core Failure',
		icon: Troubleshoot,
		fields: [
			{
				key: 'circuitName',
				label: 'Circuit / Gear',
				required: true,
				type: 'text',
				icon: SettingsEthernet,
			},
			{ key: 'stationSection', label: 'Station / Section', type: 'text', icon: Map },
			{
				key: 'failureStatus',
				label: 'Failure Status',
				type: 'select',
				required: true,
				icon: InfoOutlined,
				options: ['OPEN', 'ATTENDED', 'RESTORED', 'UNDER_OBSERVATION'],
			},
			{
				key: 'failureInTime',
				label: 'Failure In Time',
				type: 'datetime-local',
				required: true,
				icon: Event,
			},
			{ key: 'restorationTime', label: 'Restoration Time', type: 'datetime-local', icon: Event },
			{ key: 'informedTo', label: 'Informed To', type: 'text', icon: Campaign },
			{ key: 'responsibleDept', label: 'Responsible Department', type: 'text', icon: Person },
			{
				key: 'causeDetails',
				label: 'Cause of Failure',
				type: 'multiline',
				required: true,
				icon: WarningAmber,
				minRows: 2,
			},
			{ key: 'actionTaken', label: 'Action Taken', type: 'multiline', icon: TaskAlt, minRows: 2 },
		],
	},
	BSNL_FCT: {
		label: 'BSNL / FCT',
		icon: PhoneInTalk,
		fields: [
			{
				key: 'serviceName',
				label: 'Service Name',
				required: true,
				type: 'text',
				icon: PhoneInTalk,
			},
			{ key: 'locationName', label: 'Location', required: true, type: 'text', icon: Map },
			{
				key: 'lineMedia',
				label: 'Media Type',
				type: 'select',
				icon: Route,
				options: ['COPPER', 'FTTH', 'FCT', 'PRI', 'OTHER'],
			},
			{
				key: 'testResult',
				label: 'Test Result',
				required: true,
				type: 'select',
				icon: FactCheck,
				options: ['OK', 'NOT_WORKING', 'INTERMITTENT', 'DEGRADED'],
			},
			{ key: 'failureInTime', label: 'Failure In Time', type: 'datetime-local', icon: Event },
			{ key: 'restorationTime', label: 'Restoration Time', type: 'datetime-local', icon: Event },
			{ key: 'informedTo', label: 'Informed To', type: 'text', icon: Campaign },
			{ key: 'responsibleDept', label: 'Responsible Department', type: 'text', icon: Person },
			{
				key: 'actionTaken',
				label: 'Action Taken',
				type: 'multiline',
				icon: Description,
				minRows: 2,
			},
		],
	},
	WIFI_STATUS: {
		label: 'Wi-Fi Status',
		icon: Wifi,
		fields: [
			{
				key: 'stationLocation',
				label: 'Station / Location',
				required: true,
				type: 'text',
				icon: Map,
			},
			{ key: 'ssidOrNode', label: 'Wi-Fi Node / SSID', required: true, type: 'text', icon: Wifi },
			{
				key: 'testResult',
				label: 'Status',
				required: true,
				type: 'select',
				icon: FactCheck,
				options: ['OK', 'DOWN', 'INTERMITTENT', 'SLOW'],
			},
			{ key: 'usersImpacted', label: 'Users Impacted', type: 'number', icon: Person },
			{ key: 'failureInTime', label: 'Outage Since', type: 'datetime-local', icon: Event },
			{ key: 'restorationTime', label: 'Restored At', type: 'datetime-local', icon: Event },
			{ key: 'vendor', label: 'Vendor / Agency', type: 'text', icon: Route },
			{
				key: 'actionTaken',
				label: 'Action Taken',
				type: 'multiline',
				icon: Description,
				minRows: 2,
			},
		],
	},
	CCTV_STATUS: {
		label: 'CCTV Status',
		icon: Videocam,
		fields: [
			{
				key: 'stationLocation',
				label: 'Station / Location',
				required: true,
				type: 'text',
				icon: Map,
			},
			{ key: 'totalCameras', label: 'Total Cameras', type: 'number', icon: Videocam },
			{
				key: 'failedCameras',
				label: 'Failed Cameras',
				required: true,
				type: 'number',
				icon: WarningAmber,
			},
			{
				key: 'failureStatus',
				label: 'Status',
				required: true,
				type: 'select',
				icon: InfoOutlined,
				options: ['PARTIAL_FAILURE', 'DOWN', 'RESTORED'],
			},
			{ key: 'failureInTime', label: 'Failure In Time', type: 'datetime-local', icon: Event },
			{ key: 'restorationTime', label: 'Restoration Time', type: 'datetime-local', icon: Event },
			{ key: 'informedTo', label: 'Informed To', type: 'text', icon: Campaign },
			{
				key: 'actionTaken',
				label: 'Action Taken',
				type: 'multiline',
				icon: Description,
				minRows: 2,
			},
		],
	},
	OFC_DEFICIENCY: {
		label: 'OFC Deficiency',
		icon: Cable,
		fields: [
			{ key: 'sectionName', label: 'Section', required: true, type: 'text', icon: Route },
			{ key: 'routeKm', label: 'Route / KM', type: 'text', icon: Map },
			{
				key: 'issueType',
				label: 'Issue Type',
				required: true,
				type: 'select',
				icon: WarningAmber,
				options: ['CUT', 'HIGH_LOSS', 'LOW_INSULATION', 'DAMAGE', 'OTHER'],
			},
			{
				key: 'failureInTime',
				label: 'Failure In Time',
				required: true,
				type: 'datetime-local',
				icon: Event,
			},
			{ key: 'restorationTime', label: 'Restoration Time', type: 'datetime-local', icon: Event },
			{ key: 'responsibleDept', label: 'Responsible Department', type: 'text', icon: Person },
			{
				key: 'actionTaken',
				label: 'Action Taken',
				type: 'multiline',
				icon: Description,
				minRows: 2,
			},
		],
	},
	QUAD6_DEFICIENCY: {
		label: '6-Quad Deficiency',
		icon: Cable,
		fields: [
			{ key: 'sectionName', label: 'Section', required: true, type: 'text', icon: Route },
			{ key: 'routeKm', label: 'Route / KM', type: 'text', icon: Map },
			{
				key: 'issueType',
				label: 'Issue Type',
				required: true,
				type: 'select',
				icon: WarningAmber,
				options: ['CUT', 'HIGH_LOSS', 'LOW_INSULATION', 'DAMAGE', 'OTHER'],
			},
			{
				key: 'failureInTime',
				label: 'Failure In Time',
				required: true,
				type: 'datetime-local',
				icon: Event,
			},
			{ key: 'restorationTime', label: 'Restoration Time', type: 'datetime-local', icon: Event },
			{ key: 'responsibleDept', label: 'Responsible Department', type: 'text', icon: Person },
			{
				key: 'actionTaken',
				label: 'Action Taken',
				type: 'multiline',
				icon: Description,
				minRows: 2,
			},
		],
	},
	EXPOSED_CABLE: {
		label: 'Exposed Cable',
		icon: WarningAmber,
		fields: [
			{ key: 'locationName', label: 'Location', required: true, type: 'text', icon: Map },
			{ key: 'routeKm', label: 'KM / Route', type: 'text', icon: Route },
			{
				key: 'exposedLengthMeters',
				label: 'Exposed Length (m)',
				type: 'number',
				icon: SettingsEthernet,
			},
			{
				key: 'riskLevel',
				label: 'Risk Level',
				required: true,
				type: 'select',
				icon: WarningAmber,
				options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
			},
			{ key: 'targetDate', label: 'Target Date', type: 'date', icon: Event },
			{ key: 'complianceDate', label: 'Compliance Date', type: 'date', icon: Event },
			{
				key: 'actionTaken',
				label: 'Action Taken',
				type: 'multiline',
				icon: Description,
				minRows: 2,
			},
		],
	},
	WT_TESTING: {
		label: 'WT Testing',
		icon: SettingsEthernet,
		fields: [
			{ key: 'wtSetLocation', label: 'WT Set Location', required: true, type: 'text', icon: Map },
			{ key: 'totalSets', label: 'Total Sets', type: 'number', icon: SettingsEthernet },
			{ key: 'testedSets', label: 'Tested Sets', type: 'number', icon: FactCheck },
			{ key: 'failedSets', label: 'Failed Sets', type: 'number', icon: WarningAmber },
			{
				key: 'testStatus',
				label: 'Testing Status',
				required: true,
				type: 'select',
				icon: InfoOutlined,
				options: ['COMPLETED', 'PENDING', 'PARTIAL'],
			},
			{ key: 'targetDate', label: 'Target Date', type: 'date', icon: Event },
			{ key: 'complianceDate', label: 'Completion Date', type: 'date', icon: Event },
			{ key: 'actionTaken', label: 'Remarks', type: 'multiline', icon: Notes, minRows: 2 },
		],
	},
	MOVEMENT: {
		label: 'JE/SSE Movement',
		icon: DirectionsWalk,
		fields: [
			{ key: 'officerName', label: 'Officer Name', required: true, type: 'text', icon: Person },
			{ key: 'designation', label: 'Designation', type: 'text', icon: Person },
			{ key: 'movementArea', label: 'Visited Area', required: true, type: 'text', icon: Map },
			{ key: 'movementStart', label: 'Movement Start', type: 'datetime-local', icon: Event },
			{ key: 'movementEnd', label: 'Movement End', type: 'datetime-local', icon: Event },
			{
				key: 'observations',
				label: 'Observations',
				type: 'multiline',
				icon: Description,
				minRows: 2,
			},
		],
	},
	NOTE: {
		label: 'Note',
		icon: Notes,
		fields: [
			{ key: 'summary', label: 'Summary', required: true, type: 'text', icon: Notes },
			{
				key: 'actionTaken',
				label: 'Details',
				required: true,
				type: 'multiline',
				icon: Description,
				minRows: 3,
			},
		],
	},
	OTHER: {
		label: 'Other',
		icon: Description,
		fields: [
			{ key: 'summary', label: 'Summary', required: true, type: 'text', icon: Description },
			{
				key: 'actionTaken',
				label: 'Details',
				required: true,
				type: 'multiline',
				icon: Description,
				minRows: 3,
			},
		],
	},
};

const FALLBACK_ROLES = ['SUPER_ADMIN', 'ADMIN', 'TESTROOM'];
const SECTIONAL_DELETE_ROLES = [
	'JE_SSE_TELE_SECTIONAL',
	'JE_SECTIONAL',
	'SSE_SECTIONAL',
	'FIELD_ENGINEER',
];

const formatEnumLabel = (value) =>
	value
		? value
				.toString()
				.replace(/_/g, ' ')
				.toLowerCase()
				.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
		: 'N/A';

const formatDateTime = (value) => {
	if (!value) return '-';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '-';
	return date.toLocaleString('en-IN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

const toLocalDateTimeValue = (value) => {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const pad = (num) => String(num).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toIsoDateTime = (value) => {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString();
};

const toIsoDate = (value) => {
	if (!value) return null;
	const date = new Date(`${value}T00:00:00`);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString();
};

const getDynamicTemplate = (sectionType) =>
	SECTION_DYNAMIC_TEMPLATES[sectionType] || SECTION_DYNAMIC_TEMPLATES.OTHER;

const getDynamicDefaults = (sectionType, existingValues = {}) => {
	const template = getDynamicTemplate(sectionType);
	const defaults = {};
	for (const field of template.fields) {
		defaults[field.key] = existingValues[field.key] ?? '';
	}
	return defaults;
};

const getDynamicValuesFromEntry = (entry = {}) => {
	const sectionType = entry.sectionType || 'CORE_FAILURE';
	const seeded = { ...(entry.dynamicFields || {}) };
	if (!seeded.failureInTime && entry.failureInTime) {
		seeded.failureInTime = toLocalDateTimeValue(entry.failureInTime);
	}
	if (!seeded.restorationTime && entry.restorationTime) {
		seeded.restorationTime = toLocalDateTimeValue(entry.restorationTime);
	}
	if (!seeded.targetDate && entry.targetDate) {
		seeded.targetDate = new Date(entry.targetDate).toISOString().slice(0, 10);
	}
	if (!seeded.complianceDate && entry.complianceDate) {
		seeded.complianceDate = new Date(entry.complianceDate).toISOString().slice(0, 10);
	}
	if (!seeded.informedTo && entry.informedTo) {
		seeded.informedTo = entry.informedTo;
	}
	if (!seeded.responsibleDept && entry.responsibleDept) {
		seeded.responsibleDept = entry.responsibleDept;
	}

	const template = getDynamicTemplate(sectionType);
	if (entry.entryStatus) {
		const statusField = template.fields.find((field) =>
			['failureStatus', 'testResult', 'testStatus'].includes(field.key)
		);
		if (statusField && !seeded[statusField.key]) {
			seeded[statusField.key] = entry.entryStatus;
		}
	}
	return getDynamicDefaults(sectionType, seeded);
};

const dynamicValueToString = (value, field) => {
	if (value === null || value === undefined || value === '') return '';
	if (field.type === 'date') {
		const dateValue = typeof value === 'string' ? value : new Date(value).toISOString();
		return dateValue.includes('T') ? dateValue.slice(0, 10) : dateValue;
	}
	if (field.type === 'datetime-local') {
		return toLocalDateTimeValue(value);
	}
	return String(value);
};

const toDisplayLabel = (value) =>
	String(value || '')
		.replace(/_/g, ' ')
		.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

const buildSummaryFromDynamicFields = (sectionType, dynamicValues = {}, remarks = '') => {
	const template = getDynamicTemplate(sectionType);
	const filled = template.fields
		.map((field) => {
			const rawValue = dynamicValues[field.key];
			if (rawValue === null || rawValue === undefined || rawValue === '') return null;
			const value =
				field.type === 'select'
					? toDisplayLabel(rawValue)
					: typeof rawValue === 'string'
						? rawValue.trim()
						: String(rawValue);
			if (!value) return null;
			return { label: field.label, value };
		})
		.filter(Boolean);

	const title =
		filled.find((item) => item.label.toLowerCase().includes('circuit'))?.value ||
		filled.find((item) => item.label.toLowerCase().includes('service'))?.value ||
		filled.find((item) => item.label.toLowerCase().includes('ssid'))?.value ||
		filled.find((item) => item.label.toLowerCase().includes('location'))?.value ||
		`${template.label} update`;

	const details = [...filled.map((item) => `${item.label}: ${item.value}`)];
	if (remarks?.trim()) {
		details.push(`Remarks: ${remarks.trim()}`);
	}
	return {
		entryTitle: title.slice(0, 120),
		entryDetails: details.join('\n') || `${template.label} update`,
	};
};

const defaultFeedForm = (reportDate, currentUserId) => ({
	reportDate,
	sectionType: 'CORE_FAILURE',
	stationId: '',
	subsectionId: '',
	remarks: '',
	dynamicFields: getDynamicDefaults('CORE_FAILURE'),
	inputForUserId: currentUserId || '',
	isFallbackEntry: false,
	sourceType: 'FIELD_APP',
	sourceContactName: '',
	sourceContactDesignation: '',
	sourceContactChannel: '',
});

const getStatusColor = (theme, status) => {
	switch (status) {
		case 'OPEN':
			return theme.palette.warning.main;
		case 'IN_PROGRESS':
			return theme.palette.info.main;
		case 'RESOLVED':
			return theme.palette.success.main;
		case 'CLOSED':
			return theme.palette.text.secondary;
		default:
			return theme.palette.text.secondary;
	}
};

const getPriorityColor = (theme, priority) => {
	switch (priority) {
		case 'CRITICAL':
			return theme.palette.error.main;
		case 'HIGH':
			return theme.palette.warning.main;
		case 'MEDIUM':
			return theme.palette.info.main;
		case 'LOW':
			return theme.palette.success.main;
		default:
			return theme.palette.text.secondary;
	}
};

const StatCard = ({ title, value, icon, tone, subtitle }) => (
	<Paper
		variant="outlined"
		sx={(theme) => ({
			p: 1.75,
			borderRadius: 3,
			borderColor: alpha(theme.palette[tone]?.main || theme.palette.primary.main, 0.35),
			bgcolor: alpha(theme.palette[tone]?.main || theme.palette.primary.main, 0.05),
			minHeight: 110,
		})}
	>
		<Stack direction="row" spacing={1.2} alignItems="center">
			<Box
				sx={(theme) => ({
					width: 34,
					height: 34,
					borderRadius: '10px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: alpha(theme.palette[tone]?.main || theme.palette.primary.main, 0.18),
					color: theme.palette[tone]?.main || theme.palette.primary.main,
				})}
			>
				{icon}
			</Box>
			<Box sx={{ minWidth: 0 }}>
				<Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: 'text.secondary' }}>
					{title}
				</Typography>
				<Typography
					sx={{ fontSize: '1.5rem', fontWeight: 900, color: 'text.primary', lineHeight: 1.1 }}
				>
					{value}
				</Typography>
				<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>
					{subtitle}
				</Typography>
			</Box>
		</Stack>
	</Paper>
);

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: page composition already split into memoized sections; keeping this module single-file for reports workflow continuity.
export default function ReportsPage() {
	const theme = useTheme();
	const { data: session } = useSession();
	const userRole = session?.user?.role || '';
	const originalRole = session?.user?.originalRole || '';
	const canFallback = FALLBACK_ROLES.includes(userRole);
	const canSectionalDelete =
		SECTIONAL_DELETE_ROLES.includes(userRole) || SECTIONAL_DELETE_ROLES.includes(originalRole);
	const currentUserId = session?.user?.id || '';
	const { currentTab } = useTabs('reportsHub', { currentTab: 'daily-telecom-position' });

	const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [feedDrawerOpen, setFeedDrawerOpen] = useState(false);
	const [editingInput, setEditingInput] = useState(null);
	const [feedForm, setFeedForm] = useState(() => defaultFeedForm(reportDate, currentUserId));

	const { data: stationNodes = [] } = useStations();
	const { data: subSections = [] } = useSubsections();
	const { data: dashboard, isLoading: loadingDashboard } = useDailyReportDashboard({
		date: reportDate,
	});
	const { data: inputRows = [], isLoading: loadingInputs } = useDailyReportInputs({
		date: reportDate,
	});
	const { data: feedCoverage = [], isLoading: loadingCoverage } = useDailyFeedCoverage(
		{ date: reportDate },
		canFallback
	);
	const { data: runHistory = [], isLoading: loadingRuns } = useDailyReportRuns(
		{ date: reportDate },
		canFallback
	);

	const createInputMutation = useCreateDailyReportInput();
	const updateInputMutation = useUpdateDailyReportInput();
	const deleteInputMutation = useDeleteDailyReportInput();
	const exportMutation = useExportDailyReport();

	const stations = useMemo(
		() =>
			stationNodes.map((station) => ({
				id: station.id,
				name: station.data?.label || station.name || 'Unknown',
			})),
		[stationNodes]
	);

	const subsectionOptions = useMemo(
		() =>
			subSections.map((sub) => ({
				id: sub.id,
				name: `${sub.code ? `${sub.code} · ` : ''}${sub.name}`,
			})),
		[subSections]
	);

	const feedUsers = useMemo(() => {
		if (!canFallback) return [];
		return feedCoverage.map((row) => ({
			id: row.userId,
			label: `${row.name}${row.designation ? ` · ${row.designation}` : ''}`,
		}));
	}, [feedCoverage, canFallback]);

	const summary = dashboard?.summary || {};
	const statusChartData = dashboard?.charts?.status || [];
	const typeChartData = dashboard?.charts?.type || [];
	const stationChartData = dashboard?.charts?.station?.slice(0, 8) || [];
	const monthChartData = dashboard?.charts?.month || [];
	const failureRows = dashboard?.failureRows || [];
	const inputSectionCounts = dashboard?.inputSectionCounts || [];

	const statusPieData = useMemo(
		() =>
			statusChartData
				.filter((item) => item.value > 0)
				.map((item, index) => ({
					id: item.key,
					value: item.value,
					label: item.label,
					color:
						index % 4 === 0
							? theme.palette.warning.main
							: index % 4 === 1
								? theme.palette.info.main
								: index % 4 === 2
									? theme.palette.success.main
									: theme.palette.text.secondary,
				})),
		[statusChartData, theme]
	);

	const typePieData = useMemo(
		() =>
			typeChartData.slice(0, 12).map((item, index) => ({
				id: item.key,
				value: item.value,
				label: item.label,
				color:
					index % 6 === 0
						? theme.palette.primary.main
						: index % 6 === 1
							? theme.palette.info.main
							: index % 6 === 2
								? theme.palette.success.main
								: index % 6 === 3
									? theme.palette.warning.main
									: index % 6 === 4
										? theme.palette.error.main
										: theme.palette.secondary.main,
			})),
		[typeChartData, theme]
	);

	const failureColumns = useMemo(
		() => [
			{
				field: 'title',
				headerName: 'FAILURE SUMMARY',
				flex: 1.4,
				renderCell: (params) => (
					<Box>
						<Typography sx={{ fontWeight: 800, fontSize: '0.84rem' }}>
							{params.row.title || 'Untitled Failure'}
						</Typography>
						<Typography sx={{ fontSize: '0.69rem', fontWeight: 700, color: 'text.secondary' }}>
							ID: {params.row.id.slice(0, 8).toUpperCase()}
						</Typography>
					</Box>
				),
			},
			{
				field: 'station',
				headerName: 'STATION',
				flex: 0.8,
				valueGetter: (_, row) => row.station,
			},
			{
				field: 'type',
				headerName: 'TYPE',
				flex: 0.8,
				renderCell: (params) => (
					<Chip
						size="small"
						label={formatEnumLabel(params.value)}
						sx={{
							fontWeight: 700,
							bgcolor: alpha(theme.palette.warning.main, 0.16),
							color: theme.palette.warning.main,
						}}
					/>
				),
			},
			{
				field: 'cause',
				headerName: 'CAUSE',
				flex: 1,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.76rem', fontWeight: 700 }}>
						{formatEnumLabel(params.value)}
					</Typography>
				),
			},
			{
				field: 'status',
				headerName: 'STATUS',
				flex: 0.72,
				renderCell: (params) => {
					const color = getStatusColor(theme, params.value);
					return (
						<Chip
							size="small"
							label={formatEnumLabel(params.value)}
							sx={{
								fontWeight: 700,
								bgcolor: alpha(color, 0.16),
								color,
							}}
						/>
					);
				},
			},
			{
				field: 'priority',
				headerName: 'PRIORITY',
				flex: 0.72,
				renderCell: (params) => {
					const color = getPriorityColor(theme, params.value);
					return (
						<Chip
							size="small"
							label={formatEnumLabel(params.value)}
							sx={{
								fontWeight: 700,
								bgcolor: alpha(color, 0.16),
								color,
							}}
						/>
					);
				},
			},
			{
				field: 'reportedAt',
				headerName: 'REPORTED',
				flex: 0.95,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
						{formatDateTime(params.value)}
					</Typography>
				),
			},
			{
				field: 'restoredAt',
				headerName: 'RESTORED',
				flex: 0.95,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
						{formatDateTime(params.value)}
					</Typography>
				),
			},
			{
				field: 'assignee',
				headerName: 'ASSIGNED TO',
				flex: 0.9,
				valueGetter: (_, row) => row.assignee || 'Unassigned',
			},
		],
		[theme]
	);

	const inputColumns = useMemo(
		() => [
			{
				field: 'sectionType',
				headerName: 'SECTION',
				flex: 0.9,
				renderCell: (params) => (
					<Chip
						size="small"
						label={formatEnumLabel(params.value)}
						sx={{
							bgcolor: alpha(theme.palette.primary.main, 0.16),
							color: theme.palette.primary.main,
							fontWeight: 700,
						}}
					/>
				),
			},
			{ field: 'entryTitle', headerName: 'TITLE', flex: 1.1 },
			{
				field: 'scope',
				headerName: 'SCOPE',
				flex: 1.1,
				valueGetter: (_, row) =>
					row.station?.name || row.subsection?.name || row.inputForUser?.name || 'General',
			},
			{
				field: 'entryStatus',
				headerName: 'STATUS',
				flex: 0.7,
				valueGetter: (_, row) => row.entryStatus || '-',
			},
			{
				field: 'submittedBy',
				headerName: 'SUBMITTED BY',
				flex: 0.95,
				valueGetter: (_, row) => row.submittedBy?.name || '-',
			},
			{
				field: 'sourceType',
				headerName: 'SOURCE',
				flex: 0.7,
				renderCell: (params) => (
					<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
						{formatEnumLabel(params.value)}
					</Typography>
				),
			},
			{
				field: 'actions',
				headerName: 'ACTIONS',
				flex: 0.65,
				sortable: false,
				filterable: false,
				renderCell: (params) => {
					const canEditRow = canFallback || params.row.submittedById === currentUserId;
					const canDeleteRow = canSectionalDelete;
					return (
						<Stack direction="row" spacing={0.5}>
							<IconButton
								size="small"
								onClick={() => {
									if (!canEditRow) return;
									setEditingInput(params.row);
									setFeedForm({
										reportDate: params.row.reportDate
											? new Date(params.row.reportDate).toISOString().slice(0, 10)
											: reportDate,
										sectionType: params.row.sectionType || 'CORE_FAILURE',
										stationId: params.row.stationId || '',
										subsectionId: params.row.subsectionId || '',
										remarks: '',
										dynamicFields: getDynamicValuesFromEntry(params.row),
										inputForUserId: params.row.inputForUserId || '',
										isFallbackEntry: Boolean(params.row.isFallbackEntry),
										sourceType: params.row.sourceType || 'FIELD_APP',
										sourceContactName: params.row.sourceContactName || '',
										sourceContactDesignation: params.row.sourceContactDesignation || '',
										sourceContactChannel: params.row.sourceContactChannel || '',
									});
									setFeedDrawerOpen(true);
								}}
								sx={{ color: 'primary.main' }}
								disabled={!canEditRow}
							>
								<EditOutlined sx={{ fontSize: 18 }} />
							</IconButton>
							<IconButton
								size="small"
								onClick={() => deleteInputMutation.mutate(params.row.id)}
								sx={{ color: 'error.main' }}
								disabled={deleteInputMutation.isPending || !canDeleteRow}
							>
								<DeleteOutline sx={{ fontSize: 18 }} />
							</IconButton>
						</Stack>
					);
				},
			},
		],
		[
			theme,
			deleteInputMutation.isPending,
			reportDate,
			deleteInputMutation,
			canFallback,
			canSectionalDelete,
			currentUserId,
		]
	);

	const coverageColumns = useMemo(
		() => [
			{ field: 'name', headerName: 'ENGINEER', flex: 1 },
			{ field: 'designation', headerName: 'DESIGNATION', flex: 1 },
			{ field: 'entryCount', headerName: 'ENTRIES', flex: 0.55 },
			{
				field: 'status',
				headerName: 'STATUS',
				flex: 0.6,
				renderCell: (params) => (
					<Chip
						size="small"
						label={params.value}
						sx={{
							bgcolor:
								params.value === 'SUBMITTED'
									? alpha(theme.palette.success.main, 0.16)
									: alpha(theme.palette.error.main, 0.16),
							color:
								params.value === 'SUBMITTED'
									? theme.palette.success.main
									: theme.palette.error.main,
							fontWeight: 700,
						}}
					/>
				),
			},
		],
		[theme]
	);

	const runColumns = useMemo(
		() => [
			{
				field: 'createdAt',
				headerName: 'GENERATED AT',
				flex: 1,
				renderCell: (params) => formatDateTime(params.value),
			},
			{
				field: 'format',
				headerName: 'FORMAT',
				flex: 0.6,
				renderCell: (params) => (
					<Chip
						size="small"
						label={formatEnumLabel(params.value)}
						sx={{
							bgcolor: alpha(theme.palette.info.main, 0.16),
							color: theme.palette.info.main,
							fontWeight: 700,
						}}
					/>
				),
			},
			{ field: 'failureCount', headerName: 'FAILURES', flex: 0.5 },
			{ field: 'entryCount', headerName: 'FEED ENTRIES', flex: 0.6 },
			{
				field: 'generatedBy',
				headerName: 'BY',
				flex: 0.9,
				valueGetter: (_, row) => row.generatedBy?.name || '-',
			},
		],
		[theme]
	);

	const saveFeedEntry = async () => {
		const summary = buildSummaryFromDynamicFields(
			feedForm.sectionType,
			feedForm.dynamicFields,
			feedForm.remarks
		);

		const dynamicFailureInTime = feedForm.dynamicFields?.failureInTime || '';
		const dynamicRestorationTime = feedForm.dynamicFields?.restorationTime || '';
		const dynamicTargetDate = feedForm.dynamicFields?.targetDate || '';
		const dynamicComplianceDate = feedForm.dynamicFields?.complianceDate || '';
		const dynamicInformedTo = feedForm.dynamicFields?.informedTo || '';
		const dynamicResponsibleDept = feedForm.dynamicFields?.responsibleDept || '';
		const dynamicStatus =
			feedForm.dynamicFields?.failureStatus ||
			feedForm.dynamicFields?.testResult ||
			feedForm.dynamicFields?.testStatus ||
			'';

		const payload = {
			reportDate: feedForm.reportDate || reportDate,
			sectionType: feedForm.sectionType,
			stationId: feedForm.stationId || null,
			subsectionId: feedForm.subsectionId || null,
			entryTitle: summary.entryTitle,
			entryDetails: summary.entryDetails,
			entryStatus: dynamicStatus || null,
			failureInTime: dynamicFailureInTime ? toIsoDateTime(dynamicFailureInTime) : null,
			restorationTime: dynamicRestorationTime ? toIsoDateTime(dynamicRestorationTime) : null,
			targetDate: dynamicTargetDate ? toIsoDate(dynamicTargetDate) : null,
			complianceDate: dynamicComplianceDate ? toIsoDate(dynamicComplianceDate) : null,
			informedTo: dynamicInformedTo || null,
			responsibleDept: dynamicResponsibleDept || null,
			dynamicFields: feedForm.dynamicFields || null,
			inputForUserId: canFallback ? feedForm.inputForUserId || null : null,
			isFallbackEntry: canFallback ? Boolean(feedForm.isFallbackEntry) : false,
			sourceType: feedForm.sourceType || 'FIELD_APP',
			sourceContactName: feedForm.sourceContactName || null,
			sourceContactDesignation: feedForm.sourceContactDesignation || null,
			sourceContactChannel: feedForm.sourceContactChannel || null,
		};

		if (editingInput?.id) {
			await updateInputMutation.mutateAsync({ id: editingInput.id, payload });
		} else {
			await createInputMutation.mutateAsync(payload);
		}
		setFeedDrawerOpen(false);
		setEditingInput(null);
		setFeedForm(defaultFeedForm(reportDate, currentUserId));
	};

	const isSavingFeed = createInputMutation.isPending || updateInputMutation.isPending;
	const requiresSourceContact =
		Boolean(feedForm.isFallbackEntry) ||
		(feedForm.sourceType && feedForm.sourceType !== 'FIELD_APP');
	const activeDynamicTemplate = getDynamicTemplate(feedForm.sectionType);
	const missingDynamicFields = activeDynamicTemplate.fields.filter((field) => {
		if (!field.required) return false;
		const value = feedForm.dynamicFields?.[field.key];
		if (value === null || value === undefined) return true;
		if (typeof value === 'string') return !value.trim();
		return false;
	});
	const canSaveFeed =
		!isSavingFeed && Boolean(feedForm.sectionType) && missingDynamicFields.length === 0;

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				bgcolor: 'background.default',
			}}
		>
			<Box sx={{ px: 3, pt: 3, pb: 2, bgcolor: 'background.paper' }}>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, display: 'flex' }}>
						<Assessment sx={{ color: 'text.secondary' }} />
					</Box>
					<Box>
						<Typography
							variant="h5"
							sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}
						>
							Reports Center
						</Typography>
						<Typography
							variant="caption"
							sx={{
								color: 'text.secondary',
								fontWeight: 700,
								textTransform: 'uppercase',
								letterSpacing: '1px',
							}}
						>
							Daily telecom analytics + field feed + one-click exports
						</Typography>
					</Box>
				</Stack>
			</Box>

			<Box sx={{ px: 3, bgcolor: 'background.paper' }}>
				<RtmTabs
					tabs={REPORT_TABS}
					tabsName="reportsHub"
					initialState={{ currentTab: 'daily-telecom-position' }}
				/>
			</Box>

			<Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
				{currentTab === 'daily-telecom-position' && (
					<Stack spacing={2.25}>
						<Stack
							direction={{ xs: 'column', md: 'row' }}
							spacing={1.2}
							justifyContent="space-between"
							alignItems={{ xs: 'flex-start', md: 'center' }}
						>
							<Stack direction="row" spacing={1} alignItems="center">
								<Typography variant="h5" sx={{ fontWeight: 900 }}>
									Daily Telecom Position
								</Typography>
								<Chip
									size="small"
									label={`${failureRows.length} active items`}
									sx={{
										bgcolor: alpha(theme.palette.primary.main, 0.18),
										color: 'primary.main',
										fontWeight: 800,
									}}
								/>
							</Stack>

							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
								<TextField
									label="Report Date"
									type="date"
									value={reportDate}
									onChange={(event) => {
										const value = event.target.value;
										setReportDate(value);
										setFeedForm((prev) => ({ ...prev, reportDate: value }));
									}}
									onFocus={openNativeDateTimePicker}
									onClick={openNativeDateTimePicker}
									InputLabelProps={{ shrink: true }}
									size="small"
									sx={{ minWidth: 165 }}
								/>
								<Button
									variant="outlined"
									onClick={() => {
										const today = new Date().toISOString().slice(0, 10);
										setReportDate(today);
										setFeedForm((prev) => ({ ...prev, reportDate: today }));
									}}
									sx={{ textTransform: 'none', fontWeight: 800 }}
								>
									Today
								</Button>
								<Button
									variant="outlined"
									startIcon={<Description sx={{ fontSize: 18 }} />}
									onClick={() => exportMutation.mutate({ date: reportDate, format: 'excel' })}
									disabled={exportMutation.isPending}
									sx={{ textTransform: 'none', fontWeight: 800 }}
								>
									Export Excel
								</Button>
								<Button
									variant="outlined"
									startIcon={<QueryStats sx={{ fontSize: 18 }} />}
									onClick={() => exportMutation.mutate({ date: reportDate, format: 'graphical' })}
									disabled={exportMutation.isPending}
									sx={{ textTransform: 'none', fontWeight: 800 }}
								>
									Export Graphical
								</Button>
								<Button
									variant="contained"
									startIcon={<Add sx={{ fontSize: 18 }} />}
									onClick={() => {
										setEditingInput(null);
										setFeedForm(defaultFeedForm(reportDate, currentUserId));
										setFeedDrawerOpen(true);
									}}
									sx={{ textTransform: 'none', fontWeight: 800 }}
								>
									Add Field Feed
								</Button>
							</Stack>
						</Stack>

						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(6, 1fr)' },
								gap: 1.5,
							}}
						>
							<StatCard
								title="Total Failures"
								value={summary.totalFailures || 0}
								subtitle="In selected date"
								icon={<Troubleshoot sx={{ fontSize: 18 }} />}
								tone="primary"
							/>
							<StatCard
								title="Open At End"
								value={summary.openAsOfEnd || 0}
								subtitle="Still pending"
								icon={<InfoOutlined sx={{ fontSize: 18 }} />}
								tone="warning"
							/>
							<StatCard
								title="Reported"
								value={summary.reportedInRange || 0}
								subtitle="New for date"
								icon={<Campaign sx={{ fontSize: 18 }} />}
								tone="info"
							/>
							<StatCard
								title="Restored"
								value={summary.restoredInRange || 0}
								subtitle="Closed in date"
								icon={<TaskAlt sx={{ fontSize: 18 }} />}
								tone="success"
							/>
							<StatCard
								title="HQ / ICMS"
								value={`${summary.hqRepeated || 0}/${summary.icmsRepeated || 0}`}
								subtitle="Repeated flags"
								icon={<SettingsEthernet sx={{ fontSize: 18 }} />}
								tone="error"
							/>
							<StatCard
								title="Avg Restoration"
								value={
									Number.isFinite(summary.avgRestorationMinutes)
										? `${Math.floor(summary.avgRestorationMinutes / 60)}h ${Math.round(summary.avgRestorationMinutes % 60)}m`
										: 'N/A'
								}
								subtitle="Mean restoration"
								icon={<CheckCircleOutline sx={{ fontSize: 18 }} />}
								tone="secondary"
							/>
						</Box>

						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
								gap: 1.5,
							}}
						>
							<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
								<Typography sx={{ fontWeight: 800, mb: 1 }}>Status Distribution</Typography>
								{statusPieData.length ? (
									<PieChart
										height={220}
										hideLegend
										series={[
											{
												data: statusPieData,
												innerRadius: 56,
												paddingAngle: 2,
												cornerRadius: 4,
											},
										]}
									/>
								) : (
									<Typography sx={{ color: 'text.secondary' }}>
										No status data for this date.
									</Typography>
								)}
							</Paper>

							<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
								<Typography sx={{ fontWeight: 800, mb: 1 }}>Failure Type Mix</Typography>
								{typePieData.length ? (
									<PieChart
										height={220}
										hideLegend
										series={[
											{
												data: typePieData,
												innerRadius: 56,
												paddingAngle: 2,
												cornerRadius: 4,
											},
										]}
									/>
								) : (
									<Typography sx={{ color: 'text.secondary' }}>
										No type data for this date.
									</Typography>
								)}
							</Paper>

							<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
								<Typography sx={{ fontWeight: 800, mb: 1 }}>Station-wise Failures</Typography>
								{stationChartData.length ? (
									<BarChart
										height={220}
										xAxis={[
											{
												scaleType: 'band',
												data: stationChartData.map((item) => item.label),
											},
										]}
										series={[
											{
												label: 'Failures',
												data: stationChartData.map((item) => item.value),
												color: theme.palette.primary.main,
											},
										]}
										margin={{ left: 48, right: 10, top: 10, bottom: 40 }}
									/>
								) : (
									<Typography sx={{ color: 'text.secondary' }}>
										No station data for this date.
									</Typography>
								)}
							</Paper>
						</Box>

						{monthChartData.length > 0 && (
							<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
								<Typography sx={{ fontWeight: 800, mb: 1 }}>Month Trend</Typography>
								<BarChart
									height={260}
									xAxis={[{ scaleType: 'band', data: monthChartData.map((item) => item.label) }]}
									series={[
										{
											label: 'Total Failures',
											data: monthChartData.map((item) => item.total),
											color: theme.palette.primary.main,
										},
										{
											label: 'HQ Repeated',
											data: monthChartData.map((item) => item.hqRepeated),
											color: theme.palette.error.main,
										},
										{
											label: 'ICMS Repeated',
											data: monthChartData.map((item) => item.icmsRepeated),
											color: theme.palette.secondary.main,
										},
									]}
									margin={{ left: 48, right: 10, top: 16, bottom: 36 }}
								/>
							</Paper>
						)}

						<RtmDataGrid
							rows={failureRows}
							columns={failureColumns}
							loading={loadingDashboard}
							pagination
							pageSizeOptions={[10, 25, 50]}
							initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
						/>

						<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
							<Stack
								direction={{ xs: 'column', md: 'row' }}
								spacing={1}
								alignItems={{ xs: 'flex-start', md: 'center' }}
								justifyContent="space-between"
							>
								<Typography sx={{ fontWeight: 900, fontSize: '1.02rem' }}>
									Carry-Forward Feed Entries
								</Typography>
								<Stack direction="row" spacing={0.8} alignItems="center">
									<Chip
										size="small"
										icon={<Route sx={{ fontSize: 14 }} />}
										label={`${inputRows.length} entries`}
										sx={{
											bgcolor: alpha(theme.palette.primary.main, 0.16),
											color: 'primary.main',
											fontWeight: 800,
										}}
									/>
									{inputSectionCounts.slice(0, 3).map((item) => (
										<Chip
											key={item.key}
											size="small"
											label={`${item.label}: ${item.value}`}
											sx={{ fontWeight: 700 }}
										/>
									))}
								</Stack>
							</Stack>

							<Box sx={{ mt: 1.5 }}>
								<Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', mb: 0.8 }}>
									Entries continue on next dates until sectional JE/SSE removes them.
								</Typography>
								<RtmDataGrid
									rows={inputRows}
									columns={inputColumns}
									loading={loadingInputs}
									pagination
									pageSizeOptions={[10, 25, 50]}
									initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
								/>
							</Box>
						</Paper>

						{canFallback && (
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' },
									gap: 1.5,
								}}
							>
								<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
									<Typography sx={{ fontWeight: 900, mb: 1 }}>Field Feed Coverage</Typography>
									<RtmDataGrid
										rows={feedCoverage.map((row) => ({ id: row.userId, ...row }))}
										columns={coverageColumns}
										loading={loadingCoverage}
										pagination
										pageSizeOptions={[10, 25]}
										initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
									/>
								</Paper>

								<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
									<Typography sx={{ fontWeight: 900, mb: 1 }}>Report Generation History</Typography>
									<RtmDataGrid
										rows={runHistory.map((row) => ({ id: row.id, ...row }))}
										columns={runColumns}
										loading={loadingRuns}
										pagination
										pageSizeOptions={[10, 25]}
										initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
									/>
								</Paper>
							</Box>
						)}
					</Stack>
				)}

				{currentTab === 'cable-cut' && (
					<Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
						<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
							Cable Cut Reports
						</Typography>
						<Typography sx={{ color: 'text.secondary', mt: 1 }}>
							This tab will be upgraded next with daily cable cut analysis and export format.
						</Typography>
					</Paper>
				)}

				{currentTab === 'cable-testing' && (
					<Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
						<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
							Cable Testing Reports
						</Typography>
						<Typography sx={{ color: 'text.secondary', mt: 1 }}>
							This tab will be upgraded next with scheduled test trend and compliance export.
						</Typography>
					</Paper>
				)}
			</Box>

			<Drawer
				anchor="right"
				open={feedDrawerOpen}
				onClose={() => {
					setFeedDrawerOpen(false);
					setEditingInput(null);
				}}
				PaperProps={{
					sx: {
						width: { xs: '100%', sm: 580 },
						p: 2.5,
						bgcolor: 'background.paper',
					},
				}}
			>
				<Stack spacing={2}>
					<Stack direction="row" alignItems="center" justifyContent="space-between">
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 900 }}>
								{editingInput ? 'Edit Field Feed Entry' : 'Add Field Feed Entry'}
							</Typography>
							<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 600 }}>
								Captured for telecom position and carried forward until removed by sectional JE/SSE.
							</Typography>
						</Box>
					</Stack>

					<TextField
						label="Report Date"
						type="date"
						value={feedForm.reportDate}
						onChange={(event) =>
							setFeedForm((prev) => ({
								...prev,
								reportDate: event.target.value,
							}))
						}
						onFocus={openNativeDateTimePicker}
						onClick={openNativeDateTimePicker}
						InputLabelProps={{ shrink: true }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Event sx={{ color: 'text.secondary', fontSize: 18 }} />
								</InputAdornment>
							),
						}}
						size="small"
						fullWidth
					/>

					<TextField
						select
						label="Section Type"
						value={feedForm.sectionType}
						onChange={(event) => {
							const nextSection = event.target.value;
							setFeedForm((prev) => ({
								...prev,
								sectionType: nextSection,
								dynamicFields: getDynamicDefaults(nextSection),
							}));
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Assessment sx={{ color: 'text.secondary', fontSize: 18 }} />
								</InputAdornment>
							),
						}}
						size="small"
						fullWidth
					>
						{SECTION_OPTIONS.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</TextField>

					<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
						<TextField
							select
							label="Station (Optional)"
							value={feedForm.stationId}
							onChange={(event) =>
								setFeedForm((prev) => ({
									...prev,
									stationId: event.target.value,
								}))
							}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Map sx={{ color: 'text.secondary', fontSize: 18 }} />
									</InputAdornment>
								),
							}}
							size="small"
							fullWidth
						>
							<MenuItem value="">None</MenuItem>
							{stations.map((station) => (
								<MenuItem key={station.id} value={station.id}>
									{station.name}
								</MenuItem>
							))}
						</TextField>

						<TextField
							select
							label="Subsection (Optional)"
							value={feedForm.subsectionId}
							onChange={(event) =>
								setFeedForm((prev) => ({
									...prev,
									subsectionId: event.target.value,
								}))
							}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SettingsEthernet sx={{ color: 'text.secondary', fontSize: 18 }} />
									</InputAdornment>
								),
							}}
							size="small"
							fullWidth
						>
							<MenuItem value="">None</MenuItem>
							{subsectionOptions.map((subsection) => (
								<MenuItem key={subsection.id} value={subsection.id}>
									{subsection.name}
								</MenuItem>
							))}
						</TextField>
					</Stack>

					<Box
						sx={{
							border: '1px solid',
							borderColor: 'divider',
							borderRadius: 2,
							p: 1.4,
							bgcolor: 'background.default',
						}}
					>
						<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
							<Box
								sx={{
									width: 28,
									height: 28,
									borderRadius: 1.4,
									bgcolor: alpha(theme.palette.primary.main, 0.14),
									color: 'primary.main',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								{(() => {
									const Icon = activeDynamicTemplate.icon || Description;
									return <Icon sx={{ fontSize: 16 }} />;
								})()}
							</Box>
							<Box>
								<Typography sx={{ fontWeight: 800, fontSize: '0.86rem' }}>
									{activeDynamicTemplate.label} Fields
								</Typography>
								<Typography sx={{ color: 'text.secondary', fontSize: '0.72rem', fontWeight: 600 }}>
									Fields update automatically based on section type.
								</Typography>
							</Box>
						</Stack>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
								gap: 1,
							}}
						>
							{activeDynamicTemplate.fields.map((field) => {
								const FieldIcon = field.icon || Description;
								const value = dynamicValueToString(feedForm.dynamicFields?.[field.key], field);
								const isDateField = field.type === 'date';
								const isDateTimeField = field.type === 'datetime-local';
								const isMultiline = field.type === 'multiline';
								const isSelect = field.type === 'select';

								return (
									<TextField
										key={field.key}
										select={isSelect}
										label={`${field.label}${field.required ? ' *' : ''}`}
										type={
											field.type === 'number'
												? 'number'
												: isDateField
													? 'date'
													: isDateTimeField
														? 'datetime-local'
														: 'text'
										}
										value={value}
										onChange={(event) =>
											setFeedForm((prev) => ({
												...prev,
												dynamicFields: {
													...(prev.dynamicFields || {}),
													[field.key]: event.target.value,
												},
											}))
										}
										onFocus={isDateField || isDateTimeField ? openNativeDateTimePicker : undefined}
										onClick={isDateField || isDateTimeField ? openNativeDateTimePicker : undefined}
										InputLabelProps={isDateField || isDateTimeField ? { shrink: true } : undefined}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<FieldIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
												</InputAdornment>
											),
										}}
										helperText={field.required ? 'Required' : 'Optional'}
										size="small"
										multiline={isMultiline}
										minRows={isMultiline ? field.minRows || 2 : undefined}
										fullWidth
										sx={isMultiline ? { gridColumn: { sm: '1 / span 2' } } : undefined}
									>
										{isSelect
											? field.options?.map((option) => (
													<MenuItem key={option} value={option}>
														{toDisplayLabel(option)}
													</MenuItem>
												))
											: null}
									</TextField>
								);
							})}
						</Box>
					</Box>

					<TextField
						label="Additional Remarks (Optional)"
						value={feedForm.remarks}
						onChange={(event) =>
							setFeedForm((prev) => ({
								...prev,
								remarks: event.target.value,
							}))
						}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Description sx={{ color: 'text.secondary', fontSize: 18 }} />
								</InputAdornment>
							),
						}}
						size="small"
						multiline
						minRows={2}
						fullWidth
					/>

					{canFallback && (
						<>
							<TextField
								select
								label="Input For Engineer"
								value={feedForm.inputForUserId}
								onChange={(event) =>
									setFeedForm((prev) => ({
										...prev,
										inputForUserId: event.target.value,
									}))
								}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Person sx={{ color: 'text.secondary', fontSize: 18 }} />
										</InputAdornment>
									),
								}}
								size="small"
								fullWidth
							>
								<MenuItem value="">Self / General</MenuItem>
								{feedUsers.map((user) => (
									<MenuItem key={user.id} value={user.id}>
										{user.label}
									</MenuItem>
								))}
							</TextField>

							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
								<TextField
									select
									label="Source Type"
									value={feedForm.sourceType}
									onChange={(event) =>
										setFeedForm((prev) => ({
											...prev,
											sourceType: event.target.value,
										}))
									}
									size="small"
									fullWidth
								>
									{SOURCE_TYPE_OPTIONS.map((option) => (
										<MenuItem key={option.value} value={option.value}>
											{option.label}
										</MenuItem>
									))}
								</TextField>

								<TextField
									select
									label="Fallback Entry"
									value={feedForm.isFallbackEntry ? 'YES' : 'NO'}
									onChange={(event) =>
										setFeedForm((prev) => ({
											...prev,
											isFallbackEntry: event.target.value === 'YES',
										}))
									}
									size="small"
									fullWidth
								>
									<MenuItem value="NO">No</MenuItem>
									<MenuItem value="YES">Yes</MenuItem>
								</TextField>
							</Stack>

							{requiresSourceContact && (
								<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
									<TextField
										label="Source Contact Name"
										value={feedForm.sourceContactName}
										onChange={(event) =>
											setFeedForm((prev) => ({
												...prev,
												sourceContactName: event.target.value,
											}))
										}
										size="small"
										fullWidth
									/>
									<TextField
										label="Source Contact Designation"
										value={feedForm.sourceContactDesignation}
										onChange={(event) =>
											setFeedForm((prev) => ({
												...prev,
												sourceContactDesignation: event.target.value,
											}))
										}
										size="small"
										fullWidth
									/>
									<TextField
										label="Source Contact Channel"
										value={feedForm.sourceContactChannel}
										onChange={(event) =>
											setFeedForm((prev) => ({
												...prev,
												sourceContactChannel: event.target.value,
											}))
										}
										size="small"
										fullWidth
									/>
								</Stack>
							)}
						</>
					)}

					{missingDynamicFields.length > 0 && (
						<Typography sx={{ color: 'error.main', fontSize: '0.76rem', fontWeight: 700 }}>
							Fill required fields: {missingDynamicFields.map((field) => field.label).join(', ')}
						</Typography>
					)}

					<Stack direction="row" spacing={1} justifyContent="flex-end" pt={0.5}>
						<Button
							variant="outlined"
							onClick={() => {
								setFeedDrawerOpen(false);
								setEditingInput(null);
							}}
							sx={{ textTransform: 'none', fontWeight: 800 }}
						>
							Cancel
						</Button>
						<Button
							variant="contained"
							onClick={saveFeedEntry}
							disabled={!canSaveFeed}
							sx={{ textTransform: 'none', fontWeight: 800 }}
						>
							{isSavingFeed ? 'Saving...' : editingInput ? 'Update Entry' : 'Save Entry'}
						</Button>
					</Stack>
				</Stack>
			</Drawer>
		</Box>
	);
}
