'use client';

import { Close } from '@mui/icons-material';
import { Box, Grid, IconButton, Stack, Typography } from '@mui/material';
// import { useState } from 'react';
import { useCableDetails } from '@/hooks/cable';
import { RtmDrawer } from '@/lib/common/layout';

export function CableDetailPanel({ cableId, onClose }) {
	// const [tab, setTab] = useState(0);
	const { data: cable, isLoading } = useCableDetails(cableId);

	if (isLoading || !cable) return null;

	return (
		<RtmDrawer drawerName="cableDetailPanel" variant="persistent" anchor="right" isOpen={!!cableId}>
			<Box
				sx={{
					width: 400,
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: '#F8FAFC',
				}}
			>
				<Box sx={{ p: 3, bgcolor: 'white', borderBottom: '1px solid #E2E8F0' }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography variant="h6" sx={{ fontWeight: 800 }}>
							{cable.subType}
						</Typography>
						<IconButton onClick={onClose} size="small">
							<Close fontSize="small" />
						</IconButton>
					</Stack>
					<Grid container spacing={1} sx={{ mt: 2 }}>
						<StatItem label="Length" value={`${cable.length}m`} />
						<StatItem label="Side" value={cable.side} />
					</Grid>
				</Box>

				{/* <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
					{cable.type === 'OFC' ? (
						<FiberList fibers={cable.fibers} />
					) : (
						<QuadList pairs={cable.copperPairs} />
					)}
				</Box> */}
			</Box>
		</RtmDrawer>
	);
}

const StatItem = ({ label, value }) => (
	<Grid item xs={6}>
		<Box sx={{ p: 1, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
			<Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748B' }}>
				{label}
			</Typography>
			<Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>{value}</Typography>
		</Box>
	</Grid>
);
