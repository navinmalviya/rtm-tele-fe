'use client';

import {
	Cable,
	Close,
	ColorLens,
	DeleteForever,
	Router,
	SettingsInputComponent,
	Straighten,
} from '@mui/icons-material';
import {
	Box,
	Button,
	CircularProgress,
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
import { useDispatch, useSelector } from 'react-redux';
import { useDeletePortLink, usePortLinkDetails, useUpdatePortLink } from '@/hooks/port-links';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const MEDIA_TYPES = [
	{ value: 'CAT6', label: 'Cat6 (Copper)' },
	{ value: 'SINGLE_MODE', label: 'Single Mode Fiber' },
	{ value: 'MULTI_MODE', label: 'Multi Mode Fiber' },
	{ value: 'TWINAX', label: 'Twinax (DAC)' },
];

const CABLE_COLORS = [
	{ value: '#3B82F6', label: 'Blue (Data)' },
	{ value: '#10B981', label: 'Green (Management)' },
	{ value: '#F59E0B', label: 'Yellow (Fiber)' },
	{ value: '#EF4444', label: 'Red (Critical)' },
	{ value: '#64748B', label: 'Gray (Standard)' },
];

export default function LinkDetailDrawer({ stationId }) {
	const dispatch = useDispatch();
	const { data: shallowData } = useSelector((state) => state.drawers?.linkDetailDrawer || {});
	console.log('shd', shallowData);

	const { data: link, isLoading } = usePortLinkDetails(shallowData?.id);
	const { mutate: updateLink } = useUpdatePortLink(stationId);
	const { mutate: deleteLink } = useDeletePortLink(stationId);

	const {
		control,
		handleSubmit,
		reset,
		formState: { isDirty },
	} = useForm({
		defaultValues: {
			mediaType: '',
			cableColor: '',
			length: '',
		},
	});

	useEffect(() => {
		if (link) {
			reset({
				mediaType: link.mediaType || 'CAT6',
				cableColor: link.cableColor || '#3B82F6',
				length: link.length || '',
			});
		}
	}, [link, reset]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'linkDetailDrawer' }));
	};

	const onFormSubmit = (formData) => {
		updateLink({
			id: shallowData.id,
			data: {
				...formData,
				length: formData.length ? Number.parseFloat(formData.length) : null,
			},
		});
		handleClose();
	};

	const handleDelete = () => {
		const confirmMsg = 'Decommission this physical link? This action cannot be undone.';
		if (window.confirm(confirmMsg)) {
			deleteLink(shallowData.id);
			handleClose();
		}
	};

	const textFieldStyles = {
		bgcolor: 'white',
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
			'& fieldset': { borderColor: '#E2E8F0' },
			'&:hover fieldset': { borderColor: '#CBD5E1' },
			'&.Mui-focused fieldset': { borderColor: '#3B82F6' },
		},
	};

	return (
		<RtmDrawer drawerName="linkDetailDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 500 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
					bgcolor: 'white',
				}}
			>
				<Box
					sx={{
						p: 3,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
							Link Parameters
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
							Physical Cable Configuration
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: '#F1F5F9' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
					{isLoading ? (
						<Stack alignItems="center" sx={{ py: 10 }}>
							<CircularProgress size={24} />
						</Stack>
					) : (
						<form id="link-detail-form" onSubmit={handleSubmit(onFormSubmit)}>
							<Stack spacing={4}>
								<Box>
									<Typography
										variant="subtitle2"
										sx={{
											fontWeight: 700,
											mb: 2,
											color: '#475569',
											fontSize: '0.75rem',
											letterSpacing: '1px',
										}}
									>
										PHYSICAL ENDPOINTS
									</Typography>
									<Stack
										spacing={2}
										sx={{
											p: 2,
											bgcolor: '#F8FAFC',
											borderRadius: 3,
											border: '1px solid #E2E8F0',
										}}
									>
										<Stack direction="row" spacing={2} alignItems="center">
											<Router sx={{ color: '#3B82F6' }} />
											<Box>
												<Typography variant="caption" color="text.secondary">
													Source Equipment
												</Typography>
												<Typography variant="body2" fontWeight={700}>
													{link?.source?.equipment?.name} ({link?.source?.name})
												</Typography>
											</Box>
										</Stack>
										<Divider sx={{ borderStyle: 'dashed' }} />
										<Stack direction="row" spacing={2} alignItems="center">
											<SettingsInputComponent sx={{ color: '#10B981' }} />
											<Box>
												<Typography variant="caption" color="text.secondary">
													Target Equipment
												</Typography>
												<Typography variant="body2" fontWeight={700}>
													{link?.target?.equipment?.name} ({link?.target?.name})
												</Typography>
											</Box>
										</Stack>
									</Stack>
								</Box>

								<Box>
									<Typography
										variant="subtitle2"
										sx={{
											fontWeight: 700,
											mb: 2,
											color: '#475569',
											fontSize: '0.75rem',
											letterSpacing: '1px',
										}}
									>
										CABLE SPECIFICATIONS
									</Typography>
									<Stack spacing={3}>
										<Controller
											name="mediaType"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Media Type"
													fullWidth
													sx={textFieldStyles}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<Cable fontSize="small" sx={{ color: '#6366F1' }} />
															</InputAdornment>
														),
													}}
												>
													{MEDIA_TYPES.map((opt) => (
														<MenuItem key={opt.value} value={opt.value}>
															{opt.label}
														</MenuItem>
													))}
												</TextField>
											)}
										/>

										<Controller
											name="cableColor"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													select
													label="Cable Color"
													fullWidth
													sx={textFieldStyles}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<ColorLens fontSize="small" sx={{ color: field.value }} />
															</InputAdornment>
														),
													}}
												>
													{CABLE_COLORS.map((opt) => (
														<MenuItem key={opt.value} value={opt.value}>
															<Stack direction="row" spacing={1} alignItems="center">
																<Box
																	sx={{
																		width: 12,
																		height: 12,
																		borderRadius: '50%',
																		bgcolor: opt.value,
																	}}
																/>
																<Typography>{opt.label}</Typography>
															</Stack>
														</MenuItem>
													))}
												</TextField>
											)}
										/>

										<Controller
											name="length"
											control={control}
											render={({ field }) => (
												<TextField
													{...field}
													label="Cable Length (Meters)"
													type="number"
													fullWidth
													sx={textFieldStyles}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<Straighten fontSize="small" sx={{ color: '#64748B' }} />
															</InputAdornment>
														),
													}}
												/>
											)}
										/>
									</Stack>
								</Box>
							</Stack>
						</form>
					)}
				</Box>

				<Divider />

				<Box sx={{ p: 3, bgcolor: '#F8FAFC' }}>
					<Stack spacing={2}>
						<Stack direction="row" spacing={2}>
							<Button
								variant="text"
								fullWidth
								onClick={handleClose}
								sx={{ fontWeight: 700, color: '#64748B' }}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								form="link-detail-form"
								variant="contained"
								fullWidth
								disableElevation
								disabled={!isDirty}
								sx={{ bgcolor: '#3B82F6', py: 1.5, fontWeight: 700, borderRadius: 2 }}
							>
								Update Link
							</Button>
						</Stack>
						<Button
							variant="outlined"
							color="error"
							fullWidth
							startIcon={<DeleteForever />}
							onClick={handleDelete}
							sx={{ py: 1, fontWeight: 700, borderRadius: 2, borderStyle: 'dashed' }}
						>
							Decommission Physical Link
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
