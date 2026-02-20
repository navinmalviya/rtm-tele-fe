'use client';

import { BuildCircle, EventRepeat, Warning } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import RtmTabs from '@/lib/common/tabs';
import { useTabs } from '@/hooks/common';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import {
	AddMaintenanceScheduleDrawer,
	CompleteMaintenanceDialog,
	EditMaintenanceScheduleDrawer,
	MaintenanceScheduleTable,
	OverdueMaintenanceTable,
} from '@/modules/maintenance';

const MAINT_TABS = [
	{ label: 'Schedules', step: 'schedules', icon: <EventRepeat sx={{ fontSize: 18 }} /> },
	{ label: 'Overdue', step: 'overdue', icon: <Warning sx={{ fontSize: 18 }} /> },
];

export default function MaintenancePage() {
	const dispatch = useDispatch();
	const { currentTab } = useTabs('maintenanceHub', { currentTab: 'schedules' });
	const [selectedOccurrence, setSelectedOccurrence] = useState(null);
	const [editingSchedule, setEditingSchedule] = useState(null);
	const theme = useTheme();

	const handleCreate = () => {
		dispatch(openDrawer({ drawerName: 'addMaintenanceScheduleDrawer' }));
	};

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
			{/* Header */}
			<Box
				sx={{
					px: 3,
					pt: 3,
					pb: 2,
					display: 'flex',
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
						<BuildCircle sx={{ color: 'text.secondary' }} />
					</Box>
					<Box>
						<Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>
							Maintenance Management
						</Typography>
						<Typography
							variant="caption"
							sx={{
								color: 'text.secondary',
								fontWeight: 700,
								textTransform: 'uppercase',
								letterSpacing: '1px',
							}}
						>
							Preventive scheduling & compliance
						</Typography>
					</Box>
				</Stack>

				<Button
					variant="contained"
					onClick={handleCreate}
					sx={{
						bgcolor: 'primary.main',
						borderRadius: 2.5,
						textTransform: 'none',
						fontWeight: 800,
						px: 3,
						py: 1.2,
						fontSize: '0.85rem',
						boxShadow: `0 4px 12px ${theme.palette.primary.main}33`,
						'&:hover': {
							bgcolor: 'primary.main',
							filter: 'brightness(0.9)',
							boxShadow: `0 6px 16px ${theme.palette.primary.main}44`,
						},
					}}
				>
					Create Schedule
				</Button>
			</Box>

			{/* Tabs */}
			<Box sx={{ px: 3, bgcolor: 'background.paper' }}>
				<RtmTabs tabs={MAINT_TABS} tabsName="maintenanceHub" initialState={{ currentTab: 'schedules' }} />
			</Box>

			{/* Content */}
			<Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
				<AddMaintenanceScheduleDrawer />
				<EditMaintenanceScheduleDrawer schedule={editingSchedule} />
				<CompleteMaintenanceDialog
					open={!!selectedOccurrence}
					onClose={() => setSelectedOccurrence(null)}
					occurrence={selectedOccurrence}
				/>

				{currentTab === 'schedules' && (
					<MaintenanceScheduleTable
						onEdit={(row) => {
							setEditingSchedule(row);
							dispatch(openDrawer({ drawerName: 'editMaintenanceScheduleDrawer' }));
						}}
					/>
				)}
				{currentTab === 'overdue' && (
					<OverdueMaintenanceTable onComplete={(row) => setSelectedOccurrence(row)} />
				)}
			</Box>
		</Box>
	);
}
