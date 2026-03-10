// src/app/field-engineer/projects-tasks/page.jsx
'use client';

import { Assignment, FolderSpecial, Timer } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useTabs } from '@/hooks/common';
import RtmTabs from '@/lib/common/tabs';

export default function ProjectsTasksPage() {
	const { currentTab } = useTabs('fieldProjectsTasks', { currentTab: 'daily' });

	const tabs = [
		{ label: 'Daily Tasks', step: 'daily', icon: <Assignment sx={{ fontSize: 18 }} /> },
		{ label: 'Major Projects', step: 'projects', icon: <FolderSpecial sx={{ fontSize: 18 }} /> },
		{ label: 'Completed', step: 'completed', icon: <Timer sx={{ fontSize: 18 }} /> },
	];

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

			<RtmTabs tabs={tabs} tabsName="fieldProjectsTasks" initialState={{ currentTab: 'daily' }} />

			<Box
				sx={{
					bgcolor: 'background.paper',
					borderRadius: 4,
					border: '1px solid',
					borderColor: 'divider',
					minHeight: '60vh',
				}}
			>
				{currentTab === 'daily' && (
					<Box sx={{ p: 2 }}>
						{/* Component to list specific tasks with "Start Work" buttons */}
						<div>test</div>
					</Box>
				)}
				{currentTab === 'projects' && (
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
