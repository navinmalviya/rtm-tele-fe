'use client';

import { Button, CircularProgress } from '@mui/material';

export default function RtmLoadingButton({
	loading = false,
	loadingText = 'Please wait...',
	disabled = false,
	children,
	startIcon,
	...rest
}) {
	return (
		<Button
			{...rest}
			disabled={disabled || loading}
			startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
		>
			{loading ? loadingText : children}
		</Button>
	);
}
