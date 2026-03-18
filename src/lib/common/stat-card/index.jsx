'use client';
import { Avatar, Box, Card, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export default function StatCard({ label, value, trend, icon, color }) {
	const theme = useTheme();
	const resolveColor = (value) => {
		if (!value) return theme.palette.primary.main;
		if (value.includes?.('.')) {
			const [section, shade] = value.split('.');
			return theme.palette[section]?.[shade] || value;
		}
		return value;
	};

	const trendColor = resolveColor(color);
	return (
		<Card
			sx={{
				borderRadius: 4,
				border: '1px solid',
				borderColor: 'divider',
				boxShadow: 1,
				bgcolor: 'background.paper',
				height: '100%', // Stretch to match sibling heights
			}}
		>
			<Box sx={{ p: 3 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Box>
						<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: 1 }}>
							{label}
						</Typography>
						<Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
							{value}
						</Typography>
						<Box
							component="span"
							sx={{
								display: 'inline-flex',
								alignItems: 'center',
								maxWidth: '100%',
								fontSize: '0.75rem',
								fontWeight: 700,
								px: 1,
								py: 0.3,
								borderRadius: 1,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								bgcolor: alpha(trendColor, 0.16),
								color: trendColor,
							}}
							title={trend}
						>
							{trend}
						</Box>
					</Box>
					<Avatar
						sx={{
							bgcolor: 'action.hover',
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
