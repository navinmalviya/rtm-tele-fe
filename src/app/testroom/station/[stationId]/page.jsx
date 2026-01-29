'use client';

import { AddLocationAlt, AppRegistration, Hub, Room, Storage } from '@mui/icons-material';
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

	const { data: locations = [], isLoading: locLoading } = useStationLocations(stationId);
	const { data: station = {} } = useStationSummary(stationId);
	const { data: racks = [], isLoading: racksLoading } = useStationRacks(stationId);

	const [tabValue, setTabValue] = useState(0);

	// Uniform theme color: Primary Blue
	const THEME_COLOR = '#3B82F6';

	// Context-aware actions with uniform styling
	const tabActions = {
		0: {
			label: 'Add Asset',
			icon: <Hub />,
			drawer: 'addAssetDrawer',
		},
		1: {
			label: 'Add Location',
			icon: <AddLocationAlt />,
			drawer: 'addLocationDrawer',
		},
		2: {
			label: 'Add Rack',
			icon: <Storage />,
			drawer: 'addRackDrawer',
		},
	};

	const currentAction = tabActions[tabValue];

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				width: '100%',
				bgcolor: '#F8FAFC',
			}}
		>
			{/* 1. Uniform Header */}
			<Box
				sx={{
					px: 3,
					pt: 3,
					pb: 2,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					bgcolor: 'white',
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box
						sx={{
							p: 1,
							bgcolor: '#F1F5F9',
							borderRadius: 2,
							display: 'flex',
						}}
					>
						<AppRegistration sx={{ color: '#64748B' }} />
					</Box>
					<Box>
						<Stack direction="row" spacing={1} alignItems="baseline">
							<Typography
								variant="h5"
								sx={{
									fontWeight: 900,
									color: '#0F172A',
									letterSpacing: '-0.02em',
								}}
							>
								{station?.name || 'Loading...'}
							</Typography>
							<Typography variant="subtitle1" sx={{ color: '#94A3B8', fontWeight: 600 }}>
								{station?.code}
							</Typography>
						</Stack>
						<Typography
							variant="caption"
							sx={{
								color: '#64748B',
								fontWeight: 700,
								textTransform: 'uppercase',
								letterSpacing: '1px',
							}}
						>
							{station?.subsection?.name || 'Main Line'} • Infrastructure
						</Typography>
					</Box>
				</Stack>

				<Button
					variant="contained"
					disableElevation
					startIcon={currentAction.icon}
					onClick={() => dispatch(openDrawer({ drawerName: currentAction.drawer }))}
					sx={{
						bgcolor: THEME_COLOR,
						borderRadius: 2.5,
						textTransform: 'none',
						fontWeight: 800,
						px: 3,
						py: 1.2,
						fontSize: '0.85rem',
						// Uniform shadow
						boxShadow: `0 4px 12px ${THEME_COLOR}33`,
						'&:hover': {
							bgcolor: THEME_COLOR,
							filter: 'brightness(0.9)',
							boxShadow: `0 6px 16px ${THEME_COLOR}44`,
						},
					}}
				>
					{currentAction.label}
				</Button>
			</Box>

			{/* 2. Uniform Navigation Tabs */}
			<Box sx={{ px: 3, bgcolor: 'white' }}>
				<Tabs
					value={tabValue}
					onChange={(_, val) => setTabValue(val)}
					sx={{
						minHeight: 48,
						'& .MuiTabs-indicator': {
							height: 3,
							borderRadius: '3px 3px 0 0',
							bgcolor: THEME_COLOR,
						},
						'& .MuiTab-root': {
							fontWeight: 700,
							fontSize: '0.8rem',
							minWidth: 140,
							textTransform: 'uppercase',
							color: '#94A3B8',
							transition: 'color 0.2s ease',
							'&.Mui-selected': {
								color: THEME_COLOR,
							},
						},
					}}
				>
					<Tab icon={<Hub sx={{ fontSize: 18 }} />} iconPosition="start" label="Topology" />
					<Tab icon={<Room sx={{ fontSize: 18 }} />} iconPosition="start" label="Locations" />
					<Tab
						icon={<Storage sx={{ fontSize: 18 }} />}
						iconPosition="start"
						label="Racks & Assets"
					/>
				</Tabs>
				<Divider sx={{ borderColor: '#F1F5F9' }} />
			</Box>

			{/* 3. Content Area */}
			<Box
				sx={{
					flex: 1,
					minHeight: 0,
					overflowY: 'auto',
					p: tabValue === 0 ? 0 : 3,
				}}
			>
				<AddLocationForm />
				<AddRackForm locations={locations} isLoading={locLoading} />

				{tabValue === 0 && (
					<Box sx={{ width: '100%', height: '100%', bgcolor: '#F1F5F9' }}>
						<StationInternalTopology stationId={stationId} />
					</Box>
				)}

				{tabValue === 1 && (
					<Box
						sx={{
							bgcolor: 'white',
							borderRadius: 3,
							border: '1px solid #E2E8F0',
							overflow: 'hidden',
						}}
					>
						<LocationTable stationId={stationId} locations={locations} isLoading={locLoading} />
					</Box>
				)}

				{tabValue === 2 && (
					<Box
						sx={{
							bgcolor: 'white',
							borderRadius: 3,
							border: '1px solid #E2E8F0',
							overflow: 'hidden',
						}}
					>
						<RackTable stationId={stationId} racks={racks} isLoading={racksLoading} />
					</Box>
				)}
			</Box>
		</Box>
	);
}
