export const DataGridStyles = {
	width: '100%',
	'--DataGrid-overlayHeight': '300px',
	'.MuiDataGrid-columnSeparator': {
		display: 'none',
	},
	'&.MuiDataGrid-root': {
		border: 'none',
		fontFamily: 'var(--font-Manrope) !important',
		color: '#030303',
		fontWeight: '500',
	},
	'.MuiDataGrid-columnHeader': {
		borderBottom: '1px solid #838A91',
		color: '#838A91',
		justifyContent: 'flex-start',
	},
	'& .MuiDataGrid-columnHeaderTitleContainer': {
		justifyContent: 'flex-start',
	},
	'.MuiDataGrid-cell': {
		border: 'none',
	},
	'.MuiDataGrid-row.Mui-odd': {
		backgroundColor: '#F6FAFD',
	},
	'& .MuiDataGrid-row': {
		height: '80px !important',
		maxHeight: '80px !important',
		alignItems: 'center',
	},
	'& .MuiCheckbox-root svg': {
		height: '24px',
		width: '24px',
		border: '1px solid #E6E8E9',
		borderRadius: '4px',
		backgroundColor: '#FFFFFF',
	},
	'& .MuiCheckbox-root svg path': {
		display: 'none',
	},
	'& .MuiCheckbox-root.Mui-checked:not(.MuiCheckbox-indeterminate) svg': {
		backgroundColor: '#E65889',
		borderColor: '#FFFFFF',
		path: {
			fill: 'white', // Set the fill color to white
			display: 'block', // Display the tick icon
		},
	},
};
