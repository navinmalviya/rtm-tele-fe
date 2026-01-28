export const DataGridStyles = {
	// 1. Root Grid Reset
	'&.MuiDataGrid-root': {
		border: 'none',
		borderRadius: 0,
		backgroundColor: '#FFFFFF',
	},

	// 2. Header Layer
	'& .MuiDataGrid-container--top-section': {
		backgroundColor: '#F1F5F9 !important',
		borderRadius: 0,
	},
	'& .MuiDataGrid-columnHeaders': {
		backgroundColor: '#F1F5F9 !important',
		borderBottom: '1px solid #E2E8F0 !important',
		borderRadius: 0,
	},
	'& .MuiDataGrid-columnHeader': {
		backgroundColor: '#F1F5F9 !important',
		'&:focus, &:focus-within': {
			outline: 'none !important',
		},
	},

	// 3. Header Text
	'& .MuiDataGrid-columnHeaderTitle': {
		color: '#64748B !important',
		fontWeight: '700 !important',
		fontSize: '0.75rem',
		textTransform: 'uppercase',
		letterSpacing: '0.05rem',
	},

	// 4. FIXING SORT ARROWS & BLACK DOTS
	// This makes the arrows visible (Slate Blue color)
	'& .MuiDataGrid-sortIcon': {
		color: '#64748B !important',
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
			backgroundColor: 'rgba(100, 116, 139, 0.1) !important', // Subtle soft grey hover instead
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
		borderBottom: '1px solid #F1F5F9',
		'&:hover': {
			backgroundColor: '#F8FAFC !important',
		},
	},
	'& .even-row': { backgroundColor: '#FFFFFF' },
	'& .odd-row': { backgroundColor: '#FDFDFD' },

	'& .MuiDataGrid-cell': {
		border: 'none !important',
		color: '#1E293B',
		fontSize: '0.9rem',
		fontWeight: '500',
		display: 'flex',
		alignItems: 'center',
		'&:focus, &:focus-within': { outline: 'none !important' },
	},

	// 6. Footer & Filler
	'& .MuiDataGrid-footerContainer': {
		borderTop: '1px solid #E2E8F0 !important',
		backgroundColor: '#FFFFFF',
		borderRadius: 0,
	},
	'& .MuiDataGrid-filler': {
		backgroundColor: '#F1F5F9 !important',
	},
	'& .MuiDataGrid-columnSeparator': {
		display: 'none !important',
	},
};
