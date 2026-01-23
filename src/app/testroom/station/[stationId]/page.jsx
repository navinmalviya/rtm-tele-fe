'use client';

import { Add } from '@mui/icons-material';
import { Box, Button, Divider, Tab, Tabs, Typography } from '@mui/material';
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

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				width: '100%',
			}}
		>
			{/* 1. Header Section */}
			<Box
				sx={{
					px: 2,
					pt: 2,
					pb: 2,
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<Box>
					<Typography
						variant="h5"
						sx={{
							fontWeight: 900,
							color: '#c62828',
							letterSpacing: '-0.02em',
						}}
					>
						{station?.name}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Internal Layout & Inventory Management
					</Typography>
				</Box>
				<Box>
					<Button
						variant="outlined"
						startIcon={<Add />}
						fullWidth
						onClick={() =>
							dispatch(
								openDrawer({
									drawerName: 'addRackDrawer',
								})
							)
						}
						color="error"
					>
						Add Equipment
					</Button>
				</Box>
			</Box>

			{/* 2. Tabs Section */}
			<Box sx={{ px: 2 }}>
				<Tabs
					value={tabValue}
					onChange={(_, val) => setTabValue(val)}
					sx={{
						'& .MuiTab-root': {
							fontWeight: 700,
							fontSize: '0.8rem',
							minWidth: 150,
							px: 0,
							mr: 4,
							alignItems: 'flex-start', // Keeps text left-aligned
						},
					}}
				>
					<Tab label="INTERNAL TOPOLOGY" />
					<Tab label="LOCATIONS (ROOMS)" />
					<Tab label="RACKS" />
				</Tabs>
				<Divider />
			</Box>

			{/* 3. The Interactive Viewport */}
			<Box sx={{ flex: 1, minHeight: 0, position: 'relative', width: '100%' }}>
				<AddLocationForm />
				<AddRackForm locations={locations} isLoading={isLoading} />

				{tabValue === 0 && (
					<Box sx={{ width: '100%', height: '100%' }}>
						<StationInternalTopology stationId={stationId} />
					</Box>
				)}

				{tabValue === 1 && (
					<LocationTable
						stationId={stationId}
						locations={locations}
						isLoading={isLoading}
					/>
				)}

				{tabValue === 2 && (
					<RackTable
						stationId={stationId}
						racks={racks}
						isLoading={racksLoading}
					/>
				)}
			</Box>
		</Box>
	);
}
