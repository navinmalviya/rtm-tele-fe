'use client';

import { Close } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useCableDetails } from '@/hooks/cable';
import { RtmDrawer } from '@/lib/common/layout';

export function CableDetailPanel({ cableId, onClose }) {
	const { data: cable, isLoading } = useCableDetails(cableId);

	if (isLoading || !cable) return null;

	return (
		<RtmDrawer drawerName="cableDetailPanel" isOpen={!!cableId}>
			<Box
				sx={{
					width: 420,
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: '#F8FAFC',
				}}
			>
				{/* Header Section */}
				<Box sx={{ p: 3, bgcolor: 'white', borderBottom: '1px solid #E2E8F0' }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>
								{cable.subType}
							</Typography>
							<Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
								Physical Core Mapping
							</Typography>
						</Box>
						<IconButton onClick={onClose} size="small" sx={{ bgcolor: '#F1F5F9' }}>
							<Close fontSize="small" />
						</IconButton>
					</Stack>

					<Grid container spacing={1.5} sx={{ mt: 2 }}>
						<StatItem label="Total Length" value={`${cable.length}m`} />
						<StatItem label="Track Side" value={cable.side} />
					</Grid>
				</Box>

				{/* Asset List Section */}
				<Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
					{cable.type === 'PIJF' ? (
						<QuadList pairs={cable.copperPairs} />
					) : (
						<FiberList fibers={cable.fibers} />
					)}
				</Box>
			</Box>
		</RtmDrawer>
	);
}

/**
 * Renders Fibers grouped by Buffer Tubes
 */
const FiberList = ({ fibers = [] }) => {
	const tubes = fibers.reduce((acc, fiber) => {
		if (!acc[fiber.tubeNo]) acc[fiber.tubeNo] = [];
		acc[fiber.tubeNo].push(fiber);
		return acc;
	}, {});

	return (
		<Stack spacing={2}>
			{Object.entries(tubes).map(([tNo, tFibers]) => (
				<Paper
					key={tNo}
					elevation={0}
					sx={{
						p: 2,
						borderRadius: 4,
						border: '1px solid #E2E8F0',
						bgcolor: 'white',
					}}
				>
					{/* Tube Header */}
					<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
						<Box
							sx={{
								width: 14,
								height: 14,
								borderRadius: '4px',
								bgcolor: tFibers[0]?.tubeColor || '#CBD5E1',
								border: '1px solid rgba(0,0,0,0.1)',
							}}
						/>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#1E293B' }}>
							TUBE {tNo}: {tFibers[0]?.tubeColor}
						</Typography>
					</Stack>

					<Grid container spacing={1}>
						{tFibers.map((fiber) => (
							<Grid item xs={6} key={fiber.id}>
								<Box
									sx={{
										p: 1.2,
										bgcolor: '#F8FAFC',
										borderRadius: 2.5,
										display: 'flex',
										alignItems: 'center',
										gap: 1.5,
										border: '1px solid #F1F5F9',
									}}
								>
									{/* Fiber Color Circle */}
									<Box
										sx={{
											width: 10,
											height: 10,
											borderRadius: '50%',
											bgcolor: fiber.fiberColor === 'Natural' ? '#F1F5F9' : fiber.fiberColor,
											border: '1px solid rgba(0,0,0,0.1)',
										}}
									/>
									<Box>
										<Typography
											sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#1E293B', lineHeight: 1 }}
										>
											F-{fiber.fiberNo}
										</Typography>
										<Typography sx={{ fontSize: '0.6rem', color: '#64748B', fontWeight: 600 }}>
											{fiber.fiberColor}
										</Typography>
									</Box>
								</Box>
							</Grid>
						))}
					</Grid>
				</Paper>
			))}
		</Stack>
	);
};

/**
 * Renders Pairs grouped by Quads
 */
const QuadList = ({ pairs = [] }) => {
	const quads = pairs.reduce((acc, pair) => {
		if (!acc[pair.quadNo]) acc[pair.quadNo] = [];
		acc[pair.quadNo].push(pair);
		return acc;
	}, {});

	return (
		<Stack spacing={2}>
			{Object.entries(quads).map(([qNo, qPairs]) => (
				<Paper
					key={qNo}
					elevation={0}
					sx={{ p: 2, borderRadius: 4, border: '1px solid #E2E8F0', bgcolor: 'white' }}
				>
					<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
						<Box
							sx={{
								width: 12,
								height: 12,
								borderRadius: '50%',
								bgcolor: qPairs[0]?.quadColor || '#CBD5E1',
								border: '1px solid rgba(0,0,0,0.1)',
							}}
						/>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#1E293B' }}>
							Quad {qNo} Identification
						</Typography>
					</Stack>

					<Stack spacing={1}>
						{qPairs.map((pair) => (
							<Box
								key={pair.id}
								sx={{
									p: 1.5,
									bgcolor: '#F8FAFC',
									borderRadius: 2,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									border: '1px solid #F1F5F9',
								}}
							>
								<Stack direction="row" spacing={2} alignItems="center">
									<Box
										sx={{
											px: 1,
											py: 0.2,
											borderRadius: 1,
											bgcolor: '#EFF6FF',
											border: '1px solid #DBEAFE',
										}}
									>
										<Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563EB' }}>
											P-{pair.pairNo}
										</Typography>
									</Box>
									<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
										{pair.pairColor}
									</Typography>
								</Stack>
								<Typography
									sx={{
										fontSize: '0.65rem',
										fontWeight: 800,
										color: pair.circuitName ? '#10B981' : '#94A3B8',
									}}
								>
									{pair.circuitName || 'SPARE'}
								</Typography>
							</Box>
						))}
					</Stack>
				</Paper>
			))}
		</Stack>
	);
};

const StatItem = ({ label, value }) => (
	<Grid item xs={6}>
		<Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
			<Typography
				sx={{
					fontSize: '0.6rem',
					fontWeight: 700,
					color: '#64748B',
					textTransform: 'uppercase',
					mb: 0.5,
				}}
			>
				{label}
			</Typography>
			<Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>
				{value}
			</Typography>
		</Box>
	</Grid>
);
