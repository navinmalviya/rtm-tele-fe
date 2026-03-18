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

export default function DeleteUserDialog({ open, user, onClose, onConfirm, isLoading }) {
	if (!user) return null;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ fontWeight: 800 }}>Delete User</DialogTitle>
			<DialogContent>
				<Stack spacing={1}>
					<Typography sx={{ color: 'text.secondary' }}>
						You are about to delete <strong>{user.name}</strong>.
					</Typography>
					<Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
						This will permanently remove the user and their access.
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
