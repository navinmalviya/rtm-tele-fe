'use client';

import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useCompleteMaintenance } from '@/hooks/maintenance';

export default function CompleteMaintenanceDialog({ open, onClose, occurrence }) {
	const { mutate: complete, isLoading } = useCompleteMaintenance();
	const { register, handleSubmit, reset } = useForm({
		defaultValues: { remarks: '', proofUrls: '' },
	});

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = (data) => {
		const payload = {
			remarks: data.remarks || null,
			proofUrls: data.proofUrls
				? data.proofUrls.split(',').map((item) => item.trim()).filter(Boolean)
				: [],
		};
		complete({ occurrenceId: occurrence?.id, payload });
		reset();
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Box>
					<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>Mark Maintenance Complete</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary' }}>
						{occurrence?.schedule?.title || 'Maintenance item'}
					</Typography>
				</Box>
				<IconButton onClick={handleClose} sx={{ bgcolor: 'action.hover' }}>
					<Close fontSize="small" />
				</IconButton>
			</DialogTitle>
			<Divider />
			<DialogContent sx={{ pt: 3 }}>
				<Stack spacing={2} component="form" id="complete-maintenance-form" onSubmit={handleSubmit(onSubmit)}>
					<TextField
						label="Completion Remarks"
						multiline
						rows={3}
						{...register('remarks')}
					/>
					<TextField
						label="Proof URLs (comma separated)"
						placeholder="https://... , https://..."
						{...register('proofUrls')}
					/>
				</Stack>
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3 }}>
					<Button variant="outlined" onClick={handleClose} sx={{ textTransform: 'none', fontWeight: 700 }}>
						Cancel
					</Button>
					<Button
						variant="contained"
						type="submit"
						form="complete-maintenance-form"
						disabled={isLoading}
						sx={{ textTransform: 'none', fontWeight: 800 }}
					>
						Mark Completed
					</Button>
				</Box>
			</DialogContent>
		</Dialog>
	);
}
