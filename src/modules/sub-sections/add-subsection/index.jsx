'use client';

import { AltRoute, Close } from '@mui/icons-material';
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
import { useSession } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useStations } from '@/hooks/stations/useStations';
import { useAddSubSection } from '@/hooks/sub-sections';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function AddSubSectionForm() {
	const dispatch = useDispatch();
	const { mutate: addSubSection } = useAddSubSection();
	const { data: stations } = useStations();
	const { data: session } = useSession();

	console.log('stations=>', stations);

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: '',
			code: '',
			fromStationId: '',
			toStationId: '',
			startKm: '',
			endKm: '',
		},
	});

	const selectedFrom = watch('fromStationId');

	const handleFormSubmit = (formData) => {
		addSubSection(formData);
		reset();
		dispatch(closeDrawer({ drawerName: 'addSubSectionDrawer' }));
	};

	// Shared styling for the select dropdown menus
	const sharedSelectSlotProps = {
		select: {
			MenuProps: {
				PaperProps: {
					sx: {
						bgcolor: 'background.paper',
						elevation: 8,
						mt: 1,
						border: '1px solid',
						borderColor: 'divider',
						'& .MuiMenuItem-root': {
							fontSize: '0.875rem',
							fontWeight: 500,
							color: 'text.primary',
							paddingY: '10px',
							'&:hover': { bgcolor: 'action.hover' },
						},
					},
				},
			},
		},
	};

	return (
		<RtmDrawer drawerName="addSubSectionDrawer">
			{/* Standardized Width Wrapper */}
			<Box
				sx={{
					width: { xs: '100vw', sm: 500 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
				}}
			>
				{/* Header */}
				<Box
					sx={{
						p: 3,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						bgcolor: 'background.paper',
					}}
				>
					<Box>
						<Typography
							variant="h5"
							sx={{ fontWeight: 800, color: 'text.primary' }}
						>
							Create Sub-section
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontWeight: 600 }}
						>
							Division: **
							{session?.user?.divisionCode || '...'}**
						</Typography>
					</Box>
					<IconButton
						onClick={() =>
							dispatch(
								closeDrawer({
									drawerName: 'addSubSectionDrawer',
								})
							)
						}
						sx={{ bgcolor: 'action.hover' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider sx={{ borderColor: 'divider' }} />

				{/* Form Content */}
				<Box
					sx={{
						p: 4,
						flexGrow: 1,
						overflowY: 'auto',
						bgcolor: 'background.paper',
					}}
				>
					<form
						id="subsection-form"
						onSubmit={handleSubmit(handleFormSubmit)}
					>
						<Stack spacing={4}>
							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										mb: 2,
										color: 'text.secondary',
									}}
								>
									IDENTIFICATION
								</Typography>
								<Stack spacing={3}>
									<Controller
										name="code"
										control={control}
										rules={{
											required: 'Code is required',
										}}
										render={({
											field,
										}) => (
											<TextField
												{...field}
												label="Sub-section Code"
												placeholder="e.g. RTM-MRN"
												fullWidth
												error={
													!!errors.code
												}
												helperText={
													errors
														.code
														?.message
												}
												InputProps={{
													sx: {
														borderRadius: 2,
													},
													startAdornment:
														(
															<InputAdornment position="start">
																<AltRoute
																	sx={{
																		color: 'primary.main',
																		fontSize: 20,
																	}}
																/>
															</InputAdornment>
														),
												}}
											/>
										)}
									/>
									<Controller
										name="name"
										control={control}
										rules={{
											required: 'Name is required',
										}}
										render={({
											field,
										}) => (
											<TextField
												{...field}
												label="Sub-section Name"
												placeholder="e.g. Ratlam - Morwani Block"
												fullWidth
												error={
													!!errors.name
												}
												helperText={
													errors
														.name
														?.message
												}
												InputProps={{
													sx: {
														borderRadius: 2,
													},
												}}
											/>
										)}
									/>
								</Stack>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										mb: 2,
										color: 'text.secondary',
									}}
								>
									BOUNDARY STATIONS
								</Typography>
								<Stack direction="row" spacing={2}>
									<Controller
										name="fromStationId"
										control={control}
										rules={{
											required: 'Required',
										}}
										render={({
											field,
										}) => (
											<TextField
												{...field}
												select
												label="From"
												fullWidth
												error={
													!!errors.fromStationId
												}
												slotProps={
													sharedSelectSlotProps
												}
												InputProps={{
													sx: {
														borderRadius: 2,
													},
												}}
											>
												{stations?.map(
													(
														s
													) => (
														<MenuItem
															key={
																s.id
															}
															value={
																s.id
															}
														>
															{
																s
																	.data
																	.label
															}{' '}
															(
															{
																s
																	.data
																	.code
															}
															)
														</MenuItem>
													)
												)}
											</TextField>
										)}
									/>
									<Controller
										name="toStationId"
										control={control}
										rules={{
											required: 'Required',
										}}
										render={({
											field,
										}) => (
											<TextField
												{...field}
												select
												label="To"
												fullWidth
												error={
													!!errors.toStationId
												}
												slotProps={
													sharedSelectSlotProps
												}
												InputProps={{
													sx: {
														borderRadius: 2,
													},
												}}
											>
												{stations
													?.filter(
														(
															s
														) =>
															s.id !==
															selectedFrom
													)
													.map(
														(
															s
														) => (
															<MenuItem
																key={
																	s.id
																}
																value={
																	s.id
																}
															>
																{
																	s
																		.data
																		.label
																}{' '}
																(
																{
																	s
																		.data
																		.code
																}
																)
															</MenuItem>
														)
													)}
											</TextField>
										)}
									/>
								</Stack>
							</Box>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 700,
										mb: 2,
										color: 'text.secondary',
									}}
								>
									KM RANGE
								</Typography>
								<Stack direction="row" spacing={2}>
									<Controller
										name="startKm"
										control={control}
										rules={{
											required: 'Start KM is required',
										}}
										render={({ field }) => (
											<TextField
												{...field}
												label="Start KM"
												type="number"
												inputProps={{ step: '0.1' }}
												fullWidth
												error={!!errors.startKm}
												helperText={errors.startKm?.message}
												InputProps={{
													sx: { borderRadius: 2 },
												}}
											/>
										)}
									/>
									<Controller
										name="endKm"
										control={control}
										rules={{
											required: 'End KM is required',
										}}
										render={({ field }) => (
											<TextField
												{...field}
												label="End KM"
												type="number"
												inputProps={{ step: '0.1' }}
												fullWidth
												error={!!errors.endKm}
												helperText={errors.endKm?.message}
												InputProps={{
													sx: { borderRadius: 2 },
												}}
											/>
										)}
									/>
								</Stack>
							</Box>
						</Stack>
					</form>
				</Box>

				<Divider />

				{/* Footer matching Station and Section UI */}
				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() =>
								dispatch(
									closeDrawer({
										drawerName: 'addSubSectionDrawer',
									})
								)
							}
							sx={{ color: 'text.secondary', fontWeight: 700 }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="subsection-form"
							variant="contained"
							fullWidth
							disableElevation
							sx={{
								bgcolor: 'primary.main',
								borderRadius: 2.5,
								py: 1.5,
								fontWeight: 700,
								textTransform: 'none',
								fontSize: '1rem',
								'&:hover': { bgcolor: 'primary.dark' },
							}}
						>
							Save Sub-section
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
