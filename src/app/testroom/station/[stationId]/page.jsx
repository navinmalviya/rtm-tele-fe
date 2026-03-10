'use client';

import { AddLocationAlt, AppRegistration, Devices, Hub, Room, Storage } from '@mui/icons-material';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDeleteEquipment, useEquipmentByStation } from '@/hooks/equipment';
import { useDeleteLocation, useStationLocations } from '@/hooks/locations';
import { useDeleteRack, useStationRacks } from '@/hooks/racks';
import { useStationSummary } from '@/hooks/stations';
import { useTabs } from '@/hooks/common';
import RtmTabs from '@/lib/common/tabs';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { AddEquipmentDrawer, DeleteEquipmentDialog, EditEquipmentDrawer, EquipmentTable } from '@/modules/equipments';
import { AddLocationForm, DeleteLocationDialog, EditLocationDrawer, LocationTable } from '@/modules/locations';
import { AddRackForm, DeleteRackDialog, EditRackDrawer, RackTable } from '@/modules/racks';
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
	const { mutate: deleteLocation, isLoading: isDeletingLocation } = useDeleteLocation(stationId);
	const { mutate: deleteRack, isLoading: isDeletingRack } = useDeleteRack(stationId);
	const { mutate: deleteEquipment, isLoading: isDeletingEquipment } = useDeleteEquipment(stationId);

	const { currentTab } = useTabs(`stationDetail-${stationId}`, { currentTab: 'topology' });
	const [editingLocation, setEditingLocation] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [editingRack, setEditingRack] = useState(null);
	const [deleteRackTarget, setDeleteRackTarget] = useState(null);
	const [editingEquipment, setEditingEquipment] = useState(null);
	const [deleteEquipmentTarget, setDeleteEquipmentTarget] = useState(null);

	// Context-aware actions with uniform styling
	const tabActions = {
		topology: {
			label: 'Add Station Equipment',
			icon: <Hub />,
			drawer: 'stationEquipmentDrawer',
		},
		locations: {
			label: 'Add Location',
			icon: <AddLocationAlt />,
			drawer: 'addLocationDrawer',
		},
		racks: {
			label: 'Add Rack',
			icon: <Storage />,
			drawer: 'addRackDrawer',
		},
		equipments: {
			label: 'Add Equipment',
			icon: <Devices />,
			drawer: 'addEquipmentDrawer',
		},
	};

	const currentAction = tabActions[currentTab] || tabActions.topology;

	const tabs = [
		{ label: 'Topology', step: 'topology', icon: <Hub sx={{ fontSize: 18 }} /> },
		{ label: 'Locations', step: 'locations', icon: <Room sx={{ fontSize: 18 }} /> },
		{ label: 'Racks & Assets', step: 'racks', icon: <Storage sx={{ fontSize: 18 }} /> },
		{ label: 'Equipments', step: 'equipments', icon: <Devices sx={{ fontSize: 18 }} /> },
	];

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
				<RtmTabs tabs={tabs} tabsName={`stationDetail-${stationId}`} initialState={{ currentTab: 'topology' }} />
				<Divider sx={{ borderColor: 'divider' }} />
			</Box>

			{/* 3. Content Area */}
			<Box
				sx={{
					flex: 1,
					minHeight: 0,
					overflowY: 'auto',
					p: currentTab === 'topology' ? 0 : 3,
				}}
			>
				<AddLocationForm />
				<EditLocationDrawer location={editingLocation} stationId={stationId} />
				<DeleteLocationDialog
					open={!!deleteTarget}
					location={deleteTarget}
					isLoading={isDeletingLocation}
					onClose={() => setDeleteTarget(null)}
					onConfirm={() => {
						if (!deleteTarget?.id) return;
						deleteLocation(deleteTarget.id, {
							onSuccess: () => setDeleteTarget(null),
						});
					}}
				/>
				<AddRackForm locations={locations} isLoading={locLoading} />
				<EditRackDrawer rack={editingRack} stationId={stationId} locations={locations} />
				<DeleteRackDialog
					open={!!deleteRackTarget}
					rack={deleteRackTarget}
					isLoading={isDeletingRack}
					onClose={() => setDeleteRackTarget(null)}
					onConfirm={() => {
						if (!deleteRackTarget?.id) return;
						deleteRack(deleteRackTarget.id, {
							onSuccess: () => setDeleteRackTarget(null),
						});
					}}
				/>
				<AddEquipmentDrawer />
				<EditEquipmentDrawer equipment={editingEquipment} stationId={stationId} />
				<DeleteEquipmentDialog
					open={!!deleteEquipmentTarget}
					equipment={deleteEquipmentTarget}
					isLoading={isDeletingEquipment}
					onClose={() => setDeleteEquipmentTarget(null)}
					onConfirm={() => {
						if (!deleteEquipmentTarget?.id) return;
						deleteEquipment(deleteEquipmentTarget.id, {
							onSuccess: () => setDeleteEquipmentTarget(null),
						});
					}}
				/>
				<AddStationEquipmentDrawer equipments={equipments} />

				{currentTab === 'topology' && (
					<Box sx={{ width: '100%', height: '100%', bgcolor: 'background.default' }}>
						<StationInternalTopology stationId={stationId} />
					</Box>
				)}

				{currentTab === 'locations' && (
					<Box
						sx={{
							bgcolor: 'background.paper',
							borderRadius: 3,
							border: '1px solid',
							borderColor: 'divider',
							overflow: 'hidden',
						}}
					>
						<LocationTable
							stationId={stationId}
							locations={locations}
							isLoading={locLoading}
							onEdit={(location) => {
								setEditingLocation(location);
								dispatch(openDrawer({ drawerName: 'editLocationDrawer' }));
							}}
							onDelete={(location) => setDeleteTarget(location)}
						/>
					</Box>
				)}

				{currentTab === 'racks' && (
					<Box
						sx={{
							bgcolor: 'background.paper',
							borderRadius: 3,
							border: '1px solid',
							borderColor: 'divider',
							overflow: 'hidden',
						}}
					>
						<RackTable
							stationId={stationId}
							racks={racks}
							isLoading={racksLoading}
							onEdit={(rack) => {
								setEditingRack(rack);
								dispatch(openDrawer({ drawerName: 'editRackDrawer' }));
							}}
							onDelete={(rack) => setDeleteRackTarget(rack)}
						/>
					</Box>
				)}
				{currentTab === 'equipments' && (
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
							onEdit={(equipment) => {
								setEditingEquipment(equipment);
								dispatch(openDrawer({ drawerName: 'editEquipmentDrawer' }));
							}}
							onDelete={(equipment) => setDeleteEquipmentTarget(equipment)}
						/>
					</Box>
				)}
			</Box>
		</Box>
	);
}
