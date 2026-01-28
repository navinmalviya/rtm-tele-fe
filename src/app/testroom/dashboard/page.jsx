// src/app/testroom/dashboard/page.jsx

import { BugReport, Construction, Warning } from '@mui/icons-material';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import StatCard from '@/lib/common/stat-card';
import TicketBoard from '@/lib/common/ticket-board';

export default function DashboardPage() {
	return (
		<Box sx={{ bgcolor: 'transparent', p: 4 }}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ mb: 4 }}
			>
				<Typography variant="h4" sx={{ fontWeight: 800 }}>
					Overview
				</Typography>
				<Button
					variant="contained"
					disableElevation
					sx={{ borderRadius: 2 }}
				>
					+ Create Ticket
				</Button>
			</Stack>

			<Grid container spacing={3} justifyContent="space-between">
				<Grid size={{ xs: 12, md: 4 }} flexGrow={1}>
					<StatCard
						label="Pending Inspections"
						value="41"
						trend="+3%"
						icon={<Warning />}
						color="#3B82F6"
					/>
				</Grid>
				<Grid size={{ xs: 12, md: 4 }} flexGrow={1}>
					<StatCard
						label="Due Cable Testing"
						value="81"
						trend="+2%"
						icon={<Construction />}
						color="#10B981"
					/>
				</Grid>
				<Grid size={{ xs: 12, md: 4 }} flexGrow={1}>
					<StatCard
						label="Due Socket Testing"
						value="12"
						trend="LATE"
						icon={<BugReport />}
						color="#F43F5E"
					/>
				</Grid>
			</Grid>

			<Box sx={{ mt: 6 }}>
				<Typography variant="h6" sx={{ fontWeight: 800, color: '#172B4D' }}>
					Active Faults
				</Typography>
				<TicketBoard />
			</Box>
		</Box>
	);
}
