'use client';

import { AccountTree, LinearScale, Place, SettingsSuggest } from '@mui/icons-material';
import { Box, Button, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { AddSectionForm, SectionTable } from '@/modules/sections';
// Sub-components
import { AddStationForm, StationTable } from '@/modules/stations';
import { AddSubSectionForm, SubSectionTable } from '@/modules/sub-sections';

export default function HierarchyManagementPage() {
	const dispatch = useDispatch();
	const [tabValue, setTabValue] = useState(0);

	const tabActions = {
		0: { label: 'Add Station', icon: <Place />, drawer: 'addStationDrawer' },
		1: { label: 'Add Sub-section', icon: <LinearScale />, drawer: 'addSubSectionDrawer' },
		2: { label: 'Add Main Section', icon: <AccountTree />, drawer: 'addSectionDrawer' },
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
					<Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, display: 'flex' }}>
						<SettingsSuggest sx={{ color: 'text.secondary' }} />
					</Box>
					<Box>
						<Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
							Division Hierarchy
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
							Ratlam Division • Asset Mapping
						</Typography>
					</Box>
				</Stack>
				<Button
					variant="contained"
					startIcon={currentAction.icon}
					onClick={() => dispatch(openDrawer({ drawerName: currentAction.drawer }))}
					sx={{
						bgcolor: 'primary.main',
						borderRadius: 2.5,
						fontWeight: 800,
						textTransform: 'none',
						'&:hover': { bgcolor: 'primary.dark' },
					}}
				>
					{currentAction.label}
				</Button>
			</Box>

			{/* Tabs */}
			<Box sx={{ px: 3, bgcolor: 'background.paper' }}>
				<Tabs
					value={tabValue}
					onChange={(_, val) => setTabValue(val)}
					sx={{ '& .MuiTab-root': { fontWeight: 700 } }}
				>
					<Tab icon={<Place sx={{ fontSize: 18 }} />} iconPosition="start" label="Stations" />
					<Tab
						icon={<LinearScale sx={{ fontSize: 18 }} />}
						iconPosition="start"
						label="Sub-sections"
					/>
					<Tab icon={<AccountTree sx={{ fontSize: 18 }} />} iconPosition="start" label="Sections" />
				</Tabs>
				<Divider />
			</Box>

			{/* Tables Area */}
			<Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
				<AddStationForm />
				<AddSubSectionForm />
				<AddSectionForm />

				<Box
					sx={{
						bgcolor: 'background.paper',
						borderRadius: 3,
						border: '1px solid',
						borderColor: 'divider',
						overflow: 'hidden',
					}}
				>
					{tabValue === 0 && <StationTable />}
					{tabValue === 1 && <SubSectionTable />}
					{tabValue === 2 && <SectionTable />}
				</Box>
			</Box>
		</Box>
	);
}
