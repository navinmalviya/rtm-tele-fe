import { Cable } from '@mui/icons-material';
import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';

export const TrackLayout = ({ upCables, downCables, selectedId, onCableSelect }) => {
	return (
		<Stack spacing={4} sx={{ width: '100%' }}>
			<TrackSide
				label="UP Track Side"
				cables={upCables}
				selectedId={selectedId}
				onSelect={onCableSelect}
				position="top"
			/>

			{/* Rail Track Graphic */}
			<Box
				sx={{
					height: 50,
					width: '100%',
					bgcolor: '#1E293B',
					borderRadius: 4,
					position: 'relative',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<Box sx={{ position: 'absolute', top: 12, width: '100%', height: 3, bgcolor: '#475569' }} />
				<Box
					sx={{ position: 'absolute', bottom: 12, width: '100%', height: 3, bgcolor: '#475569' }}
				/>
				<Stack direction="row" justifyContent="space-around" sx={{ width: '100%', px: 4 }}>
					{[...Array(15)].map((_, i) => (
						<Box key={i} sx={{ width: 6, height: '100%', bgcolor: '#334155' }} />
					))}
				</Stack>
			</Box>

			<TrackSide
				label="Down Track Side"
				cables={downCables}
				selectedId={selectedId}
				onSelect={onCableSelect}
				position="bottom"
			/>
		</Stack>
	);
};

const TrackSide = ({ label, cables, selectedId, onSelect, position }) => (
	<Box
		sx={{
			minHeight: 150,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: 2,
			justifyContent: position === 'top' ? 'flex-end' : 'flex-start',
		}}
	>
		{position === 'bottom' && <SideLabel label={label} />}
		{cables.map((c) => (
			<ButtonBase
				key={c.id}
				onClick={() => onSelect(c.id)}
				sx={{ width: Math.min(Number(c.length) / 4, 800), minWidth: 200 }}
			>
				<Paper
					elevation={selectedId === c.id ? 4 : 0}
					sx={{
						width: '100%',
						p: 1,
						borderRadius: 3,
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						bgcolor: selectedId === c.id ? (c.type === 'OFC' ? '#F59E0B' : '#2563EB') : 'white',
						color: selectedId === c.id ? 'white' : 'inherit',
						border: '1px solid #E2E8F0',
					}}
				>
					<Cable sx={{ fontSize: 16 }} />
					<Box sx={{ textAlign: 'left' }}>
						<Typography sx={{ fontSize: '0.7rem', fontWeight: 800 }}>{c.subType}</Typography>
						<Typography sx={{ fontSize: '0.6rem', fontWeight: 600 }}>{c.length}m</Typography>
					</Box>
				</Paper>
			</ButtonBase>
		))}
		{position === 'top' && <SideLabel label={label} />}
	</Box>
);

const SideLabel = ({ label }) => (
	<Typography
		sx={{
			fontSize: '0.6rem',
			fontWeight: 900,
			color: '#94A3B8',
			letterSpacing: 2,
			textTransform: 'uppercase',
		}}
	>
		{label}
	</Typography>
);
