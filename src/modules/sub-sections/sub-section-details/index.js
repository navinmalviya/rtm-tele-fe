'use client';

import { Add, ViewInAr } from '@mui/icons-material';
import { Box, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useCablesBySubsection } from '@/hooks/sub-sections';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import AddCableDrawer from './AddCableDrawer';
import { CableDetailPanel } from './CableDetailPanel';
import { TrackLayout } from './TrackLayout';

export default function SubSectionDetails({ subsectionId }) {
	const theme = useTheme();
	const dispatch = useDispatch();
	const [selectedCableId, setSelectedCableId] = useState(null);
	console.log('selectedCableId', selectedCableId);
	const { data: cables, isLoading } = useCablesBySubsection(subsectionId);

	const handleAddCable = () => {
		dispatch(
			openDrawer({
				drawerName: 'addCableDrawer',
			})
		);
	};

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
				<CircularProgress size={32} sx={{ color: 'primary.main' }} />
			</Box>
		);
	}

	const upSideCables = cables?.filter((c) => c.side === 'UP') || [];
	const downSideCables = cables?.filter((c) => c.side === 'DOWN') || [];

	return (
		<Box
			sx={{ display: 'flex', height: 'calc(100vh - 64px)', bgcolor: 'background.default', overflow: 'hidden' }}
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
						{/* Legend Section */}
						<Paper
							elevation={0}
							sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}
						>
							<Stack direction="row" spacing={3}>
								<LegendItem color={theme.palette.primary.main} label="PIJF / Quad" />
								<LegendItem color={theme.palette.warning.main} label="OFC" />
							</Stack>
						</Paper>

						{/* Add Cable Button */}
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
		<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>{label}</Typography>
	</Stack>
);
