'use client';

import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { DataGridStyles } from './datagrid.styles';

export default function RtmDataGrid({
	rows,
	columns,
	loading,
	onSelectionChange,
	checkboxSelection,
	...rest
}) {
	return (
		<Box
			sx={{
				width: '100%',
				backgroundColor: '#FFFFFF',
				border: '1px solid #E2E8F0', // THE ONLY BORDER
				borderRadius: '16px', // THE ONLY ROUNDING
				overflow: 'hidden', // CLIPS THE GRID CORNERS
				boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
			}}
		>
			<DataGrid
				sx={DataGridStyles}
				getRowClassName={(params) =>
					params.indexRelativeToCurrentPage % 2 === 0
						? 'even-row'
						: 'odd-row'
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
