'use client';

import { Add, ViewInAr } from '@mui/icons-material';
import { Box, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useCablesBySubsection } from '@/hooks/sub-sections';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import AddCableDrawer from './AddCableDrawer';
import { CableDetailPanel } from './CableDetailPanel';
import { TrackLayout } from './TrackLayout';

export default function SubSectionDetails({ subsectionId }) {
	const dispatch = useDispatch();
	const [selectedCableId, setSelectedCableId] = useState(null);
	const { data: cables, isLoading } = useCablesBySubsection(subsectionId);

	const handleAddCable = () => {
		dispatch(
			openDrawer({
				drawerName: 'addCableDrawer',
				data: { subsectionId }, // Passing subsectionId to pre-fill the form
			})
		);
	};

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
				<CircularProgress size={32} sx={{ color: '#3B82F6' }} />
			</Box>
		);
	}

	const upSideCables = cables?.filter((c) => c.side === 'UP') || [];
	const downSideCables = cables?.filter((c) => c.side === 'DOWN') || [];

	return (
		<Box
			sx={{ display: 'flex', height: 'calc(100vh - 64px)', bgcolor: '#F8FAFC', overflow: 'hidden' }}
		>
			<AddCableDrawer />
			<Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="flex-start"
					sx={{ mb: 6 }}
				>
					<Box>
						<Typography
							variant="h5"
							sx={{
								fontWeight: 800,
								color: '#0F172A',
								display: 'flex',
								alignItems: 'center',
								gap: 1.5,
							}}
						>
							<ViewInAr sx={{ color: '#3B82F6' }} /> Subsection Track Layout
						</Typography>
						<Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
							Geographic distribution of cable assets
						</Typography>
					</Box>

					<Stack direction="row" spacing={2} alignItems="center">
						{/* Legend Section */}
						<Paper
							elevation={0}
							sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 3, bgcolor: 'white' }}
						>
							<Stack direction="row" spacing={3}>
								<LegendItem color="#2563EB" label="PIJF / Quad" />
								<LegendItem color="#F59E0B" label="OFC" />
							</Stack>
						</Paper>

						{/* Add Cable Button */}
						<Button
							variant="contained"
							startIcon={<Add />}
							onClick={handleAddCable}
							sx={{
								bgcolor: '#3B82F6',
								fontWeight: 700,
								textTransform: 'none',
								borderRadius: 2.5,
								px: 3,
								py: 1,
								boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
								'&:hover': {
									bgcolor: '#2563EB',
									boxShadow: '0 6px 16px rgba(59, 130, 246, 0.35)',
								},
							}}
						>
							Add Cable
						</Button>
					</Stack>
				</Stack>

				<Container maxWidth="lg">
					<TrackLayout
						upCables={upSideCables}
						downCables={downSideCables}
						selectedId={selectedCableId}
						onCableSelect={setSelectedCableId}
					/>
				</Container>
			</Box>

			{selectedCableId && (
				<CableDetailPanel cableId={selectedCableId} onClose={() => setSelectedCableId(null)} />
			)}
		</Box>
	);
}

const LegendItem = ({ color, label }) => (
	<Stack direction="row" spacing={1} alignItems="center">
		<Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: color }} />
		<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{label}</Typography>
	</Stack>
);
