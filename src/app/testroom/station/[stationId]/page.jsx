'use client';

import { AddLocationAlt, AppRegistration, Devices, Hub, Room, Storage } from '@mui/icons-material';
import { Box, Button, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useEquipmentByStation } from '@/hooks/equipment';
import { useStationLocations } from '@/hooks/locations';
import { useStationRacks } from '@/hooks/racks';
import { useStationSummary } from '@/hooks/stations';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { AddEquipmentDrawer, EquipmentTable } from '@/modules/equipments';
import { AddLocationForm, LocationTable } from '@/modules/locations';
import { AddRackForm, RackTable } from '@/modules/racks';
import { AddStationEquipmentDrawer, StationInternalTopology } from '@/modules/stations';

export default function StationDetailPage() {
	const theme = useTheme();
	const params = useParams();
	const dispatch = useDispatch();
	const { stationId } = params;

	const { data: locations = [], isLoading: locLoading } = useStationLocations(stationId);
	const { data: station = {} } = useStationSummary(stationId);
	const { data: racks = [], isLoading: racksLoading } = useStationRacks(stationId);
	const { data: equipments = [], isLoading: equipmentsLoading } = useEquipmentByStation(stationId);

	const [tabValue, setTabValue] = useState(0);

	// Context-aware actions with uniform styling
	const tabActions = {
		0: {
			label: 'Add Station Equipment',
			icon: <Hub />,
			drawer: 'stationEquipmentDrawer',
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
		3: {
			label: 'Add Equipment',
			icon: <Devices />,
			drawer: 'addEquipmentDrawer',
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
				bgcolor: 'background.default',
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
					bgcolor: 'background.paper',
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box
						sx={{
							p: 1,
							bgcolor: 'action.hover',
							borderRadius: 2,
							display: 'flex',
						}}
					>
						<AppRegistration sx={{ color: 'text.secondary' }} />
					</Box>
					<Box>
						<Stack direction="row" spacing={1} alignItems="baseline">
							<Typography
								variant="h5"
								sx={{
									fontWeight: 900,
									color: 'text.primary',
									letterSpacing: '-0.02em',
								}}
							>
								{station?.name || 'Loading...'}
							</Typography>
							<Typography variant="subtitle1" sx={{ color: 'text.disabled', fontWeight: 600 }}>
								{station?.code}
							</Typography>
						</Stack>
						<Typography
							variant="caption"
							sx={{
								color: 'text.secondary',
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
						bgcolor: 'primary.main',
						borderRadius: 2.5,
						textTransform: 'none',
						fontWeight: 800,
						px: 3,
						py: 1.2,
						fontSize: '0.85rem',
						// Uniform shadow
						boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
						'&:hover': {
							bgcolor: 'primary.dark',
							filter: 'brightness(0.9)',
							boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.28)}`,
						},
					}}
				>
					{currentAction.label}
				</Button>
			</Box>

			{/* 2. Uniform Navigation Tabs */}
			<Box sx={{ px: 3, bgcolor: 'background.paper' }}>
				<Tabs
					value={tabValue}
					onChange={(_, val) => setTabValue(val)}
					sx={{
						minHeight: 48,
						'& .MuiTabs-indicator': {
							height: 3,
							borderRadius: '3px 3px 0 0',
							bgcolor: 'primary.main',
						},
						'& .MuiTab-root': {
							fontWeight: 700,
							fontSize: '0.8rem',
							minWidth: 140,
							textTransform: 'uppercase',
							color: 'text.disabled',
							transition: 'color 0.2s ease',
							'&.Mui-selected': {
								color: 'primary.main',
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
					<Tab icon={<Devices sx={{ fontSize: 18 }} />} iconPosition="start" label="Equipments" />
				</Tabs>
				<Divider sx={{ borderColor: 'divider' }} />
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
				<AddEquipmentDrawer />
				<AddStationEquipmentDrawer equipments={equipments} />

				{tabValue === 0 && (
					<Box sx={{ width: '100%', height: '100%', bgcolor: 'background.default' }}>
						<StationInternalTopology stationId={stationId} />
					</Box>
				)}

				{tabValue === 1 && (
					<Box
						sx={{
							bgcolor: 'background.paper',
							borderRadius: 3,
							border: '1px solid',
							borderColor: 'divider',
							overflow: 'hidden',
						}}
					>
						<LocationTable stationId={stationId} locations={locations} isLoading={locLoading} />
					</Box>
				)}

				{tabValue === 2 && (
					<Box
						sx={{
							bgcolor: 'background.paper',
							borderRadius: 3,
							border: '1px solid',
							borderColor: 'divider',
							overflow: 'hidden',
						}}
					>
						<RackTable stationId={stationId} racks={racks} isLoading={racksLoading} />
					</Box>
				)}
				{tabValue === 3 && (
					<Box
						sx={{
							bgcolor: 'background.paper',
							borderRadius: 3,
							border: '1px solid',
							borderColor: 'divider',
							overflow: 'hidden',
						}}
					>
						<EquipmentTable
							stationId={stationId}
							equipments={equipments}
							isLoading={equipmentsLoading}
						/>
					</Box>
				)}
			</Box>
		</Box>
	);
}
