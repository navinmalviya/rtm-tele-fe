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
						bgcolor: 'white',
						elevation: 8,
						mt: 1,
						border: '1px solid #E2E8F0',
						'& .MuiMenuItem-root': {
							fontSize: '0.875rem',
							fontWeight: 500,
							color: '#1E293B',
							paddingY: '10px',
							'&:hover': { bgcolor: '#F1F5F9' },
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
						bgcolor: 'white',
					}}
				>
					<Box>
						<Typography
							variant="h5"
							sx={{ fontWeight: 800, color: '#1E293B' }}
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
						sx={{ bgcolor: '#F1F5F9' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider sx={{ borderColor: '#F1F5F9' }} />

				{/* Form Content */}
				<Box
					sx={{
						p: 4,
						flexGrow: 1,
						overflowY: 'auto',
						bgcolor: 'white',
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
										color: '#64748B',
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
										color: '#64748B',
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
						</Stack>
					</form>
				</Box>

				<Divider />

				{/* Footer matching Station and Section UI */}
				<Box sx={{ p: 3, bgcolor: '#F8FAFC' }}>
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
							sx={{ color: '#64748B', fontWeight: 700 }}
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
								bgcolor: '#3B82F6',
								borderRadius: 2.5,
								py: 1.5,
								fontWeight: 700,
								textTransform: 'none',
								fontSize: '1rem',
								'&:hover': { bgcolor: '#2563EB' },
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
