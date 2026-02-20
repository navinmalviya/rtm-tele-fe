'use client';

import { CalendarMonth, Edit, Place, Visibility } from '@mui/icons-material';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useStations } from '@/hooks/stations';
import RtmDataGrid from '@/lib/common/datagrid';

export function StationTable() {
	const router = useRouter();
	const { data: stations = [], isLoading } = useStations();

	const columns = [
		{
			field: 'code',
			headerName: 'STATION IDENTITY',
			flex: 1.5,
			renderCell: (params) => {
				console.log('oar-<', params);
				return (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
						<Box
							sx={(theme) => ({
								p: 1,
								bgcolor: alpha(theme.palette.primary.main, 0.12),
								borderRadius: 1.5,
								display: 'flex',
								color: theme.palette.primary.main,
							})}
						>
							<Place fontSize="small" />
						</Box>
						<Box>
							<Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>
								{params.row.data.code}
							</Typography>
							<Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
								{params.row.data.label}
							</Typography>
						</Box>
					</Box>
				);
			},
		},
		{
			field: 'subsection',
			headerName: 'PARENT SUB-SECTION',
			flex: 1.2,
			renderCell: (params) => (
				<Chip
					label={params.value?.code || 'MAIN LINE'}
					size="small"
					sx={{
						bgcolor: 'action.hover',
						color: 'text.secondary',
						fontWeight: 700,
						fontSize: '0.7rem',
						borderRadius: 1,
					}}
				/>
			),
		},
		{
			field: 'createdAt',
			headerName: 'DATE ADDED',
			flex: 1,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<CalendarMonth sx={{ fontSize: '16px', color: 'text.disabled' }} />
					<Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 500 }}>
						{new Date(params.value).toLocaleDateString()}
					</Typography>
				</Box>
			),
		},
		{
			field: 'actions',
			headerName: '',
			width: 100,
			sortable: false,
			renderCell: (params) => (
				<Box sx={{ display: 'flex', gap: 0.5 }}>
					<Tooltip title="View Dashboard">
						<IconButton
							size="small"
							sx={{ color: 'text.secondary' }}
							onClick={() => router.push(`/testroom/station/${params.row.id}`)}
						>
							<Visibility fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Edit">
						<IconButton size="small" sx={{ color: 'text.secondary' }}>
							<Edit fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			),
		},
	];

	return (
		<Box sx={{ width: '100%' }}>
			<RtmDataGrid
				rows={stations}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={70}
			/>
		</Box>
	);
}
