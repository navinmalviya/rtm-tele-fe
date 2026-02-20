import { Box, Typography } from '@mui/material';

export default function Page() {
	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h5" sx={{ fontWeight: 800 }}>
				IR‑TMMS
			</Typography>
			<Typography sx={{ mt: 1, color: 'text.secondary' }}>
				This dashboard is reserved for your role. Module pages will be added here.
			</Typography>
		</Box>
	);
}
