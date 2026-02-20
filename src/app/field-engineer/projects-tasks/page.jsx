// src/app/field-engineer/projects-tasks/page.jsx
'use client';

import { Assignment, FolderSpecial, Timer } from '@mui/icons-material';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';

export default function ProjectsTasksPage() {
	const [tabValue, setTabValue] = useState(0);

	return (
		<Box sx={{ p: 4 }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
					Execution Hub
				</Typography>
				<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
					Project milestones and daily maintenance targets
				</Typography>
			</Box>

			<Tabs
				value={tabValue}
				onChange={(_, v) => setTabValue(v)}
				sx={{
					mb: 3,
					'& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '0.9rem' },
				}}
			>
				<Tab icon={<Assignment sx={{ fontSize: 18 }} />} iconPosition="start" label="Daily Tasks" />
				<Tab
					icon={<FolderSpecial sx={{ fontSize: 18 }} />}
					iconPosition="start"
					label="Major Projects"
				/>
				<Tab icon={<Timer sx={{ fontSize: 18 }} />} iconPosition="start" label="Completed" />
			</Tabs>

			<Box
				sx={{
					bgcolor: 'background.paper',
					borderRadius: 4,
					border: '1px solid',
					borderColor: 'divider',
					minHeight: '60vh',
				}}
			>
				{tabValue === 0 && (
					<Box sx={{ p: 2 }}>
						{/* Component to list specific tasks with "Start Work" buttons */}
						<div>test</div>
					</Box>
				)}
				{tabValue === 1 && (
					<Box sx={{ p: 4, textAlign: 'center' }}>
						<Typography sx={{ color: 'text.disabled', fontWeight: 600 }}>
							No active infrastructure projects assigned.
						</Typography>
					</Box>
				)}
			</Box>
		</Box>
	);
}
