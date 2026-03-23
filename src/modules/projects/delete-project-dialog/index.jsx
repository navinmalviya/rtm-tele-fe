'use client';

import { DeleteOutline, WarningAmber } from '@mui/icons-material';
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

export default function DeleteProjectDialog({ open, project, onClose, onConfirm, isLoading }) {
	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
			<DialogTitle>
				<Stack direction="row" spacing={1} alignItems="center">
					<WarningAmber color="error" />
					<Typography sx={{ fontWeight: 800 }}>Delete Project</Typography>
				</Stack>
			</DialogTitle>
			<DialogContent>
				<Typography sx={{ color: 'text.secondary' }}>
					Delete <strong>{project?.name || 'this project'}</strong> and its linked tasks?
				</Typography>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose}>Cancel</Button>
				<RtmLoadingButton
					variant="contained"
					color="error"
					loading={isLoading}
					loadingText="Deleting..."
					startIcon={<DeleteOutline />}
					onClick={onConfirm}
				>
					Delete
				</RtmLoadingButton>
			</DialogActions>
		</Dialog>
	);
}
