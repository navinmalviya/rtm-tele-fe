'use client';

import { Add, Hub, Room, Storage } from '@mui/icons-material';
import { Box, Button, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useStationLocations } from '@/hooks/locations';
import { useStationRacks } from '@/hooks/racks';
import { useStationSummary } from '@/hooks/stations';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { AddLocationForm, LocationTable } from '@/modules/locations';
import { AddRackForm, RackTable } from '@/modules/racks';
import { StationInternalTopology } from '@/modules/stations';

export default function StationDetailPage() {
	const params = useParams();
	const dispatch = useDispatch();
	const { stationId } = params;
	const { data: locations = [], isLoading } = useStationLocations(stationId);
	const { data: station = {} } = useStationSummary(stationId);
	const { data: racks = [], isLoading: racksLoading } = useStationRacks(stationId);
	const [tabValue, setTabValue] = useState(0);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				width: '100%',
				bgcolor: '#F8FAFC', // Soft Slate background
			}}
		>
			{/* 1. Header Section */}
			<Box
				sx={{
					px: 2,
					pt: 3,
					pb: 2,
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					bgcolor: 'white',
				}}
			>
				<Box>
					<Stack direction="row" spacing={1} alignItems="center">
						<Typography
							variant="h4"
							sx={{
								fontWeight: 800,
								color: '#1E293B', // Dark Slate
								letterSpacing: '-0.02em',
							}}
						>
							{station?.name || 'Loading...'}
						</Typography>
						<Typography
							variant="h6"
							sx={{ color: '#64748B', fontWeight: 400 }}
						>
							({station?.code})
						</Typography>
					</Stack>
					<Typography
						variant="body2"
						sx={{ color: '#64748B', mt: 0.5, fontWeight: 500 }}
					>
						{station?.subsection?.name || 'Main Line Section'} •
						Division Assets
					</Typography>
				</Box>
				<Box>
					<Button
						variant="contained"
						disableElevation
						startIcon={<Add />}
						onClick={() =>
							dispatch(
								openDrawer({
									drawerName: 'addRackDrawer',
								})
							)
						}
						sx={{
							bgcolor: '#3B82F6',
							borderRadius: 2,
							textTransform: 'none',
							fontWeight: 700,
							px: 3,
							'&:hover': { bgcolor: '#2563EB' },
						}}
					>
						Add Equipment
					</Button>
				</Box>
			</Box>

			{/* 2. Tabs Section */}
			<Box sx={{ px: 2, bgcolor: 'white' }}>
				<Tabs
					value={tabValue}
					onChange={(_, val) => setTabValue(val)}
					sx={{
						'& .MuiTabs-indicator': {
							height: 3,
							borderRadius: '3px 3px 0 0',
							bgcolor: '#3B82F6',
						},
						'& .MuiTab-root': {
							fontWeight: 700,
							fontSize: '0.85rem',
							minWidth: 120,
							textTransform: 'none',
							color: '#64748B',
							'&.Mui-selected': {
								color: '#3B82F6',
							},
						},
					}}
				>
					<Tab
						icon={<Hub sx={{ fontSize: 18 }} />}
						iconPosition="start"
						label="Internal Topology"
					/>
					<Tab
						icon={<Room sx={{ fontSize: 18 }} />}
						iconPosition="start"
						label="Locations"
					/>
					<Tab
						icon={<Storage sx={{ fontSize: 18 }} />}
						iconPosition="start"
						label="Racks & Assets"
					/>
				</Tabs>
				<Divider sx={{ borderColor: '#F1F5F9' }} />
			</Box>

			{/* 3. The Content Area */}
			<Box
				sx={{
					flex: 1,
					minHeight: 0,
					position: 'relative',
					width: '100%',
					p: tabValue === 0 ? 0 : 4, // No padding for Topology view, padding for tables
				}}
			>
				<AddLocationForm />
				<AddRackForm locations={locations} isLoading={isLoading} />

				{tabValue === 0 && (
					<Box
						sx={{
							width: '100%',
							height: '100%',
							bgcolor: '#F1F5F9',
						}}
					>
						<StationInternalTopology stationId={stationId} />
					</Box>
				)}

				{tabValue === 1 && (
					<Box
						sx={{
							bgcolor: 'white',
							borderRadius: 3,
							boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
							overflow: 'hidden',
						}}
					>
						<LocationTable
							stationId={stationId}
							locations={locations}
							isLoading={isLoading}
						/>
					</Box>
				)}

				{tabValue === 2 && (
					<Box
						sx={{
							bgcolor: 'white',
							borderRadius: 3,
							boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
							overflow: 'hidden',
						}}
					>
						<RackTable
							stationId={stationId}
							racks={racks}
							isLoading={racksLoading}
						/>
					</Box>
				)}
			</Box>
		</Box>
	);
}
