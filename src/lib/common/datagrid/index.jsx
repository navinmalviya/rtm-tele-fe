'use client';

import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { alpha } from '@mui/material/styles';

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
	const blueprintStyles = (theme) => ({
		border: 'none',
		backgroundColor: `${theme.palette.background.paper} !important`,
		// --- HEADER & SORTING ICON FIXES ---
		'& .MuiDataGrid-columnHeaders': {
			backgroundColor: `${alpha(theme.palette.primary.main, 0.04)} !important`,
			color: theme.palette.text.secondary,
			borderBottom: `1px solid ${theme.palette.divider}`,
			backgroundImage: 'none !important',
		},
		'& .MuiDataGrid-columnHeader': {
			backgroundColor: `${alpha(theme.palette.primary.main, 0.04)} !important`,
			'&:hover, &:focus': {
				backgroundColor: `${alpha(theme.palette.primary.main, 0.08)} !important`,
				outline: 'none',
			},
			'& .MuiDataGrid-iconButtonContainer': {
				visibility: 'visible !important',
				width: 'auto',
				'& .MuiButtonBase-root': {
					color: `${theme.palette.primary.main} !important`,
					backgroundColor: 'transparent !important',
					'&:hover': {
						backgroundColor: `${alpha(theme.palette.primary.main, 0.12)} !important`,
					},
				},
			},
			'& .MuiDataGrid-sortIcon': {
				color: `${theme.palette.primary.main} !important`,
				opacity: '1 !important',
			},
		},
		'& .MuiDataGrid-columnHeaderTitle': {
			fontWeight: 800,
			fontSize: '0.72rem',
			letterSpacing: '0.5px',
			textTransform: 'uppercase',
			color: theme.palette.text.secondary,
		},
		// --- ROW & HOVER FIXES ---
		'& .MuiDataGrid-row': {
			backgroundColor: theme.palette.background.paper,
			transition: 'background-color 0.15s ease',
			'&:hover': {
				backgroundColor: `${alpha(theme.palette.primary.main, 0.06)} !important`,
			},
			'&.even-row': { backgroundColor: theme.palette.background.paper },
			'&.odd-row': { backgroundColor: alpha(theme.palette.primary.main, 0.02) },
		},
		// --- CELL & SELECTION FIXES ---
		'& .MuiDataGrid-cell': {
			borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
			color: theme.palette.text.primary,
			display: 'flex',
			alignItems: 'center',
			fontSize: '0.85rem',
			'&:focus, &:focus-within': {
				outline: 'none !important',
				backgroundColor: 'transparent !important',
			},
		},
		'& .Mui-selected': {
			backgroundColor: `${alpha(theme.palette.primary.main, 0.12)} !important`,
			'&:hover': {
				backgroundColor: `${alpha(theme.palette.primary.main, 0.18)} !important`,
			},
		},
		// --- UI UTILITIES ---
		'& .MuiDataGrid-virtualScroller': {
			backgroundColor: `${theme.palette.background.paper} !important`,
		},
		'& .MuiDataGrid-footerContainer': {
			borderTop: `1px solid ${theme.palette.divider}`,
			backgroundColor: theme.palette.background.paper,
		},
		...sx,
	});

	return (
		<Box
			sx={(theme) => ({
				width: '100%',
				backgroundColor: theme.palette.background.paper,
				border: `1px solid ${theme.palette.divider}`,
				borderRadius: '16px',
				overflow: 'hidden',
				boxShadow:
					theme.palette.mode === 'dark'
						? 'none'
						: `0 1px 3px 0 ${alpha(theme.palette.common.black, 0.05)}`,
			})}
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
