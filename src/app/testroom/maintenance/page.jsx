'use client';

import { Add, BuildCircle, EventRepeat, Warning } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTabs } from '@/hooks/common';
import { useDeleteMaintenanceSchedule } from '@/hooks/maintenance';
import RtmTabs from '@/lib/common/tabs';
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
	const { mutate: deleteSchedule } = useDeleteMaintenanceSchedule();
	const [selectedOccurrence, setSelectedOccurrence] = useState(null);
	const [editingSchedule, setEditingSchedule] = useState(null);

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
					bgcolor: 'background.paper',
				}}
			>
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					spacing={1.5}
					alignItems={{ xs: 'flex-start', md: 'center' }}
					justifyContent="space-between"
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
							<Typography
								variant="h5"
								sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}
							>
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
					<Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
						<Button
							variant="contained"
							startIcon={<Add />}
							onClick={handleCreate}
							sx={{ width: { xs: '100%', md: 'auto' } }}
						>
							Add Schedule
						</Button>
					</Stack>
				</Stack>
			</Box>

			{/* Tabs */}
			<Box sx={{ px: 3, bgcolor: 'background.paper' }}>
				<RtmTabs
					tabs={MAINT_TABS}
					tabsName="maintenanceHub"
					initialState={{ currentTab: 'schedules' }}
				/>
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
						onDelete={(row) => {
							const yes = window.confirm(
								`Delete schedule "${row?.title || 'selected schedule'}"? This cannot be undone.`
							);
							if (!yes || !row?.id) return;
							deleteSchedule(row.id);
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
