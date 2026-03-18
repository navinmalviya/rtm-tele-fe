'use client';

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
	Typography,
} from '@mui/material';
import RtmLoadingButton from '@/lib/common/loading-button';

export default function DeleteStationDialog({ open, station, onClose, onConfirm, isLoading }) {
	if (!station) return null;

	const stationCode = station.code || station.data?.code || '-';
	const stationName = station.name || station.data?.label || '-';

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ fontWeight: 800 }}>Delete Station</DialogTitle>
			<DialogContent>
				<Stack spacing={1}>
					<Typography sx={{ color: 'text.secondary' }}>
						You are about to delete <strong>{stationName}</strong> ({stationCode}).
					</Typography>
					<Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
						This action is permanent. If dependent locations, racks, or equipment exist, deletion
						may be blocked.
					</Typography>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700 }}>
					Cancel
				</Button>
				<RtmLoadingButton
					variant="contained"
					color="error"
					onClick={onConfirm}
					loading={isLoading}
					loadingText="Deleting..."
					sx={{ textTransform: 'none', fontWeight: 800 }}
				>
					Delete
				</RtmLoadingButton>
			</DialogActions>
		</Dialog>
	);
}
