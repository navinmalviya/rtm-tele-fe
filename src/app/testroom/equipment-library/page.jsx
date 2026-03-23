'use client';

import { Add, FilterList, Search, SettingsInputComponent } from '@mui/icons-material';
import { Box, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDeleteEquipmentTemplate } from '@/hooks/eqiuipment-templates';
import { useDeletePortTemplate } from '@/hooks/port-templates';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import {
	AddEquipmentTemplateDrawer,
	DeleteEquipmentTemplateDialog,
	EditEquipmentTemplateDrawer,
	EquipmentTemplateTable,
} from '@/modules/equipment-templates';
import {
	AddPortTemplateDrawer,
	DeletePortTemplateDialog,
	EditPortTemplateDrawer,
	PortTemplateTable,
} from '@/modules/port-templates';
import { useTabs } from '@/hooks/common';
import RtmTabs from '@/lib/common/tabs';

export default function EquipmentLibraryPage() {
	const dispatch = useDispatch();
	const { currentTab } = useTabs('equipmentLibrary', { currentTab: 'equipment-templates' });
	const [editingTemplate, setEditingTemplate] = useState(null);
	const [deleteTemplate, setDeleteTemplate] = useState(null);
	const { mutate: deleteEquipmentTemplate, isLoading: deletingTemplate } = useDeleteEquipmentTemplate();
	const [editingPortTemplate, setEditingPortTemplate] = useState(null);
	const [deletePortTemplate, setDeletePortTemplate] = useState(null);
	const { mutate: deletePortTemplateApi, isLoading: deletingPortTemplate } = useDeletePortTemplate();

	const tabs = [
		{ label: 'Equipment Templates', step: 'equipment-templates', icon: <SettingsInputComponent /> },
		{ label: 'Port Templates', step: 'port-templates', icon: <SettingsInputComponent /> },
	];

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				bgcolor: 'background.default',
			}}
		>
			{/* Header Area */}
			<Box
				sx={{
					px: 4,
					pt: 3,
					bgcolor: 'background.paper',
					borderBottom: '1px solid',
					borderColor: 'divider',
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
									color: 'primary.main',
									fontSize: 28,
								}}
							/>
							<Typography
								variant="h4"
								sx={{
									fontWeight: 800,
									color: 'text.primary',
									letterSpacing: '-0.02em',
								}}
							>
								Templates
							</Typography>
						</Stack>
						<Typography
							variant="body2"
							sx={{
								color: 'text.secondary',
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
										currentTab === 'equipment-templates'
											? 'addTemplateDrawer'
											: 'addPortTemplateDrawer',
								})
							)
						}
						sx={{
							bgcolor: 'primary.main',
							borderRadius: 2,
							textTransform: 'none',
							fontWeight: 700,
							px: 3,
							py: 1,
							'&:hover': { bgcolor: 'primary.dark' },
						}}
					>
						{currentTab === 'equipment-templates'
							? 'Create Equipment Template'
							: 'Create Port Type'}
					</Button>
				</Stack>

				{/* Navigation Tabs */}
				<RtmTabs
					tabs={tabs}
					tabsName="equipmentLibrary"
					initialState={{ currentTab: 'equipment-templates' }}
				/>
			</Box>

			{/* Filter Bar */}
			<Box sx={{ px: 4, py: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
				<TextField
					placeholder={
						currentTab === 'equipment-templates'
							? 'Search equipment...'
							: 'Search port types...'
					}
					size="small"
					sx={{
						width: 320,
						bgcolor: 'background.paper',
						'& .MuiOutlinedInput-root': { borderRadius: 2 },
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search
									sx={{
										color: 'text.disabled',
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
						color: 'text.secondary',
						borderColor: 'divider',
						textTransform: 'none',
						fontWeight: 600,
						'&:hover': {
							borderColor: 'text.disabled',
							bgcolor: 'background.paper',
						},
					}}
				>
					Filters
				</Button>
			</Box>

			{/* Table Area */}
			<Box sx={{ flex: 1, px: 4, pb: 4 }}>
				{currentTab === 'equipment-templates' ? (
					<EquipmentTemplateTable
						onEdit={(template) => {
							setEditingTemplate(template);
							dispatch(openDrawer({ drawerName: 'editEquipmentTemplateDrawer' }));
						}}
						onDelete={(template) => setDeleteTemplate(template)}
					/>
				) : (
					<PortTemplateTable
						onEdit={(template) => {
							setEditingPortTemplate(template);
							dispatch(openDrawer({ drawerName: 'editPortTemplateDrawer' }));
						}}
						onDelete={(template) => setDeletePortTemplate(template)}
					/>
				)}
			</Box>

			{/* Drawers */}
			<AddEquipmentTemplateDrawer />
			<EditEquipmentTemplateDrawer template={editingTemplate} />
			<DeleteEquipmentTemplateDialog
				open={!!deleteTemplate}
				template={deleteTemplate}
				isLoading={deletingTemplate}
				onClose={() => setDeleteTemplate(null)}
				onConfirm={() => {
					if (!deleteTemplate?.id) return;
					deleteEquipmentTemplate(deleteTemplate.id, {
						onSuccess: () => setDeleteTemplate(null),
					});
				}}
			/>
			{/* You'll likely need a separate drawer for individual Port Type definitions */}
			<AddPortTemplateDrawer />
			<EditPortTemplateDrawer template={editingPortTemplate} />
			<DeletePortTemplateDialog
				open={!!deletePortTemplate}
				template={deletePortTemplate}
				isLoading={deletingPortTemplate}
				onClose={() => setDeletePortTemplate(null)}
				onConfirm={() => {
					if (!deletePortTemplate?.id) return;
					deletePortTemplateApi(deletePortTemplate.id, {
						onSuccess: () => setDeletePortTemplate(null),
					});
				}}
			/>
		</Box>
	);
}
