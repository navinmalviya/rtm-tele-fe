'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';

export default function DeleteEquipmentTemplateDialog({ open, template, onClose, onConfirm, isLoading }) {
	if (!template) return null;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ fontWeight: 800 }}>Delete Template</DialogTitle>
			<DialogContent>
				<Stack spacing={1}>
					<Typography sx={{ color: 'text.secondary' }}>
						You are about to delete <strong>{template.modelName}</strong>.
					</Typography>
					<Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
						This will remove the blueprint. If the template is used by live devices, deletion will be blocked.
					</Typography>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700 }}>
					Cancel
				</Button>
				<Button
					variant="contained"
					color="error"
					onClick={onConfirm}
					disabled={isLoading}
					sx={{ textTransform: 'none', fontWeight: 800 }}
				>
					Delete
				</Button>
			</DialogActions>
		</Dialog>
	);
}
