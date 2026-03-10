'use client';

import { AddCircle, FilterAlt, Inventory2, PrecisionManufacturing, Warehouse } from '@mui/icons-material';
import { Box, Button, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAllEquipment } from '@/hooks/equipment';
import RtmTabs from '@/lib/common/tabs';
import { useTabs } from '@/hooks/common';
import EquipmentTable from '@/modules/equipments/equipment-table';
import RtmDataGrid from '@/lib/common/datagrid';
import { AddTnpDrawer, DeleteTnpDialog, EditTnpDrawer, TnpTable } from '@/modules/tnp';
import { useDeleteTnpItem } from '@/hooks/tnp';
import { useDispatch } from 'react-redux';
import { openDrawer } from '@/lib/store/slices/drawer-slice';

const EMPTY_COLUMNS = [
	{ field: 'name', headerName: 'ASSET NAME', flex: 1 },
	{ field: 'category', headerName: 'CATEGORY', flex: 1 },
	{ field: 'status', headerName: 'STATUS', flex: 0.6 },
];

const EMPTY_ROWS = [];

const FIELD_ROLES = ['FIELD_ENGINEER', 'JE_SSE_TELE_SECTIONAL', 'SSE_SECTIONAL', 'JE_SECTIONAL'];

export default function AssetsPage({ scope = 'testroom' }) {
	const { data: session } = useSession();
	const { currentTab } = useTabs(`${scope}-assets`, { currentTab: 'fixed' });
	const { data: equipment = [], isLoading } = useAllEquipment();
	const dispatch = useDispatch();
	const { mutate: deleteTnp, isLoading: deletingTnp } = useDeleteTnpItem();
	const [editingTnp, setEditingTnp] = useState(null);
	const [deleteTnpTarget, setDeleteTnpTarget] = useState(null);
	const [filters, setFilters] = useState({
		stationId: 'ALL',
		category: 'ALL',
		subCategory: 'ALL',
		status: 'ALL',
	});

	const isFieldScope = scope === 'field-engineer' || FIELD_ROLES.includes(session?.user?.role);

	const scopedEquipment = useMemo(() => {
		if (!isFieldScope) return equipment;
		const userId = session?.user?.id;
		if (!userId) return [];
		return equipment.filter((item) => item.createdById === userId || item.createdBy?.id === userId);
	}, [equipment, isFieldScope, session?.user?.id]);

	const stationOptions = useMemo(() => {
		const map = new Map();
		scopedEquipment.forEach((item) => {
			if (!item.station) return;
			map.set(item.stationId, `${item.station.name} (${item.station.code})`);
		});
		return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
	}, [scopedEquipment]);

	const categoryOptions = useMemo(() => {
		const set = new Set();
		scopedEquipment.forEach((item) => {
			if (item.template?.category) set.add(item.template.category);
		});
		return Array.from(set);
	}, [scopedEquipment]);

	const subCategoryOptions = useMemo(() => {
		const set = new Set();
		scopedEquipment.forEach((item) => {
			if (item.template?.subCategory) set.add(item.template.subCategory);
		});
		return Array.from(set);
	}, [scopedEquipment]);

	const statusOptions = useMemo(() => {
		const set = new Set();
		scopedEquipment.forEach((item) => {
			if (item.status) set.add(item.status);
		});
		return Array.from(set);
	}, [scopedEquipment]);

	const filteredEquipment = useMemo(() => {
		return scopedEquipment.filter((item) => {
			if (filters.stationId !== 'ALL' && item.stationId !== filters.stationId) return false;
			if (filters.category !== 'ALL' && item.template?.category !== filters.category) return false;
			if (filters.subCategory !== 'ALL' && item.template?.subCategory !== filters.subCategory) return false;
			if (filters.status !== 'ALL' && item.status !== filters.status) return false;
			return true;
		});
	}, [filters, scopedEquipment]);

	const handleFilterChange = (field) => (event) => {
		setFilters((prev) => ({ ...prev, [field]: event.target.value }));
	};

	const tabs = [
		{ label: 'Fixed Assets', step: 'fixed', icon: <Inventory2 sx={{ fontSize: 18 }} /> },
		{ label: 'T&P Items', step: 'tp', icon: <PrecisionManufacturing sx={{ fontSize: 18 }} /> },
		{ label: 'Spare Items', step: 'spares', icon: <Warehouse sx={{ fontSize: 18 }} /> },
	];

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
			<Box sx={{ px: 3, pt: 3, pb: 2, bgcolor: 'background.paper' }}>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 2, display: 'flex' }}>
						<Inventory2 sx={{ color: 'text.secondary' }} />
					</Box>
					<Box>
						<Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
							Asset Management
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
							{isFieldScope ? 'Field Engineer View' : 'Division Assets Overview'}
						</Typography>
					</Box>
				</Stack>
			</Box>

			<Box sx={{ px: 3, bgcolor: 'background.paper' }}>
				<RtmTabs tabs={tabs} tabsName={`${scope}-assets`} initialState={{ currentTab: 'fixed' }} />
			</Box>

			<Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
				{currentTab === 'fixed' && (
					<Stack spacing={2}>
						<Box
							sx={{
								bgcolor: 'background.paper',
								borderRadius: 3,
								border: '1px solid',
								borderColor: 'divider',
								p: 2,
							}}
						>
							<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
								<TextField
									select
									label="Station"
									value={filters.stationId}
									onChange={handleFilterChange('stationId')}
									size="small"
									sx={{ minWidth: 220 }}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FilterAlt sx={{ fontSize: 18, color: 'text.secondary' }} />
											</InputAdornment>
										),
									}}
								>
									<MenuItem value="ALL">All Stations</MenuItem>
									{stationOptions.map((station) => (
										<MenuItem key={station.id} value={station.id}>
											{station.label}
										</MenuItem>
									))}
								</TextField>

								<TextField
									select
									label="Equipment Type"
									value={filters.category}
									onChange={handleFilterChange('category')}
									size="small"
									sx={{ minWidth: 200 }}
								>
									<MenuItem value="ALL">All Types</MenuItem>
									{categoryOptions.map((value) => (
										<MenuItem key={value} value={value}>
											{value}
										</MenuItem>
									))}
								</TextField>

								<TextField
									select
									label="Sub Type"
									value={filters.subCategory}
									onChange={handleFilterChange('subCategory')}
									size="small"
									sx={{ minWidth: 200 }}
								>
									<MenuItem value="ALL">All Sub Types</MenuItem>
									{subCategoryOptions.map((value) => (
										<MenuItem key={value} value={value}>
											{value}
										</MenuItem>
									))}
								</TextField>

								<TextField
									select
									label="Status"
									value={filters.status}
									onChange={handleFilterChange('status')}
									size="small"
									sx={{ minWidth: 160 }}
								>
									<MenuItem value="ALL">All Status</MenuItem>
									{statusOptions.map((value) => (
										<MenuItem key={value} value={value}>
											{value}
										</MenuItem>
									))}
								</TextField>
							</Stack>
						</Box>

						<EquipmentTable equipments={filteredEquipment} isLoading={isLoading} />
					</Stack>
				)}

				{currentTab === 'tp' && (
					<Stack spacing={2}>
						<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								variant="contained"
								startIcon={<AddCircle />}
								onClick={() => dispatch(openDrawer({ drawerName: 'addTnpDrawer' }))}
								sx={{
									bgcolor: 'primary.main',
									textTransform: 'none',
									fontWeight: 800,
									borderRadius: 2,
								}}
							>
								Add T&P Item
							</Button>
						</Box>
						<TnpTable
							onEdit={(item) => {
								setEditingTnp(item);
								dispatch(openDrawer({ drawerName: 'editTnpDrawer' }));
							}}
							onDelete={(item) => setDeleteTnpTarget(item)}
						/>
					</Stack>
				)}

				{currentTab === 'spares' && (
					<RtmDataGrid
						rows={EMPTY_ROWS}
						columns={EMPTY_COLUMNS}
						hideFooter={false}
						pagination
						pageSizeOptions={[10, 25, 50]}
						initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
					/>
				)}
			</Box>

			<AddTnpDrawer />
			<EditTnpDrawer item={editingTnp} />
			<DeleteTnpDialog
				open={!!deleteTnpTarget}
				item={deleteTnpTarget}
				isLoading={deletingTnp}
				onClose={() => setDeleteTnpTarget(null)}
				onConfirm={() => {
					if (!deleteTnpTarget?.id) return;
					deleteTnp(deleteTnpTarget.id, { onSuccess: () => setDeleteTnpTarget(null) });
				}}
			/>
		</Box>
	);
}
