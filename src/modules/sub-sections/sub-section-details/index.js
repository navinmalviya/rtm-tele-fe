'use client';

import { Add, Cable, North, South, ViewInAr } from '@mui/icons-material';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useCablesBySubsection } from '@/hooks/sub-sections';
import RtmLoader from '@/lib/common/loader';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import AddCableDrawer from './AddCableDrawer';
import AddJointDrawer, { ADD_CABLE_JOINT_DRAWER } from './AddJointDrawer';
import { CableDetailPanel } from './CableDetailPanel';
import EditCableDrawer from './EditCableDrawer';
import { TrackLayout } from './TrackLayout';

export default function SubSectionDetails({ subsectionId, routeBasePath = '/testroom' }) {
	const theme = useTheme();
	const router = useRouter();
	const dispatch = useDispatch();
	const [selectedCableId, setSelectedCableId] = useState(null);
	const [editingCableId, setEditingCableId] = useState(null);
	const [jointDrawerCableId, setJointDrawerCableId] = useState(null);
	const [jointDrawerType, setJointDrawerType] = useState('NORMAL');
	const { data: cables, isLoading } = useCablesBySubsection(subsectionId);

	const handleAddCable = () => {
		dispatch(
			openDrawer({
				drawerName: 'addCableDrawer',
			})
		);
	};

	if (isLoading) {
		return <RtmLoader label="Loading subsection cables..." minHeight={280} />;
	}

	const mappedCables = (cables || []).map((cable) => {
		const segmentSides = new Set((cable.sideSegments || []).map((segment) => segment.side));
		const hasSegments = segmentSides.size > 0;
		const hasUp = hasSegments ? segmentSides.has('UP') : cable.side === 'UP';
		const hasDown = hasSegments ? segmentSides.has('DOWN') : cable.side === 'DOWN';
		const sideLabel = hasSegments ? Array.from(segmentSides).sort().join(' / ') : cable.side;
		return { ...cable, hasUp, hasDown, sideLabel };
	});

	const totalCables = mappedCables.length;
	const upCount = mappedCables.filter((cable) => cable.hasUp).length;
	const downCount = mappedCables.filter((cable) => cable.hasDown).length;
	const editingCable = mappedCables.find((cable) => cable.id === editingCableId) || null;

	const handleViewCable = (cableId) => {
		setSelectedCableId(cableId);
		dispatch(openDrawer({ drawerName: 'cableDetailPanel' }));
	};

	const handleEditCable = (cableId) => {
		setEditingCableId(cableId);
		dispatch(openDrawer({ drawerName: 'editCableDrawer' }));
	};

	const handleOpenCablePage = (cableId) => {
		router.push(`${routeBasePath}/cable/${cableId}`);
	};

	const openJointDrawer = (cableId, type) => {
		setJointDrawerCableId(cableId);
		setJointDrawerType(type);
		dispatch(openDrawer({ drawerName: ADD_CABLE_JOINT_DRAWER }));
	};

	const closeJointDrawer = () => {
		setJointDrawerCableId(null);
		setJointDrawerType('NORMAL');
	};

	return (
		<Box
			sx={{
				display: 'flex',
				height: 'calc(100vh - 64px)',
				bgcolor: 'background.default',
				overflow: 'hidden',
			}}
		>
			<AddCableDrawer />
			<EditCableDrawer cable={editingCable} />
			<Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="flex-start"
					sx={{ mb: 4 }}
				>
					<Box>
						<Typography
							variant="h5"
							sx={{
								fontWeight: 800,
								color: 'text.primary',
								display: 'flex',
								alignItems: 'center',
								gap: 1.5,
							}}
						>
							<ViewInAr sx={{ color: 'primary.main' }} /> Subsection Track Layout
						</Typography>
						<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
							Geographic distribution of cable assets
						</Typography>
					</Box>

					<Stack direction="row" spacing={2} alignItems="center">
						<Paper
							elevation={0}
							sx={{
								p: 1.5,
								border: '1px solid',
								borderColor: 'divider',
								borderRadius: 3,
								bgcolor: 'background.paper',
							}}
						>
							<Stack direction="row" spacing={2}>
								<LegendItem color={theme.palette.primary.main} label="PIJF / Quad" />
								<LegendItem color={theme.palette.warning.main} label="OFC" />
								<LegendItem color={theme.palette.info.main} label="Segmented" />
							</Stack>
						</Paper>

						<Button
							variant="contained"
							startIcon={<Add />}
							onClick={handleAddCable}
							sx={{
								bgcolor: 'primary.main',
								fontWeight: 700,
								textTransform: 'none',
								borderRadius: 2.5,
								px: 3,
								py: 1,
								boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
								'&:hover': {
									bgcolor: 'primary.dark',
									boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
								},
							}}
						>
							Add Cable
						</Button>
					</Stack>
				</Stack>

				<Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 4 }}>
					<Paper
						elevation={0}
						sx={{
							flex: 1,
							p: 2.5,
							borderRadius: 3,
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
						}}
					>
						<Stack direction="row" spacing={2} alignItems="center">
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: 2,
									bgcolor: alpha(theme.palette.primary.main, 0.12),
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: 'primary.main',
								}}
							>
								<Cable />
							</Box>
							<Box>
								<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
									Total Cables
								</Typography>
								<Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: 'text.primary' }}>
									{totalCables}
								</Typography>
							</Box>
						</Stack>
					</Paper>

					<Paper
						elevation={0}
						sx={{
							flex: 1,
							p: 2.5,
							borderRadius: 3,
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
						}}
					>
						<Stack direction="row" spacing={2} alignItems="center">
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: 2,
									bgcolor: alpha(theme.palette.success.main, 0.12),
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: 'success.main',
								}}
							>
								<North />
							</Box>
							<Box>
								<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
									UP Side Coverage
								</Typography>
								<Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: 'text.primary' }}>
									{upCount}
								</Typography>
							</Box>
						</Stack>
					</Paper>

					<Paper
						elevation={0}
						sx={{
							flex: 1,
							p: 2.5,
							borderRadius: 3,
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: 'background.paper',
						}}
					>
						<Stack direction="row" spacing={2} alignItems="center">
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: 2,
									bgcolor: alpha(theme.palette.warning.main, 0.12),
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: 'warning.main',
								}}
							>
								<South />
							</Box>
							<Box>
								<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
									DOWN Side Coverage
								</Typography>
								<Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: 'text.primary' }}>
									{downCount}
								</Typography>
							</Box>
						</Stack>
					</Paper>
				</Stack>

				<Container maxWidth="lg">
					<TrackLayout
						cables={mappedCables}
						selectedId={selectedCableId}
						onCableSelect={setSelectedCableId}
						onViewCable={handleViewCable}
						onEditCable={handleEditCable}
						onOpenCablePage={handleOpenCablePage}
						onAddJoint={(cableId) => openJointDrawer(cableId, 'NORMAL')}
						onAddEcJoint={(cableId) => openJointDrawer(cableId, 'EC')}
					/>
				</Container>
			</Box>

			{selectedCableId && (
				<CableDetailPanel cableId={selectedCableId} onClose={() => setSelectedCableId(null)} />
			)}
			<AddJointDrawer
				cableId={jointDrawerCableId}
				jointType={jointDrawerType}
				onClose={closeJointDrawer}
			/>
		</Box>
	);
}

const LegendItem = ({ color, label }) => (
	<Stack direction="row" spacing={1} alignItems="center">
		<Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: color }} />
		<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
			{label}
		</Typography>
	</Stack>
);
