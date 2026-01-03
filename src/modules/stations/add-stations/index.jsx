'use client';

import { Close } from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	IconButton,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddStation } from '@/hooks/stations';
import { RtmDrawer } from '@/lib/common/layout';
import { SECTIONS, SUB_SECTIONS } from '@/lib/constants';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function AddStationForm({ initialData }) {
	const dispatch = useDispatch();
	const { mutate: addStation } = useAddStation();
	const { data } = useSession();

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			code: '',
			name: '',
			section: '',
			subSection: '',
			mapX: initialData?.x || 0,
			mapY: initialData?.y || 0,
		},
		values: {
			code: '',
			name: '',
			section: '',
			subSection: '',
			mapX: initialData?.x || 0,
			mapY: initialData?.y || 0,
		},
	});

	// Validated Submit Function
	const handleStationSubmit = (stationData) => {
		addStation({ stationData, createdById: data?.user?.id });
		reset(); // Clear form
	};

	return (
		<RtmDrawer drawerName="addStationDrawer">
			{/* Header */}
			<Box
				sx={{
					p: 2,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					bgcolor: '#f8f9fa',
				}}
			>
				<Typography variant="h6" sx={{ fontWeight: 800 }}>
					Add Station
				</Typography>
				<IconButton
					onClick={() =>
						dispatch(
							closeDrawer({
								drawerName: 'addStationDrawer',
							})
						)
					}
				>
					<Close />
				</IconButton>
			</Box>

			<Divider />

			{/* Form Content */}
			<Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
				<form
					id="station-form"
					onSubmit={handleSubmit(handleStationSubmit)}
				>
					<Stack spacing={3}>
						<Controller
							name="code"
							control={control}
							rules={{ required: 'Code is required' }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Station Code"
									fullWidth
									error={!!errors.code}
									helperText={
										errors.code?.message
									}
								/>
							)}
						/>

						<Controller
							name="name"
							control={control}
							rules={{ required: 'Name is required' }}
							render={({ field }) => (
								<TextField
									{...field}
									label="Station Name"
									fullWidth
									error={!!errors.name}
									helperText={
										errors.name?.message
									}
								/>
							)}
						/>

						<Controller
							name="section"
							control={control}
							rules={{ required: 'Section is required' }}
							render={({ field }) => (
								<TextField
									{...field}
									select
									label="Section"
									fullWidth
									error={!!errors.section}
									helperText={
										errors.section
											?.message
									}
								>
									{SECTIONS.map((o) => (
										<MenuItem
											key={o}
											value={o}
										>
											{o}
										</MenuItem>
									))}
								</TextField>
							)}
						/>

						<Controller
							name="subSection"
							control={control}
							rules={{
								required: 'Sub-section is required',
							}}
							render={({ field }) => (
								<TextField
									{...field}
									select
									label="Sub-Section"
									fullWidth
									error={!!errors.subSection}
									helperText={
										errors.subSection
											?.message
									}
								>
									{SUB_SECTIONS.map((o) => (
										<MenuItem
											key={o}
											value={o}
										>
											{o}
										</MenuItem>
									))}
								</TextField>
							)}
						/>

						{/* EDITABLE COORDINATES */}
						<Stack direction="row" spacing={2}>
							<Controller
								name="mapX"
								control={control}
								rules={{
									required: 'X is required',
								}}
								render={({ field }) => (
									<TextField
										{...field}
										label="X Coordinate"
										type="number"
										fullWidth
										error={
											!!errors.mapX
										}
										helperText={
											errors.mapX
												?.message
										}
									/>
								)}
							/>
							<Controller
								name="mapY"
								control={control}
								rules={{
									required: 'Y is required',
								}}
								render={({ field }) => (
									<TextField
										{...field}
										label="Y Coordinate"
										type="number"
										fullWidth
										error={
											!!errors.mapY
										}
										helperText={
											errors.mapY
												?.message
										}
									/>
								)}
							/>
						</Stack>
					</Stack>
				</form>
			</Box>

			<Divider />

			{/* Footer Actions */}
			<Box sx={{ p: 2, bgcolor: '#f8f9fa' }}>
				<Stack direction="row" spacing={2}>
					<Button
						variant="outlined"
						fullWidth
						onClick={() =>
							dispatch(
								closeDrawer({
									drawerName: 'addStationDrawer',
								})
							)
						}
						color="inherit"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="station-form"
						variant="contained"
						fullWidth
						sx={{ bgcolor: '#2196f3', fontWeight: 700 }}
					>
						Save Station
					</Button>
				</Stack>
			</Box>
		</RtmDrawer>
	);
}
