'use client';

import { Add, FilterList, Search, SettingsInputComponent } from '@mui/icons-material';
import {
	Box,
	Button,
	InputAdornment,
	Stack,
	Tab,
	Tabs,
	TextField,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { AddEquipmentTemplateDrawer, EquipmentTemplateTable } from '@/modules/equipment-templates';
import { AddPortTemplateDrawer, PortTemplateTable } from '@/modules/port-templates';

export default function EquipmentLibraryPage() {
	const dispatch = useDispatch();
	const [activeTab, setActiveTab] = useState(0);

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				bgcolor: '#F8FAFC',
			}}
		>
			{/* Header Area */}
			<Box
				sx={{
					px: 4,
					pt: 3,
					bgcolor: 'white',
					borderBottom: '1px solid #F1F5F9',
				}}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					sx={{ mb: 2 }}
				>
					<Box>
						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
						>
							<SettingsInputComponent
								sx={{
									color: '#3B82F6',
									fontSize: 28,
								}}
							/>
							<Typography
								variant="h4"
								sx={{
									fontWeight: 800,
									color: '#1E293B',
									letterSpacing: '-0.02em',
								}}
							>
								Templates
							</Typography>
						</Stack>
						<Typography
							variant="body2"
							sx={{
								color: '#64748B',
								mt: 0.5,
								fontWeight: 500,
							}}
						>
							Define standardized hardware blueprints and
							connection interface specifications.
						</Typography>
					</Box>
					<Button
						variant="contained"
						disableElevation
						startIcon={<Add />}
						onClick={() =>
							dispatch(
								openDrawer({
									// You can dynamically change the drawer based on tab if needed
									drawerName:
										activeTab === 0
											? 'addTemplateDrawer'
											: 'addPortTemplateDrawer',
								})
							)
						}
						sx={{
							bgcolor: '#3B82F6',
							borderRadius: 2,
							textTransform: 'none',
							fontWeight: 700,
							px: 3,
							py: 1,
							'&:hover': { bgcolor: '#2563EB' },
						}}
					>
						{activeTab === 0
							? 'Create Equipment Template'
							: 'Create Port Type'}
					</Button>
				</Stack>

				{/* Navigation Tabs */}
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					sx={{
						'& .MuiTab-root': {
							textTransform: 'none',
							fontWeight: 700,
							fontSize: '0.95rem',
							minWidth: 160,
							color: '#64748B',
						},
						'& .Mui-selected': {
							color: '#3B82F6 !important',
						},
						'& .MuiTabs-indicator': {
							height: 3,
							borderRadius: '3px 3px 0 0',
							bgcolor: '#3B82F6',
						},
					}}
				>
					<Tab label="Equipment Templates" />
					<Tab label="Port Templates" />
				</Tabs>
			</Box>

			{/* Filter Bar */}
			<Box sx={{ px: 4, py: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
				<TextField
					placeholder={
						activeTab === 0
							? 'Search equipment...'
							: 'Search port types...'
					}
					size="small"
					sx={{
						width: 320,
						bgcolor: 'white',
						'& .MuiOutlinedInput-root': { borderRadius: 2 },
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search
									sx={{
										color: '#94A3B8',
										fontSize: 20,
									}}
								/>
							</InputAdornment>
						),
					}}
				/>
				<Button
					variant="outlined"
					startIcon={<FilterList />}
					sx={{
						borderRadius: 2,
						color: '#64748B',
						borderColor: '#E2E8F0',
						textTransform: 'none',
						fontWeight: 600,
						'&:hover': {
							borderColor: '#CBD5E1',
							bgcolor: 'white',
						},
					}}
				>
					Filters
				</Button>
			</Box>

			{/* Table Area */}
			<Box sx={{ flex: 1, px: 4, pb: 4 }}>
				<Box
					sx={{
						bgcolor: 'white',
						borderRadius: 4,
						boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
						border: '1px solid #F1F5F9',
						overflow: 'hidden',
						height: '100%',
					}}
				>
					{activeTab === 0 ? (
						<EquipmentTemplateTable />
					) : (
						<PortTemplateTable />
					)}
				</Box>
			</Box>

			{/* Drawers */}
			<AddEquipmentTemplateDrawer />
			{/* You'll likely need a separate drawer for individual Port Type definitions */}
			<AddPortTemplateDrawer />
		</Box>
	);
}
