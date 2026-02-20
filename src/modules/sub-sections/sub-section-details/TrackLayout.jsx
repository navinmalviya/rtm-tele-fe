import { Cable } from '@mui/icons-material';
import { Box, ButtonBase, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { openDrawer } from '@/lib/store/slices/drawer-slice';

export const TrackLayout = ({ upCables, downCables, selectedId, onCableSelect }) => {
	const theme = useTheme();
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
					bgcolor: theme.palette.grey[900],
					borderRadius: 4,
					position: 'relative',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<Box
					sx={{
						position: 'absolute',
						top: 12,
						width: '100%',
						height: 3,
						bgcolor: theme.palette.grey[700],
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						bottom: 12,
						width: '100%',
						height: 3,
						bgcolor: theme.palette.grey[700],
					}}
				/>
				<Stack direction="row" justifyContent="space-around" sx={{ width: '100%', px: 4 }}>
					{[...Array(15)].map((_, i) => (
						<Box key={i} sx={{ width: 6, height: '100%', bgcolor: theme.palette.grey[800] }} />
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

const TrackSide = ({ label, cables, selectedId, onSelect, position }) => {
	const theme = useTheme();
	const dispatch = useDispatch();
	return (
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
					onClick={() => {
						dispatch(openDrawer({ drawerName: 'cableDetailPanel' }));
						onSelect(c.id);
					}}
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
							bgcolor:
								selectedId === c.id
									? c.type === 'OFC'
										? theme.palette.warning.main
										: theme.palette.primary.main
									: 'background.paper',
							color: selectedId === c.id ? 'primary.contrastText' : 'inherit',
							border: '1px solid',
							borderColor: 'divider',
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
};

const SideLabel = ({ label }) => (
	<Typography
		sx={{
			fontSize: '0.6rem',
			fontWeight: 900,
			color: 'text.disabled',
			letterSpacing: 2,
			textTransform: 'uppercase',
		}}
	>
		{label}
	</Typography>
);
