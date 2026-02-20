export const DataGridStyles = (theme) => ({
	// 1. Root Grid Reset
	'&.MuiDataGrid-root': {
		border: 'none',
		borderRadius: 0,
		backgroundColor: theme.palette.background.paper,
	},

	// 2. Header Layer
	'& .MuiDataGrid-container--top-section': {
		backgroundColor: `${theme.palette.action.hover} !important`,
		borderRadius: 0,
	},
	'& .MuiDataGrid-columnHeaders': {
		backgroundColor: `${theme.palette.action.hover} !important`,
		borderBottom: `1px solid ${theme.palette.divider} !important`,
		borderRadius: 0,
	},
	'& .MuiDataGrid-columnHeader': {
		backgroundColor: `${theme.palette.action.hover} !important`,
		'&:focus, &:focus-within': {
			outline: 'none !important',
		},
	},

	// 3. Header Text
	'& .MuiDataGrid-columnHeaderTitle': {
		color: `${theme.palette.text.secondary} !important`,
		fontWeight: '700 !important',
		fontSize: '0.75rem',
		textTransform: 'uppercase',
		letterSpacing: '0.05rem',
	},

	// 4. FIXING SORT ARROWS & BLACK DOTS
	// This makes the arrows visible (Slate Blue color)
	'& .MuiDataGrid-sortIcon': {
		color: `${theme.palette.text.secondary} !important`,
		opacity: '1 !important', // Ensure they aren't hidden
	},
	// This removes the "black dot" hover effect
	'& .MuiDataGrid-iconButtonContainer': {
		visibility: 'visible', // Keep container visible
		width: 'auto',
	},
	'& .MuiIconButton-root': {
		backgroundColor: 'transparent !important', // Remove the black dot
		'&:hover': {
			backgroundColor: `${theme.palette.action.hover} !important`, // Subtle soft grey hover instead
		},
	},
	// Fix for the "Menu" dots/arrows that appear on hover
	'& .MuiDataGrid-menuIcon': {
		visibility: 'visible !important',
		width: 'auto !important',
	},

	// 5. Row Styling
	'& .MuiDataGrid-row': {
		minHeight: '72px !important',
		maxHeight: '72px !important',
		borderBottom: `1px solid ${theme.palette.divider}`,
		'&:hover': {
			backgroundColor: `${theme.palette.action.hover} !important`,
		},
	},
	'& .even-row': { backgroundColor: theme.palette.background.paper },
	'& .odd-row': { backgroundColor: theme.palette.background.default },

	'& .MuiDataGrid-cell': {
		border: 'none !important',
		color: theme.palette.text.primary,
		fontSize: '0.9rem',
		fontWeight: '500',
		display: 'flex',
		alignItems: 'center',
		'&:focus, &:focus-within': { outline: 'none !important' },
	},

	// 6. Footer & Filler
	'& .MuiDataGrid-footerContainer': {
		borderTop: `1px solid ${theme.palette.divider} !important`,
		backgroundColor: theme.palette.background.paper,
		borderRadius: 0,
	},
	'& .MuiDataGrid-filler': {
		backgroundColor: `${theme.palette.action.hover} !important`,
	},
	'& .MuiDataGrid-columnSeparator': {
		display: 'none !important',
	},
});
