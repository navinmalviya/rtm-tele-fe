'use client';

import { Close } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
					bgcolor: 'background.default',
				}}
			>
				{/* Header Section */}
				<Box sx={{ p: 3, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
								{cable.subType}
							</Typography>
							<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
								Physical Core Mapping
							</Typography>
						</Box>
						<IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
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
						border: '1px solid',
						borderColor: 'divider',
						bgcolor: 'background.paper',
					}}
				>
					{/* Tube Header */}
					<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
						<Box
							sx={{
								width: 14,
								height: 14,
								borderRadius: '4px',
								bgcolor: (theme) => tFibers[0]?.tubeColor || theme.palette.divider,
								border: (theme) => `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
							}}
						/>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'text.primary' }}>
							TUBE {tNo}: {tFibers[0]?.tubeColor}
						</Typography>
					</Stack>

					<Grid container spacing={1}>
						{tFibers.map((fiber) => (
							<Grid item xs={6} key={fiber.id}>
								<Box
									sx={{
										p: 1.2,
										bgcolor: 'background.default',
										borderRadius: 2.5,
										display: 'flex',
										alignItems: 'center',
										gap: 1.5,
										border: '1px solid',
										borderColor: 'divider',
									}}
								>
									{/* Fiber Color Circle */}
									<Box
										sx={{
											width: 10,
											height: 10,
											borderRadius: '50%',
											bgcolor: (theme) =>
												fiber.fiberColor === 'Natural'
													? theme.palette.action.hover
													: fiber.fiberColor,
											border: (theme) => `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
										}}
									/>
									<Box>
										<Typography
											sx={{ fontSize: '0.7rem', fontWeight: 900, color: 'text.primary', lineHeight: 1 }}
										>
											F-{fiber.fiberNo}
										</Typography>
										<Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', fontWeight: 600 }}>
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
					sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
				>
					<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
						<Box
							sx={{
								width: 12,
								height: 12,
								borderRadius: '50%',
								bgcolor: (theme) => qPairs[0]?.quadColor || theme.palette.divider,
								border: (theme) => `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
							}}
						/>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'text.primary' }}>
							Quad {qNo} Identification
						</Typography>
					</Stack>

					<Stack spacing={1}>
						{qPairs.map((pair) => (
							<Box
								key={pair.id}
								sx={{
									p: 1.5,
									bgcolor: 'background.default',
									borderRadius: 2,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									border: '1px solid',
									borderColor: 'divider',
								}}
							>
								<Stack direction="row" spacing={2} alignItems="center">
									<Box
										sx={(theme) => ({
											px: 1,
											py: 0.2,
											borderRadius: 1,
											bgcolor: alpha(theme.palette.primary.main, 0.12),
											border: '1px solid',
											borderColor: alpha(theme.palette.primary.main, 0.2),
										})}
									>
										<Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'primary.main' }}>
											P-{pair.pairNo}
										</Typography>
									</Box>
									<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>
										{pair.pairColor}
									</Typography>
								</Stack>
								<Typography
									sx={{
										fontSize: '0.65rem',
										fontWeight: 800,
										color: pair.circuitName ? 'success.main' : 'text.disabled',
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
		<Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
			<Typography
				sx={{
					fontSize: '0.6rem',
					fontWeight: 700,
					color: 'text.secondary',
					textTransform: 'uppercase',
					mb: 0.5,
				}}
			>
				{label}
			</Typography>
			<Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: 'text.primary' }}>
				{value}
			</Typography>
		</Box>
	</Grid>
);
