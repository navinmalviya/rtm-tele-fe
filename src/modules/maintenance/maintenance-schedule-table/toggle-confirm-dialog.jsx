'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

export default function ConfirmToggleDialog({ open, schedule, onClose, onConfirm }) {
	if (!schedule) return null;
	const nextState = schedule.status === 'ACTIVE' ? 'pause' : 'resume';

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ fontWeight: 800 }}>
				{nextState === 'pause' ? 'Pause Schedule' : 'Resume Schedule'}
			</DialogTitle>
			<DialogContent>
				<Typography sx={{ color: 'text.secondary' }}>
					{nextState === 'pause'
						? 'Pausing will stop reminders and overdue tracking for this schedule.'
						: 'Resuming will re-enable reminders and overdue tracking.'}
				</Typography>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700 }}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={onConfirm}
					sx={{ textTransform: 'none', fontWeight: 800, bgcolor: 'text.primary' }}
				>
					{nextState === 'pause' ? 'Pause' : 'Resume'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
