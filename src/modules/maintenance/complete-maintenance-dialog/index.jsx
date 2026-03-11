'use client';

import { Close } from '@mui/icons-material';
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useInspectionForm } from '@/hooks/maintenance';
import { useCompleteMaintenance } from '@/hooks/maintenance/useCompleteMaintenance';

const buildFieldName = (stationCircuitId, key) => `circuit_${stationCircuitId}__${key}`;

const parseFieldValue = (type, value) => {
	if (type === 'NUMBER') {
		if (value === '' || value === null || value === undefined) return null;
		const parsed = Number.parseFloat(value);
		return Number.isNaN(parsed) ? null : parsed;
	}
	if (type === 'BOOLEAN') {
		if (value === true || value === 'true') return true;
		if (value === false || value === 'false') return false;
		return null;
	}
	if (value === '' || value === undefined) return null;
	return value;
};

export default function CompleteMaintenanceDialog({ open, onClose, occurrence }) {
	const { mutate: complete, isLoading } = useCompleteMaintenance();
	const {
		data: inspectionForm,
		isLoading: loadingInspectionForm,
		isFetching: fetchingInspectionForm,
	} = useInspectionForm(occurrence?.id, open);
	const { register, handleSubmit, reset } = useForm({
		defaultValues: {
			remarks: '',
			proofUrls: '',
			jointDoneWithName: '',
			jointDoneWithDesignation: '',
			jointDoneWithDepartment: '',
		},
	});

	const inspectionSections = inspectionForm?.sections || [];
	const existingResponseMap = useMemo(() => {
		const rows = inspectionForm?.existingResponses || [];
		return new Map(rows.map((row) => [row.stationCircuitId, row.values || {}]));
	}, [inspectionForm]);

	useEffect(() => {
		if (!open) return;
		const defaults = {
			remarks: '',
			proofUrls: '',
			jointDoneWithName: '',
			jointDoneWithDesignation: '',
			jointDoneWithDepartment: occurrence?.schedule?.jointDepartment || '',
		};

		for (const section of inspectionSections) {
			const existingValues = existingResponseMap.get(section.stationCircuitId) || {};
			for (const field of section.fields || []) {
				const fieldName = buildFieldName(section.stationCircuitId, field.key);
				const value = existingValues[field.key];
				if (value === undefined || value === null) {
					defaults[fieldName] = field.type === 'BOOLEAN' ? '' : '';
				} else if (field.type === 'BOOLEAN') {
					defaults[fieldName] = value ? 'true' : 'false';
				} else {
					defaults[fieldName] = value;
				}
			}
		}

		reset(defaults);
	}, [existingResponseMap, inspectionSections, occurrence, open, reset]);

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = (data) => {
		const dynamicResponses = inspectionSections.map((section) => {
			const values = {};
			for (const field of section.fields || []) {
				const fieldName = buildFieldName(section.stationCircuitId, field.key);
				values[field.key] = parseFieldValue(field.type, data[fieldName]);
			}
			return {
				stationCircuitId: section.stationCircuitId,
				values,
			};
		});

		const payload = {
			remarks: data.remarks || null,
			proofUrls: data.proofUrls
				? data.proofUrls
						.split(',')
						.map((item) => item.trim())
						.filter(Boolean)
				: [],
			jointDoneWithName: occurrence?.schedule?.isJointSchedule
				? data.jointDoneWithName || null
				: null,
			jointDoneWithDesignation: occurrence?.schedule?.isJointSchedule
				? data.jointDoneWithDesignation || null
				: null,
			jointDoneWithDepartment: occurrence?.schedule?.isJointSchedule
				? data.jointDoneWithDepartment || occurrence?.schedule?.jointDepartment || null
				: null,
			inspectionChecklistResponses: dynamicResponses,
		};
		complete({ occurrenceId: occurrence?.id, payload });
		reset();
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Box>
					<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
						Mark Maintenance Complete
					</Typography>
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
				<Stack
					spacing={2}
					component="form"
					id="complete-maintenance-form"
					onSubmit={handleSubmit(onSubmit)}
				>
					{loadingInspectionForm || fetchingInspectionForm ? (
						<Stack direction="row" spacing={1} alignItems="center">
							<CircularProgress size={16} />
							<Typography sx={{ color: 'text.secondary' }}>
								Loading inspection checklist...
							</Typography>
						</Stack>
					) : (
						inspectionSections.map((section) => (
							<Box
								key={section.stationCircuitId}
								sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}
							>
								<Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
									<Box>
										<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
											{section.circuitName}
											{section.identifier ? ` • ${section.identifier}` : ''}
										</Typography>
										<Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
											{section.location?.name
												? `Location: ${section.location.name}`
												: 'No location mapped'}
										</Typography>
									</Box>
								</Stack>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
									{(section.fields || []).map((field) => {
										const fieldName = buildFieldName(section.stationCircuitId, field.key);
										const requiredRule = field.required
											? { required: `${field.label} is required` }
											: {};
										if (field.type === 'BOOLEAN') {
											return (
												<TextField
													key={fieldName}
													select
													label={field.label}
													sx={{ minWidth: 220, flex: 1 }}
													{...register(fieldName, requiredRule)}
												>
													<MenuItem value="">Select</MenuItem>
													<MenuItem value="true">Yes</MenuItem>
													<MenuItem value="false">No</MenuItem>
												</TextField>
											);
										}
										if (field.type === 'SELECT') {
											return (
												<TextField
													key={fieldName}
													select
													label={field.label}
													sx={{ minWidth: 220, flex: 1 }}
													{...register(fieldName, requiredRule)}
												>
													<MenuItem value="">Select</MenuItem>
													{(field.options || []).map((option) => (
														<MenuItem key={option} value={option}>
															{option}
														</MenuItem>
													))}
												</TextField>
											);
										}
										return (
											<TextField
												key={fieldName}
												type={field.type === 'NUMBER' ? 'number' : 'text'}
												label={field.unit ? `${field.label} (${field.unit})` : field.label}
												sx={{ minWidth: 220, flex: 1 }}
												{...register(fieldName, requiredRule)}
											/>
										);
									})}
								</Stack>
							</Box>
						))
					)}

					<TextField label="Completion Remarks" multiline rows={3} {...register('remarks')} />
					<TextField
						label="Proof URLs (comma separated)"
						placeholder="https://... , https://..."
						{...register('proofUrls')}
					/>
					{occurrence?.schedule?.isJointSchedule && (
						<>
							<TextField
								label="Joint Department"
								defaultValue={occurrence?.schedule?.jointDepartment || ''}
								{...register('jointDoneWithDepartment', { required: true })}
							/>
							<TextField
								label="Joint done with (Name)"
								{...register('jointDoneWithName', { required: true })}
							/>
							<TextField
								label="Joint done with (Designation)"
								{...register('jointDoneWithDesignation', { required: true })}
							/>
						</>
					)}
				</Stack>
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3 }}>
					<Button
						variant="outlined"
						onClick={handleClose}
						sx={{ textTransform: 'none', fontWeight: 700 }}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						type="submit"
						form="complete-maintenance-form"
						disabled={isLoading || loadingInspectionForm || fetchingInspectionForm}
						sx={{ textTransform: 'none', fontWeight: 800 }}
					>
						Mark Completed
					</Button>
				</Box>
			</DialogContent>
		</Dialog>
	);
}
