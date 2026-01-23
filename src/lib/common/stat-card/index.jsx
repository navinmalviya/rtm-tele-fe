'use client';
import { Avatar, Box, Card, Stack, Typography } from '@mui/material';

export default function StatCard({ label, value, trend, icon, color }) {
	return (
		<Card
			sx={{
				borderRadius: 4,
				border: '1px solid #E2E8F0',
				boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
				bgcolor: 'white',
				height: '100%', // Stretch to match sibling heights
			}}
		>
			<Box sx={{ p: 3 }}>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Box>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ fontWeight: 700, mb: 1 }}
						>
							{label}
						</Typography>
						<Typography
							variant="h3"
							sx={{ fontWeight: 800, mb: 1 }}
						>
							{value}
						</Typography>
						<Box
							component="span"
							sx={{
								fontSize: '0.75rem',
								fontWeight: 700,
								px: 1,
								py: 0.3,
								borderRadius: 1,
								bgcolor: `${color}15`,
								color: color,
							}}
						>
							{trend}
						</Box>
					</Box>
					<Avatar
						sx={{
							bgcolor: '#F1F5F9',
							color: 'text.secondary',
							width: 56,
							height: 56,
						}}
					>
						{icon}
					</Avatar>
				</Stack>
			</Box>
		</Card>
	);
}
