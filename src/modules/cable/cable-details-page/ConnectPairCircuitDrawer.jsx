'use client';

import { Cable, Close, Hub, Link, Place, Schema } from '@mui/icons-material';
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
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useConnectStationCircuit } from '@/hooks/cable';
import { useStationCircuits } from '@/hooks/circuits';
import { useToast } from '@/hooks/common';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export const CONNECT_PAIR_CIRCUIT_DRAWER = 'connectPairCircuitDrawer';

const INPUT_STYLES = {
	bgcolor: 'background.paper',
	'& .MuiOutlinedInput-root': {
		borderRadius: 2,
		'& fieldset': { borderColor: 'divider' },
		'&:hover fieldset': { borderColor: 'text.disabled' },
		'&.Mui-focused fieldset': { borderColor: 'primary.main' },
	},
};

export default function ConnectPairCircuitDrawer({ cable }) {
	const dispatch = useDispatch();
	const showToast = useToast();
	const drawerState = useSelector((state) => state.drawers?.[CONNECT_PAIR_CIRCUIT_DRAWER]);
	const pairId = drawerState?.pairId || null;
	const cableId = cable?.id;
	const { mutate: connectCircuit, isLoading: isConnecting } = useConnectStationCircuit(cableId);
	const { data: approvedCircuits = [], isLoading: loadingCircuits } = useStationCircuits({
		status: 'APPROVED',
	});

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm({
		defaultValues: {
			stationId: '',
			stationCircuitId: '',
		},
	});

	const selectedStationId = watch('stationId');

	const pair = useMemo(
		() => (cable?.copperPairs || []).find((item) => item.id === pairId) || null,
		[cable?.copperPairs, pairId]
	);

	const stations = useMemo(() => {
		const grouped = new Map();
		for (const item of approvedCircuits || []) {
			const stationId = item?.station?.id;
			if (!stationId) continue;
			if (!grouped.has(stationId)) {
				grouped.set(stationId, {
					id: stationId,
					label: `${item.station.name}${item.station.code ? ` (${item.station.code})` : ''}`,
				});
			}
		}
		return Array.from(grouped.values()).sort((a, b) => a.label.localeCompare(b.label));
	}, [approvedCircuits]);

	const filteredCircuits = useMemo(() => {
		if (!selectedStationId) return [];
		return (approvedCircuits || []).filter((item) => item.stationId === selectedStationId);
	}, [approvedCircuits, selectedStationId]);

	useEffect(() => {
		reset({
			stationId: '',
			stationCircuitId: '',
		});
	}, [pairId, reset]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: CONNECT_PAIR_CIRCUIT_DRAWER }));
		reset({
			stationId: '',
			stationCircuitId: '',
		});
	};

	const onSubmit = (values) => {
		if (!pair?.id) {
			showToast('Select a valid pair first.', 'warning');
			return;
		}
		connectCircuit(
			{
				mediaType: 'PAIR',
				mediaId: pair.id,
				stationCircuitId: values.stationCircuitId,
			},
			{
				onSuccess: () => handleClose(),
			}
		);
	};

	return (
		<RtmDrawer drawerName={CONNECT_PAIR_CIRCUIT_DRAWER} onCancel={handleClose}>
			<Box
				sx={{
					width: { xs: '100vw', sm: 480 },
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Map Pair to Circuit
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
							Approved station circuits (Testroom verified)
						</Typography>
					</Box>
					<IconButton onClick={handleClose} sx={{ bgcolor: 'action.hover' }}>
						<Close fontSize="small" />
					</IconButton>
				</Box>
				<Divider />

				<Box sx={{ p: 3, flex: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
					<form id="connect-pair-circuit-form" onSubmit={handleSubmit(onSubmit)}>
						<Stack spacing={2.25}>
							<Box
								sx={{
									p: 1.5,
									bgcolor: 'background.paper',
									border: '1px solid',
									borderColor: 'divider',
									borderRadius: 2,
								}}
							>
								<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
									<Chip
										size="small"
										icon={<Cable sx={{ fontSize: 16 }} />}
										label={cable?.subType || 'Cable'}
										variant="outlined"
									/>
									<Chip
										size="small"
										icon={<Link sx={{ fontSize: 16 }} />}
										label={pair ? `Q${pair.quadNo} • P${pair.pairNo}` : 'Pair not selected'}
										color={pair ? 'primary' : 'default'}
										variant="outlined"
									/>
								</Stack>
							</Box>

							<Controller
								name="stationId"
								control={control}
								rules={{ required: 'Station is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										select
										fullWidth
										label="Station"
										error={!!errors.stationId}
										helperText={errors.stationId?.message}
										disabled={loadingCircuits}
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Place sx={{ color: 'text.secondary' }} />
												</InputAdornment>
											),
										}}
										onChange={(event) => {
											field.onChange(event);
											reset({
												stationId: event.target.value,
												stationCircuitId: '',
											});
										}}
									>
										<MenuItem value="">Select station</MenuItem>
										{stations.map((station) => (
											<MenuItem key={station.id} value={station.id}>
												{station.label}
											</MenuItem>
										))}
									</TextField>
								)}
							/>

							<Controller
								name="stationCircuitId"
								control={control}
								rules={{ required: 'Circuit is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										select
										fullWidth
										label="Approved Circuit"
										error={!!errors.stationCircuitId}
										helperText={
											errors.stationCircuitId?.message ||
											(selectedStationId && filteredCircuits.length === 0
												? 'No approved circuits found for selected station.'
												: '')
										}
										disabled={!selectedStationId}
										sx={INPUT_STYLES}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<Schema sx={{ color: 'primary.main' }} />
												</InputAdornment>
											),
										}}
									>
										<MenuItem value="">Select circuit</MenuItem>
										{filteredCircuits.map((item) => (
											<MenuItem key={item.id} value={item.id}>
												{`${item.circuitMaster?.name || 'Circuit'}${
													item.identifier ? ` • ${item.identifier}` : ''
												}`}
											</MenuItem>
										))}
									</TextField>
								)}
							/>

							{pair?.circuits?.length > 0 && (
								<Box
									sx={{
										p: 1.5,
										bgcolor: 'background.paper',
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: 2,
									}}
								>
									<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
										<Hub sx={{ color: 'info.main', fontSize: 18 }} />
										<Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8rem' }}>
											Existing Pair Circuits
										</Typography>
									</Stack>
									<Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
										{pair.circuits.map((circuit) => (
											<Chip
												key={circuit.id}
												size="small"
												label={circuit.circuitIdString}
												variant="outlined"
											/>
										))}
									</Stack>
								</Box>
							)}
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
							form="connect-pair-circuit-form"
							variant="contained"
							startIcon={<Link sx={{ fontSize: 18 }} />}
							loading={isConnecting}
							loadingText="Mapping..."
						>
							Map Circuit
						</RtmLoadingButton>
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
