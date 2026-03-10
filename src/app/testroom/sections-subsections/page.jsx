'use client';

import { AccountTree, LinearScale, Place, SettingsSuggest } from '@mui/icons-material';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useTabs } from '@/hooks/common';
import RtmTabs from '@/lib/common/tabs';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { AddSectionForm, SectionTable } from '@/modules/sections';
// Sub-components
import { AddStationForm, StationTable } from '@/modules/stations';
import { AddSubSectionForm, SubSectionTable } from '@/modules/sub-sections';

export default function HierarchyManagementPage() {
	const dispatch = useDispatch();
	const { currentTab } = useTabs('hierarchyHub', { currentTab: 'stations' });

	const tabActions = {
		stations: { label: 'Add Station', icon: <Place />, drawer: 'addStationDrawer' },
		subsections: { label: 'Add Sub-section', icon: <LinearScale />, drawer: 'addSubSectionDrawer' },
		sections: { label: 'Add Main Section', icon: <AccountTree />, drawer: 'addSectionDrawer' },
	};

	const currentAction = tabActions[currentTab] || tabActions.stations;

	const tabs = [
		{ label: 'Stations', step: 'stations', icon: <Place sx={{ fontSize: 18 }} /> },
		{ label: 'Sub-sections', step: 'subsections', icon: <LinearScale sx={{ fontSize: 18 }} /> },
		{ label: 'Sections', step: 'sections', icon: <AccountTree sx={{ fontSize: 18 }} /> },
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
				<RtmTabs tabs={tabs} tabsName="hierarchyHub" initialState={{ currentTab: 'stations' }} />
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
					{currentTab === 'stations' && <StationTable />}
					{currentTab === 'subsections' && <SubSectionTable />}
					{currentTab === 'sections' && <SectionTable />}
				</Box>
			</Box>
		</Box>
	);
}
