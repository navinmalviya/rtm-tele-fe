'use client';

import { Close, Hub } from '@mui/icons-material';
import {
	Box,
	Button,
	Chip,
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
import { useAddSection } from '@/hooks/sections';
import { useSubsections } from '@/hooks/sub-sections';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function AddSectionForm() {
	const dispatch = useDispatch();
	const { mutate: addSection } = useAddSection();
	const { data: subsections } = useSubsections();
	const { data: session } = useSession();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: '',
			code: '',
			subsectionIds: [],
		},
	});

	const handleFormSubmit = (formData) => {
		addSection(formData);
		reset();
	};

	return (
		<RtmDrawer drawerName="addSectionDrawer">
			{/* Same width wrapper as Sub-section */}
			<Box
				sx={{
					width: { xs: '100vw', sm: 500 },
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
				}}
			>
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
							Create Main Section
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
									drawerName: 'addSectionDrawer',
								})
							)
						}
						sx={{ bgcolor: '#F1F5F9' }}
					>
						<Close fontSize="small" />
					</IconButton>
				</Box>

				<Divider sx={{ borderColor: '#F1F5F9' }} />

				<Box
					sx={{
						p: 4,
						flexGrow: 1,
						overflowY: 'auto',
						bgcolor: 'white',
					}}
				>
					<form
						id="section-form"
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
											required: 'Section code is required',
										}}
										render={({
											field,
										}) => (
											<TextField
												{...field}
												label="Section Code"
												placeholder="e.g. RTM-THDR"
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
																<Hub
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
											required: 'Section name is required',
										}}
										render={({
											field,
										}) => (
											<TextField
												{...field}
												label="Section Name"
												placeholder="e.g. Ratlam - Thandla Road"
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
									CONSTITUENT BLOCKS
								</Typography>
								<Controller
									name="subsectionIds"
									control={control}
									rules={{
										required: 'Select at least one',
									}}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="Select Sub-sections"
											fullWidth
											SelectProps={{
												multiple: true,
												renderValue:
													(
														selected
													) => (
														<Box
															sx={{
																display: 'flex',
																flexWrap: 'wrap',
																gap: 0.5,
															}}
														>
															{selected.map(
																(
																	id
																) => (
																	<Chip
																		key={
																			id
																		}
																		label={
																			subsections?.find(
																				(
																					s
																				) =>
																					s.id ===
																					id
																			)
																				?.code
																		}
																		size="small"
																	/>
																)
															)}
														</Box>
													),
											}}
											InputProps={{
												sx: {
													borderRadius: 2,
												},
											}}
										/>
									)}
								>
									{subsections?.map((sub) => (
										<MenuItem
											key={sub.id}
											value={
												sub.id
											}
										>
											{sub.name}
										</MenuItem>
									))}
								</Controller>
							</Box>
						</Stack>
					</form>
				</Box>

				<Divider />

				{/* Footer matching the Station UI exactly */}
				<Box sx={{ p: 3, bgcolor: '#F8FAFC' }}>
					<Stack direction="row" spacing={2}>
						<Button
							variant="text"
							fullWidth
							onClick={() =>
								dispatch(
									closeDrawer({
										drawerName: 'addSectionDrawer',
									})
								)
							}
							sx={{ color: '#64748B', fontWeight: 700 }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="section-form"
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
							Save Section
						</Button>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
