'use client';

import {
	Cable,
	Close,
	ColorLens,
	DeleteOutline,
	Router,
	SettingsInputComponent,
	Straighten,
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
import { useTheme } from '@mui/material/styles';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useDeletePortLink, usePortLinkDetails, useUpdatePortLink } from '@/hooks/port-links';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoader from '@/lib/common/loader';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

const MEDIA_TYPES = [
	{ value: 'CAT6', label: 'Cat6 (Copper)' },
	{ value: 'SINGLE_MODE', label: 'Single Mode Fiber' },
	{ value: 'MULTI_MODE', label: 'Multi Mode Fiber' },
	{ value: 'TWINAX', label: 'Twinax (DAC)' },
];

export default function LinkDetailDrawer({ stationId }) {
	const theme = useTheme();
	const CABLE_COLORS = [
		{ value: theme.palette.primary.main, label: 'Blue (Data)' },
		{ value: theme.palette.success.main, label: 'Green (Management)' },
		{ value: theme.palette.warning.main, label: 'Yellow (Fiber)' },
		{ value: theme.palette.error.main, label: 'Red (Critical)' },
		{ value: theme.palette.text.secondary, label: 'Gray (Standard)' },
	];

	const dispatch = useDispatch();
	const shallowData = useSelector((state) => state.drawers?.linkDetailDrawer || {});

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
				cableColor: link.cableColor || theme.palette.primary.main,
				length: link.length || '',
			});
		}
	}, [link, reset, theme]);

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
		bgcolor: 'background.paper',
		'& .MuiOutlinedInput-root': {
			borderRadius: 2,
			'& fieldset': { borderColor: 'divider' },
			'&:hover fieldset': { borderColor: 'text.disabled' },
			'&.Mui-focused fieldset': { borderColor: 'primary.main' },
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
					bgcolor: 'background.paper',
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
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Link Parameters
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Physical Cable Configuration
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider />

				<Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
					{isLoading ? (
						<RtmLoader label="Loading link details..." minHeight={220} />
					) : (
						<form id="link-detail-form" onSubmit={handleSubmit(onFormSubmit)}>
							<Stack spacing={4}>
								<Box>
									<Typography
										variant="subtitle2"
										sx={{
											fontWeight: 700,
											mb: 2,
											color: 'text.secondary',
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
											bgcolor: 'background.default',
											borderRadius: 3,
											border: '1px solid',
											borderColor: 'divider',
										}}
									>
										<Stack direction="row" spacing={2} alignItems="center">
											<Router sx={{ color: 'primary.main' }} />
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
											<SettingsInputComponent sx={{ color: 'success.main' }} />
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
											color: 'text.secondary',
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
																<Cable fontSize="small" sx={{ color: 'info.main' }} />
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
																<Straighten fontSize="small" sx={{ color: 'text.secondary' }} />
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

				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack spacing={2}>
						<Stack direction="row" spacing={2}>
							<Button
								variant="text"
								fullWidth
								onClick={handleClose}
								sx={{ fontWeight: 700, color: 'text.secondary' }}
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
								sx={{
									bgcolor: 'primary.main',
									py: 1.5,
									fontWeight: 700,
									borderRadius: 2,
									'&:hover': { bgcolor: 'primary.dark' },
								}}
							>
								Update Link
							</Button>
						</Stack>
						<Button
							variant="outlined"
							color="error"
							fullWidth
							startIcon={<DeleteOutline />}
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
