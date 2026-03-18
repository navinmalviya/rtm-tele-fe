'use client';

import { Close, Engineering, PersonOutline, Public, Straighten, Today } from '@mui/icons-material';
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
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useUpdateCable } from '@/hooks/cable';
import { useUsers } from '@/hooks/user';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

const SUPERVISOR_ROLES = [
	'JE_SSE_TELE_SECTIONAL',
	'SSE_TELE_INCHARGE',
	'SSE_SNT_OFFICE',
	'SSE_TECH',
	'TCM',
];

const INPUT_STYLES = {
	bgcolor: 'background.paper',
	'& .MuiOutlinedInput-root': {
		borderRadius: 2,
		'& fieldset': { borderColor: 'divider' },
		'&:hover fieldset': { borderColor: 'text.disabled' },
		'&.Mui-focused fieldset': { borderColor: 'primary.main' },
	},
};

export default function EditCableDrawer({ cable }) {
	const dispatch = useDispatch();
	const { mutate: updateCable, isLoading } = useUpdateCable();
	const { data: users = [] } = useUsers();
	const supervisorUsers = useMemo(
		() => users.filter((user) => SUPERVISOR_ROLES.includes(user.role)),
		[users]
	);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm({
		defaultValues: {
			maintenanceBy: '',
			length: '',
			side: 'UP',
			supervisorId: '',
			dateOfCommissioning: '',
		},
	});

	useEffect(() => {
		if (!cable) return;
		reset({
			maintenanceBy: cable.maintenanceBy || '',
			length: cable.length || '',
			side: cable.side || 'UP',
			supervisorId: cable.supervisor?.id || cable.supervisorId || '',
			dateOfCommissioning: cable.dateOfCommissioning
				? new Date(cable.dateOfCommissioning).toISOString().slice(0, 10)
				: '',
		});
	}, [cable, reset]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'editCableDrawer' }));
	};

	const handleSave = (values) => {
		if (!cable?.id) return;
		updateCable(
			{
				id: cable.id,
				data: values,
			},
			{
				onSuccess: () => {
					handleClose();
				},
			}
		);
	};

	return (
		<RtmDrawer drawerName="editCableDrawer">
			<Box
				sx={{
					width: { xs: '100vw', sm: 460 },
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Edit Cable
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Update cable metadata and ownership
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>
				<Divider />

				<Box sx={{ p: 3, flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="edit-cable-form" onSubmit={handleSubmit(handleSave)}>
						<Stack spacing={2.5}>
							<Controller
								name="maintenanceBy"
								control={control}
								rules={{ required: 'Maintenance authority is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Maintenance Authority"
										fullWidth
										error={!!errors.maintenanceBy}
										helperText={errors.maintenanceBy?.message}
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Engineering sx={{ color: 'primary.main' }} />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
							<Controller
								name="length"
								control={control}
								rules={{ required: 'Length is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label="Length (m)"
										fullWidth
										error={!!errors.length}
										helperText={errors.length?.message}
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Straighten sx={{ color: 'primary.main' }} />
												</InputAdornment>
											),
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
										<MenuItem value="UP">UP</MenuItem>
										<MenuItem value="DOWN">DOWN</MenuItem>
									</TextField>
								)}
							/>
							<Controller
								name="supervisorId"
								control={control}
								rules={{ required: 'Supervisor is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										select
										label="Cable Supervisor"
										fullWidth
										error={!!errors.supervisorId}
										helperText={errors.supervisorId?.message}
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<PersonOutline sx={{ color: 'primary.main' }} />
												</InputAdornment>
											),
										}}
									>
										{supervisorUsers.map((user) => (
											<MenuItem key={user.id} value={user.id}>
												{user.name} ({user.designation || user.role})
											</MenuItem>
										))}
									</TextField>
								)}
							/>
							<Controller
								name="dateOfCommissioning"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										type="date"
										label="Commissioning Date"
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
						</Stack>
					</form>
				</Box>
				<Divider />
				<Box sx={{ p: 3, bgcolor: 'background.default' }}>
					<Stack direction="row" spacing={2}>
						<Button variant="text" fullWidth onClick={handleClose} sx={{ color: 'text.secondary' }}>
							Cancel
						</Button>
						<RtmLoadingButton
							type="submit"
							form="edit-cable-form"
							variant="contained"
							fullWidth
							loading={isLoading}
							loadingText="Saving..."
							disabled={!isDirty}
						>
							Save Changes
						</RtmLoadingButton>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
