'use client';

import { CheckCircle, Engineering, MyLocation, Schedule } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useMyMaintenanceSummary } from '@/hooks/maintenance';
import { useTasks } from '@/hooks/task';
import RtmDataGrid from '@/lib/common/datagrid';
import StatCard from '@/lib/common/stat-card';
import TaskBoard from '@/lib/common/task-board';
import { CompleteMaintenanceDialog } from '@/modules/maintenance';

export default function FieldEngineerDashboard() {
	const { data: session } = useSession();
	const [selectedOccurrence, setSelectedOccurrence] = useState(null);

	const { data: allTasks = [], isLoading } = useTasks();
	const { data: maintenanceSummary, isLoading: maintLoading } = useMyMaintenanceSummary();

	const myTasks = allTasks.filter((t) => t.assignedToId === session?.user?.id);
	const pendingSchedules = maintenanceSummary?.pending || [];
	const completedSchedules = maintenanceSummary?.completed || [];

	const criticalMyTasks = myTasks.filter((t) => t.priority === 'CRITICAL').length;

	return (
		<Box sx={{ p: 4, bgcolor: 'transparent' }}>
			<Stack spacing={1} sx={{ mb: 4 }}>
				<Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
					My Field View
				</Typography>
				<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
					Hello {session?.user?.name || 'Engineer'}, here is your active agenda.
				</Typography>
			</Stack>

			<Grid container spacing={3} sx={{ width: '100%', ml: 0 }}>
				<Grid item xs={12} md={4}>
					<StatCard
						label="Pending My Action"
						value={myTasks.length.toString()}
						trend={criticalMyTasks > 0 ? `${criticalMyTasks} Urgent` : 'On Track'}
						icon={<Engineering />}
						color={criticalMyTasks > 0 ? 'error.main' : 'primary.main'}
					/>
				</Grid>
				<Grid item xs={12} md={4}>
					<StatCard
						label="Pending Maintenance"
						value={(maintenanceSummary?.pendingCount || 0).toString()}
						trend={
							pendingSchedules[0]?.dueDate
								? `Next due ${new Date(pendingSchedules[0].dueDate).toLocaleDateString('en-IN')}`
								: 'No pending schedule'
						}
						icon={<Schedule />}
						color="warning.main"
					/>
				</Grid>
				<Grid item xs={12} md={4}>
					<StatCard
						label="Completed Maintenance"
						value={(maintenanceSummary?.completedCount || 0).toString()}
						trend={
							completedSchedules[0]?.completedAt ? 'Recently updated' : 'No completed schedule'
						}
						icon={<MyLocation />}
						color="success.main"
					/>
				</Grid>
			</Grid>

			<Box sx={{ mt: 6 }}>
				<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
					<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Active Work Orders
					</Typography>
					<Box sx={{ px: 1.5, py: 0.5, bgcolor: 'action.hover', borderRadius: 2 }}>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'text.secondary' }}>
							{myTasks.length} ASSIGNED
						</Typography>
					</Box>
				</Stack>

				<TaskBoard tasks={myTasks} isLoading={isLoading} />
			</Box>

			<Box sx={{ mt: 6 }}>
				<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
					My Maintenance Schedules
				</Typography>
				<Grid container spacing={3}>
					<CompleteMaintenanceDialog
						open={!!selectedOccurrence}
						onClose={() => setSelectedOccurrence(null)}
						occurrence={selectedOccurrence}
					/>
					<Grid item xs={12} lg={6}>
						<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
							<Typography sx={{ fontWeight: 700, mb: 1.5, color: 'warning.main' }}>
								Pending
							</Typography>
							<RtmDataGrid
								rows={pendingSchedules.map((item) => ({
									id: item.id,
									occurrence: item,
									title: item.schedule?.title || '-',
									target:
										item.schedule?.targetScope === 'SUBSECTION' && item.schedule?.subsection
											? `${item.schedule.subsection.code} (${item.schedule.subsection.name})`
											: item.schedule?.station
												? `${item.schedule.station.name} (${item.schedule.station.code})`
												: '-',
									dueDate: item.dueDate,
									status: item.status,
									joint: item.schedule?.isJointSchedule ? 'Joint' : 'Regular',
								}))}
								columns={[
									{ field: 'title', headerName: 'Schedule', flex: 1.2 },
									{ field: 'target', headerName: 'Target', flex: 1 },
									{ field: 'joint', headerName: 'Type', flex: 0.8 },
									{
										field: 'dueDate',
										headerName: 'Due',
										flex: 0.9,
										renderCell: (params) => new Date(params.value).toLocaleDateString('en-IN'),
									},
									{ field: 'status', headerName: 'Status', flex: 0.8 },
									{
										field: 'actions',
										headerName: 'Actions',
										flex: 0.7,
										sortable: false,
										filterable: false,
										renderCell: (params) => (
											<Tooltip title="Mark as completed">
												<IconButton
													size="small"
													onClick={() => setSelectedOccurrence(params.row.occurrence)}
													sx={(theme) => ({
														bgcolor: `${theme.palette.success.main}1f`,
														color: theme.palette.success.main,
													})}
												>
													<CheckCircle fontSize="small" />
												</IconButton>
											</Tooltip>
										),
									},
								]}
								loading={maintLoading}
								hideFooter
								rowHeight={56}
							/>
						</Paper>
					</Grid>
					<Grid item xs={12} lg={6}>
						<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
							<Typography sx={{ fontWeight: 700, mb: 1.5, color: 'success.main' }}>
								Completed
							</Typography>
							<RtmDataGrid
								rows={completedSchedules.map((item) => ({
									id: item.id,
									title: item.schedule?.title || '-',
									target:
										item.schedule?.targetScope === 'SUBSECTION' && item.schedule?.subsection
											? `${item.schedule.subsection.code} (${item.schedule.subsection.name})`
											: item.schedule?.station
												? `${item.schedule.station.name} (${item.schedule.station.code})`
												: '-',
									completedAt: item.completedAt,
									remarks: item.remarks || '-',
									jointPerson: item.jointDoneWithName || '-',
								}))}
								columns={[
									{ field: 'title', headerName: 'Schedule', flex: 1 },
									{ field: 'target', headerName: 'Target', flex: 1 },
									{
										field: 'completedAt',
										headerName: 'Completed On',
										flex: 0.9,
										renderCell: (params) =>
											params.value ? new Date(params.value).toLocaleDateString('en-IN') : '-',
									},
									{ field: 'jointPerson', headerName: 'Joint With', flex: 0.9 },
									{ field: 'remarks', headerName: 'Remarks', flex: 1 },
								]}
								loading={maintLoading}
								hideFooter
								rowHeight={56}
							/>
						</Paper>
					</Grid>
				</Grid>
			</Box>
		</Box>
	);
}
