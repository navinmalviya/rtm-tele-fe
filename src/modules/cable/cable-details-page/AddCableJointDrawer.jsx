'use client';

import {
	CallSplit,
	ChangeHistory,
	Close,
	EditNote,
	MyLocation,
	Place,
	Public,
	Straighten,
	TrackChanges,
	Today,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddJoint } from '@/hooks/cable';
import { useToast } from '@/hooks/common';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

export const ADD_CABLE_JOINT_DRAWER = 'addCableJointFromDetailsDrawer';

const INPUT_STYLES = {
	bgcolor: 'background.paper',
	'& .MuiOutlinedInput-root': {
		borderRadius: 2,
		'& fieldset': { borderColor: 'divider' },
		'&:hover fieldset': { borderColor: 'text.disabled' },
		'&.Mui-focused fieldset': { borderColor: 'primary.main' },
	},
};

const getDefaultValues = () => ({
	jointType: 'NORMAL',
	jointKm: '',
	side: '',
	locationKM: '',
	jointDate: new Date().toISOString().slice(0, 10),
	coordinatesX: '',
	coordinatesY: '',
	ecSocketId: '',
	remarks: '',
});

export default function AddCableJointDrawer({ cable }) {
	const dispatch = useDispatch();
	const showToast = useToast();
	const cableId = cable?.id;
	const { mutate: addJoint, isLoading } = useAddJoint(cableId);

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm({
		defaultValues: getDefaultValues(),
	});

	const jointType = watch('jointType');

	useEffect(() => {
		reset(getDefaultValues());
	}, [cableId, reset]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: ADD_CABLE_JOINT_DRAWER }));
		reset(getDefaultValues());
	};

	const handleSave = (values) => {
		if (!cableId) return;

		const parsedJointKm = Number.parseFloat(values.jointKm);
		if (!Number.isFinite(parsedJointKm)) {
			showToast('Joint KM is required.', 'warning');
			return;
		}

		if (values.jointType === 'EC' && !values.ecSocketId) {
			showToast('Select EC socket for EC joint.', 'warning');
			return;
		}

		addJoint(
			{
				jointType: values.jointType,
				jointKm: parsedJointKm,
				side: values.side || undefined,
				locationKM: values.locationKM || null,
				jointDate: values.jointDate || null,
				coordinatesX: values.coordinatesX || null,
				coordinatesY: values.coordinatesY || null,
				ecSocketId: values.jointType === 'EC' ? values.ecSocketId : null,
				remarks: values.remarks || null,
			},
			{
				onSuccess: () => handleClose(),
			}
		);
	};

	return (
		<RtmDrawer drawerName={ADD_CABLE_JOINT_DRAWER} onCancel={handleClose}>
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
							Add Cable Joint
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
					<form id="add-cable-joint-form" onSubmit={handleSubmit(handleSave)}>
						<Stack spacing={2.5}>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.08em' }}
							>
								JOINT DETAILS
							</Typography>

							<Controller
								name="jointType"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										select
										label="Joint Type"
										fullWidth
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<CallSplit sx={{ color: 'primary.main' }} />
												</InputAdornment>
											),
										}}
									>
										<MenuItem value="NORMAL">Normal Joint</MenuItem>
										<MenuItem value="EC">EC Joint</MenuItem>
									</TextField>
								)}
							/>

							<Controller
								name="jointKm"
								control={control}
								rules={{ required: 'Joint KM is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Joint KM"
										type="number"
										fullWidth
										error={!!errors.jointKm}
										helperText={
											errors.jointKm?.message ||
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
													<Straighten sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
											inputProps: { min: 0, step: 0.01 },
										}}
									/>
								)}
							/>

							<Controller
								name="side"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										select
										label="Track Side"
										fullWidth
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Public sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									>
										<MenuItem value="">Auto</MenuItem>
										<MenuItem value="UP">UP</MenuItem>
										<MenuItem value="DOWN">DOWN</MenuItem>
									</TextField>
								)}
							/>

							<Controller
								name="jointDate"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										type="date"
										label="Joint Date"
										fullWidth
										InputLabelProps={{ shrink: true }}
										onFocus={openNativeDateTimePicker}
										onClick={openNativeDateTimePicker}
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Today sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>

							<Controller
								name="locationKM"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Location Label"
										placeholder="e.g. KM 5/200"
										fullWidth
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Place sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>

							{jointType === 'EC' && (
								<Controller
									name="ecSocketId"
									control={control}
									rules={{ required: 'EC socket is required for EC joint' }}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="EC Socket"
											fullWidth
											error={!!errors.ecSocketId}
											helperText={
												errors.ecSocketId?.message ||
												((cable?.ecSockets || []).length === 0
													? 'No EC sockets found for this cable.'
													: '')
											}
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<ChangeHistory sx={{ color: 'warning.main' }} />
													</InputAdornment>
												),
											}}
										>
											<MenuItem value="">Select socket</MenuItem>
											{(cable?.ecSockets || []).map((socket) => (
												<MenuItem key={socket.id} value={socket.id}>
													{socket.poleKm}
												</MenuItem>
											))}
										</TextField>
									)}
								/>
							)}

							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
								<Controller
									name="coordinatesX"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Coordinate X"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<MyLocation sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
								<Controller
									name="coordinatesY"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Coordinate Y"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<TrackChanges sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>
							</Stack>

							<Controller
								name="remarks"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Remarks"
										placeholder="Joint condition / remarks"
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
							form="add-cable-joint-form"
							variant="contained"
							startIcon={<CallSplit sx={{ fontSize: 18 }} />}
							loading={isLoading}
							loadingText="Saving..."
						>
							Save Joint
						</RtmLoadingButton>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
