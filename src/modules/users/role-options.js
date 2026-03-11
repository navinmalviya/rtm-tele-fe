export const ROLE_OPTIONS = [
	{ label: 'Admin (Division IT)', value: 'ADMIN' },
	{ label: 'Sr DSTE', value: 'SR_DSTE' },
	{ label: 'DSTE', value: 'DSTE' },
	{ label: 'ADSTE', value: 'ADSTE' },
	{ label: 'Testroom', value: 'TESTROOM' },
	{ label: 'SSE Tele Incharge', value: 'SSE_TELE_INCHARGE' },
	{ label: 'JE/SSE Tele Sectional', value: 'JE_SSE_TELE_SECTIONAL' },
	{ label: 'TCM (Telecom Maintainer)', value: 'TCM' },
	{ label: 'Technician (Legacy)', value: 'TECHNICIAN' },
	{ label: 'TRC', value: 'TRC' },
	{ label: 'Viewer', value: 'VIEWER' },
	{ label: 'SSE S&T Office', value: 'SSE_SNT_OFFICE' },
	{ label: 'SSE Tech', value: 'SSE_TECH' },
];

export const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'ADMIN']);

export const ROLE_LABEL_MAP = ROLE_OPTIONS.reduce((acc, role) => {
	acc[role.value] = role.label;
	return acc;
}, {});

export const formatRoleLabel = (roleValue) => {
	if (!roleValue) return '-';
	return (
		ROLE_LABEL_MAP[roleValue] ||
		roleValue
			.toString()
			.replace(/_/g, ' ')
			.toLowerCase()
			.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
	);
};

export const ESCALATION_ROLE_OPTIONS = [
	{ label: 'TCM (Telecom Maintainer)', value: 'TCM' },
	{ label: 'JE/SSE Tele Sectional', value: 'JE_SSE_TELE_SECTIONAL' },
	{ label: 'SSE Tele Incharge', value: 'SSE_TELE_INCHARGE' },
	{ label: 'ADSTE', value: 'ADSTE' },
	{ label: 'DSTE', value: 'DSTE' },
	{ label: 'Sr DSTE', value: 'SR_DSTE' },
	{ label: 'Admin (Division IT)', value: 'ADMIN' },
	{ label: 'Testroom', value: 'TESTROOM' },
];
