'use client';

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from '@mui/material';
import RtmLoadingButton from '@/lib/common/loading-button';

export default function DeleteEscalationDialog({ open, row, onClose, onConfirm, isLoading }) {
	if (!row) return null;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ fontWeight: 800 }}>Delete Escalation Level</DialogTitle>
			<DialogContent>
				<Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
					You are about to delete escalation level <strong>L{row.level}</strong>. This action cannot
					be undone.
				</Typography>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}>
				<Button onClick={onClose} sx={{ fontWeight: 700, textTransform: 'none' }}>
					Cancel
				</Button>
				<RtmLoadingButton
					onClick={onConfirm}
					variant="contained"
					color="error"
					disableElevation
					loading={isLoading}
					loadingText="Deleting..."
					sx={{ fontWeight: 700, textTransform: 'none' }}
				>
					Delete
				</RtmLoadingButton>
			</DialogActions>
		</Dialog>
	);
}
