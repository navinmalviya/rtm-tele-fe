'use client';

import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

/**
 * RtmDataGrid - Common Table Component
 * Standardized with the "Hardware Blueprint" design language.
 * Fixes default MUI dark-mode/black-hover conflicts.
 */
export default function RtmDataGrid({
	rows = [],
	columns = [],
	loading = false,
	onSelectionChange,
	checkboxSelection = false,
	sx = {},
	...rest
}) {
	const blueprintStyles = {
		border: 'none',
		backgroundColor: '#FFFFFF !important',
		// --- HEADER & SORTING ICON FIXES ---
		'& .MuiDataGrid-columnHeaders': {
			backgroundColor: '#F8FAFC !important',
			color: '#475569',
			borderBottom: '1px solid #E2E8F0',
			backgroundImage: 'none !important',
		},
		'& .MuiDataGrid-columnHeader': {
			backgroundColor: '#F8FAFC !important',
			'&:hover, &:focus': {
				backgroundColor: '#F1F5F9 !important',
				outline: 'none',
			},
			// Targeting the container of the sort icon
			'& .MuiDataGrid-iconButtonContainer': {
				visibility: 'visible !important',
				width: 'auto',
				// This targets the actual button around the arrow
				'& .MuiButtonBase-root': {
					color: '#3B82F6 !important',
					backgroundColor: 'transparent !important',
					'&:hover': {
						backgroundColor: 'rgba(59, 130, 246, 0.08) !important', // Soft blue hover, NOT black
					},
				},
			},
			// The arrow icon itself
			'& .MuiDataGrid-sortIcon': {
				color: '#3B82F6 !important',
				opacity: '1 !important',
			},
		},
		'& .MuiDataGrid-columnHeaderTitle': {
			fontWeight: 800,
			fontSize: '0.72rem',
			letterSpacing: '0.5px',
			textTransform: 'uppercase',
			color: '#64748B',
		},
		// --- ROW & HOVER FIXES ---
		'& .MuiDataGrid-row': {
			backgroundColor: '#FFFFFF',
			transition: 'background-color 0.15s ease',
			'&:hover': {
				backgroundColor: '#F1F5F9 !important', // Clean light gray
			},
			'&.even-row': { backgroundColor: '#FFFFFF' },
			'&.odd-row': { backgroundColor: '#FAFBFC' },
		},
		// --- CELL & SELECTION FIXES ---
		'& .MuiDataGrid-cell': {
			borderBottom: '1px solid #F1F5F9',
			color: '#1E293B',
			display: 'flex',
			alignItems: 'center',
			fontSize: '0.85rem',
			'&:focus, &:focus-within': {
				outline: 'none !important',
				backgroundColor: 'transparent !important',
			},
		},
		'& .Mui-selected': {
			backgroundColor: '#EFF6FF !important',
			'&:hover': {
				backgroundColor: '#DBEAFE !important',
			},
		},
		// --- UI UTILITIES ---
		'& .MuiDataGrid-virtualScroller': {
			backgroundColor: '#FFFFFF !important',
		},
		'& .MuiDataGrid-footerContainer': {
			borderTop: '1px solid #E2E8F0',
			backgroundColor: '#FFFFFF',
		},
		...sx,
	};

	return (
		<Box
			sx={{
				width: '100%',
				backgroundColor: '#FFFFFF',
				border: '1px solid #E2E8F0',
				borderRadius: '16px',
				overflow: 'hidden',
				boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
			}}
		>
			<DataGrid
				sx={blueprintStyles}
				getRowClassName={(params) =>
					params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
				}
				rows={rows}
				columns={columns}
				checkboxSelection={checkboxSelection}
				onRowSelectionModelChange={onSelectionChange}
				loading={loading}
				disableRowSelectionOnClick
				disableColumnMenu
				density="comfortable"
				hideFooter={rows.length < 10}
				{...rest}
			/>
		</Box>
	);
}
