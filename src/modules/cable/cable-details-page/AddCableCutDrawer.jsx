'use client';

import {
	CalendarToday,
	Close,
	ContentCut,
	Engineering,
	EditNote,
	Place,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	IconButton,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddCableCut } from '@/hooks/cable';
import { useToast } from '@/hooks/common';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

export const ADD_CABLE_CUT_DRAWER = 'addCableCutDrawer';

const INPUT_STYLES = {
	bgcolor: 'background.paper',
	'& .MuiOutlinedInput-root': {
		borderRadius: 2,
		'& fieldset': { borderColor: 'divider' },
		'&:hover fieldset': { borderColor: 'text.disabled' },
		'&.Mui-focused fieldset': { borderColor: 'primary.main' },
	},
};

const nowLocalDateTime = () => {
	const now = new Date();
	now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
	return now.toISOString().slice(0, 16);
};

const getDefaultValues = () => ({
	locationKM: '',
	cutDateTime: nowLocalDateTime(),
	restorationDateTime: '',
	putRightDetails: '',
});

export default function AddCableCutDrawer({ cable }) {
	const dispatch = useDispatch();
	const showToast = useToast();
	const cableId = cable?.id;
	const { mutate: addCableCut, isLoading } = useAddCableCut(cableId);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: getDefaultValues(),
	});

	useEffect(() => {
		reset(getDefaultValues());
	}, [cableId, reset]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: ADD_CABLE_CUT_DRAWER }));
		reset(getDefaultValues());
	};

	const handleSave = (values) => {
		if (!cableId) return;

		const cutAt = values.cutDateTime ? new Date(values.cutDateTime) : null;
		const restoredAt = values.restorationDateTime ? new Date(values.restorationDateTime) : null;

		if (restoredAt && cutAt && restoredAt.getTime() < cutAt.getTime()) {
			showToast('Restoration time cannot be earlier than failure time.', 'warning');
			return;
		}

		addCableCut(
			{
				locationKM: values.locationKM?.trim(),
				cutDateTime: values.cutDateTime || null,
				restorationDateTime: values.restorationDateTime || null,
				putRightDetails: values.putRightDetails || null,
			},
			{
				onSuccess: () => handleClose(),
			}
		);
	};

	return (
		<RtmDrawer drawerName={ADD_CABLE_CUT_DRAWER} onCancel={handleClose}>
			<Box
				sx={{
					width: { xs: '100vw', sm: 520 },
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Add Cable Cut
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							{cable?.subType || 'Cable'} {cable?.id ? `• ${cable.id.slice(0, 8)}` : ''}
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>
				<Divider />

				<Box sx={{ p: 3, flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="add-cable-cut-form" onSubmit={handleSubmit(handleSave)}>
						<Stack spacing={2.5}>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.08em' }}
							>
								CUT DETAILS
							</Typography>

							<Controller
								name="locationKM"
								control={control}
								rules={{ required: 'Location KM is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Location KM"
										placeholder="e.g. KM 5/200"
										fullWidth
										error={!!errors.locationKM}
										helperText={
											errors.locationKM?.message ||
											(cable?.subsection?.startKm !== null &&
											cable?.subsection?.startKm !== undefined &&
											cable?.subsection?.endKm !== null &&
											cable?.subsection?.endKm !== undefined
												? `Subsection range: ${cable.subsection.startKm} - ${cable.subsection.endKm} KM`
												: '')
										}
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Place sx={{ color: 'primary.main' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>

							<Controller
								name="cutDateTime"
								control={control}
								rules={{ required: 'Failure time is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										type="datetime-local"
										label="Failure Time"
										fullWidth
										error={!!errors.cutDateTime}
										helperText={errors.cutDateTime?.message}
										InputLabelProps={{ shrink: true }}
										onFocus={openNativeDateTimePicker}
										onClick={openNativeDateTimePicker}
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<ContentCut sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>

							<Controller
								name="restorationDateTime"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										type="datetime-local"
										label="Restoration Time (Optional)"
										fullWidth
										InputLabelProps={{ shrink: true }}
										onFocus={openNativeDateTimePicker}
										onClick={openNativeDateTimePicker}
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<CalendarToday sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>

							<Controller
								name="putRightDetails"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Put Right Details"
										placeholder="How restoration was done"
										fullWidth
										multiline
										minRows={3}
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<EditNote sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>

							<Box
								sx={{
									p: 1.5,
									borderRadius: 2,
									bgcolor: 'action.hover',
									border: '1px solid',
									borderColor: 'divider',
								}}
							>
								<Stack direction="row" spacing={1} alignItems="center">
									<Engineering sx={{ color: 'warning.main', fontSize: 18 }} />
									<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
										Reported By will be captured from currently logged-in user.
									</Typography>
								</Stack>
							</Box>
						</Stack>
					</form>
				</Box>

				<Divider />
				<Box sx={{ p: 2 }}>
					<Stack direction="row" spacing={1.2} justifyContent="flex-end">
						<Button variant="text" onClick={handleClose} sx={{ fontWeight: 700 }}>
							Cancel
						</Button>
						<RtmLoadingButton
							type="submit"
							form="add-cable-cut-form"
							variant="contained"
							startIcon={<ContentCut sx={{ fontSize: 18 }} />}
							loading={isLoading}
							loadingText="Saving..."
						>
							Save Cut
						</RtmLoadingButton>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
