'use client';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export default function RtmLoader({
	label = 'Loading...',
	size = 24,
	variant = 'page',
	minHeight = 180,
	showLabel = true,
	sx = {},
}) {
	if (variant === 'inline') {
		return (
			<Stack direction="row" spacing={1} alignItems="center" sx={sx}>
				<CircularProgress size={size} />
				{showLabel ? (
					<Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.85rem' }}>
						{label}
					</Typography>
				) : null}
			</Stack>
		);
	}

	return (
		<Box
			sx={{
				minHeight,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 1.25,
				...sx,
			}}
		>
			<CircularProgress size={size} />
			{showLabel ? (
				<Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.9rem' }}>
					{label}
				</Typography>
			) : null}
		</Box>
	);
}
