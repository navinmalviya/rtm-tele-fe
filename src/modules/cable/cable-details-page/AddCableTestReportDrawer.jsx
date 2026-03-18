'use client';

import {
	Biotech,
	Calculate,
	CalendarToday,
	Close,
	Hub,
	Map,
	Notes,
	Route,
	Straighten,
	TrackChanges,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Divider,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAddCableTestReport } from '@/hooks/cable';
import { useStations } from '@/hooks/stations/useStations';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoadingButton from '@/lib/common/loading-button';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { openNativeDateTimePicker } from '@/lib/util/date-input';

export const ADD_CABLE_TEST_REPORT_DRAWER = 'addCableTestReportDrawer';

const INPUT_STYLES = {
	bgcolor: 'background.paper',
	'& .MuiOutlinedInput-root': {
		borderRadius: 2,
		'& fieldset': { borderColor: 'divider' },
		'&:hover fieldset': { borderColor: 'text.disabled' },
		'&.Mui-focused fieldset': { borderColor: 'primary.main' },
	},
};

const TEST_CAUSES = [
	{ value: 'SCHEDULED', label: 'Scheduled Testing' },
	{ value: 'FAILURE', label: 'Failure Related' },
	{ value: 'POST_RESTORATION', label: 'Post Restoration' },
	{ value: 'COMMISSIONING', label: 'Commissioning' },
	{ value: 'OTHER', label: 'Other' },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const buildMeasuredDefaults = (cable) => {
	const pairs = [...(cable?.copperPairs || [])]
		.sort((a, b) => (a.quadNo - b.quadNo !== 0 ? a.quadNo - b.quadNo : a.pairNo - b.pairNo))
		.map((pair, index) => ({
			srNo: index + 1,
			quadNo: pair.quadNo ?? '',
			pairNo: pair.pairNo ?? '',
			circuitName: pair.circuits?.[0]?.circuitIdString || '',
			transmissionLossDb: '',
			loopResistanceOhm: '',
			insulationL1E: '',
			insulationL2E: '',
			insulationL1L2: '',
			remarks: '',
		}));

	if (pairs.length) return pairs;

	const fallbackRows = [];
	for (let quad = 1; quad <= 6; quad += 1) {
		for (let pair = 1; pair <= 2; pair += 1) {
			fallbackRows.push({
				srNo: fallbackRows.length + 1,
				quadNo: quad,
				pairNo: pair,
				circuitName: '',
				transmissionLossDb: '',
				loopResistanceOhm: '',
				insulationL1E: '',
				insulationL2E: '',
				insulationL1L2: '',
				remarks: '',
			});
		}
	}
	return fallbackRows;
};

const getDefaultValues = (cable) => {
	const startKm = cable?.subsection?.startKm;
	const endKm = cable?.subsection?.endKm;
	const sectionLength =
		Number.isFinite(startKm) && Number.isFinite(endKm) && endKm >= startKm ? endKm - startKm : '';

	return {
		testDate: todayIso(),
		measuredOn: todayIso(),
		testCause: 'SCHEDULED',
		sectionName: cable?.subsection?.name || '',
		blockSectionName: cable?.subsection?.code || '',
		cableRouteDistanceKm: sectionLength,
		sectionLengthKm: sectionLength,
		measuredAtStationId: '',
		calculatedLoopResistance: '',
		calculatedAttenuation: '',
		insulationRes: '',
		dbLoss: '',
		overallRemarks: '',
		measuredValues: buildMeasuredDefaults(cable),
	};
};

export default function AddCableTestReportDrawer({ cable }) {
	const dispatch = useDispatch();
	const cableId = cable?.id;
	const { mutate: addReport, isLoading } = useAddCableTestReport(cableId);
	const { data: stations = [] } = useStations();

	const stationOptions = useMemo(
		() =>
			stations.map((station) => ({
				id: station.id,
				label: `${station.name}${station.code ? ` (${station.code})` : ''}`,
			})),
		[stations]
	);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: getDefaultValues(cable),
	});

	const { fields } = useFieldArray({
		control,
		name: 'measuredValues',
	});

	useEffect(() => {
		reset(getDefaultValues(cable));
	}, [cable, reset]);

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: ADD_CABLE_TEST_REPORT_DRAWER }));
		reset(getDefaultValues(cable));
	};

	const onSubmit = (values) => {
		if (!cableId) return;
		addReport(
			{
				testDate: values.testDate || null,
				measuredOn: values.measuredOn || null,
				testCause: values.testCause,
				sectionName: values.sectionName || null,
				blockSectionName: values.blockSectionName || null,
				cableRouteDistanceKm: values.cableRouteDistanceKm,
				sectionLengthKm: values.sectionLengthKm,
				measuredAtStationId: values.measuredAtStationId || null,
				calculatedLoopResistance: values.calculatedLoopResistance,
				calculatedAttenuation: values.calculatedAttenuation,
				insulationRes: values.insulationRes || null,
				dbLoss: values.dbLoss,
				overallRemarks: values.overallRemarks || null,
				measuredValues: (values.measuredValues || []).map((row, index) => ({
					srNo: Number(row.srNo) || index + 1,
					quadNo: row.quadNo || null,
					pairNo: row.pairNo || null,
					circuitName: row.circuitName || null,
					transmissionLossDb: row.transmissionLossDb,
					loopResistanceOhm: row.loopResistanceOhm,
					insulationL1E: row.insulationL1E,
					insulationL2E: row.insulationL2E,
					insulationL1L2: row.insulationL1L2,
					remarks: row.remarks || null,
				})),
			},
			{
				onSuccess: () => handleClose(),
			}
		);
	};

	return (
		<RtmDrawer drawerName={ADD_CABLE_TEST_REPORT_DRAWER} onCancel={handleClose}>
			<Box
				sx={{
					width: { xs: '100vw', md: 980 },
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'background.paper',
				}}
			>
				<Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
							Add Cable Testing Report
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
					<form id="add-cable-test-report-form" onSubmit={handleSubmit(onSubmit)}>
						<Stack spacing={2.5}>
							<Typography
								variant="subtitle2"
								sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.08em' }}
							>
								SECTION DETAILS
							</Typography>

							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
									gap: 2,
								}}
							>
								<Controller
									name="testDate"
									control={control}
									rules={{ required: 'Test date is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											type="date"
											label="Test Date"
											fullWidth
											error={!!errors.testDate}
											helperText={errors.testDate?.message}
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
									name="measuredOn"
									control={control}
									rules={{ required: 'Measured on date is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											type="date"
											label="Measured On"
											fullWidth
											error={!!errors.measuredOn}
											helperText={errors.measuredOn?.message}
											InputLabelProps={{ shrink: true }}
											onFocus={openNativeDateTimePicker}
											onClick={openNativeDateTimePicker}
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

								<Controller
									name="testCause"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="Testing Cause"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Biotech sx={{ color: 'primary.main' }} />
													</InputAdornment>
												),
											}}
										>
											{TEST_CAUSES.map((option) => (
												<MenuItem key={option.value} value={option.value}>
													{option.label}
												</MenuItem>
											))}
										</TextField>
									)}
								/>

								<Controller
									name="measuredAtStationId"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											select
											label="Measured At (Station)"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Map sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										>
											<MenuItem value="">Select station</MenuItem>
											{stationOptions.map((station) => (
												<MenuItem key={station.id} value={station.id}>
													{station.label}
												</MenuItem>
											))}
										</TextField>
									)}
								/>

								<Controller
									name="sectionName"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Section"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Route sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>

								<Controller
									name="blockSectionName"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Block Section"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Hub sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>

								<Controller
									name="cableRouteDistanceKm"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Cable Route Distance (KM)"
											type="number"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Straighten sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
												inputProps: { step: 0.01, min: 0 },
											}}
										/>
									)}
								/>

								<Controller
									name="sectionLengthKm"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Section Length (KM)"
											type="number"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Route sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
												inputProps: { step: 0.01, min: 0 },
											}}
										/>
									)}
								/>

								<Controller
									name="calculatedLoopResistance"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Calculated Loop Resistance"
											type="number"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Calculate sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
												inputProps: { step: 0.01, min: 0 },
											}}
										/>
									)}
								/>

								<Controller
									name="calculatedAttenuation"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Calculated Attenuation"
											type="number"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Calculate sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
												inputProps: { step: 0.01, min: 0 },
											}}
										/>
									)}
								/>

								<Controller
									name="dbLoss"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Overall dB Loss"
											type="number"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<TrackChanges sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
												inputProps: { step: 0.01, min: 0 },
											}}
										/>
									)}
								/>

								<Controller
									name="insulationRes"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="Insulation (Summary)"
											fullWidth
											sx={INPUT_STYLES}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<Calculate sx={{ color: 'text.secondary' }} />
													</InputAdornment>
												),
											}}
										/>
									)}
								/>

								<Box sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}>
									<Controller
										name="overallRemarks"
										control={control}
										render={({ field }) => (
											<TextField
												{...field}
												label="Remarks"
												fullWidth
												multiline
												rows={2}
												sx={INPUT_STYLES}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<Notes sx={{ color: 'text.secondary' }} />
														</InputAdornment>
													),
												}}
											/>
										)}
									/>
								</Box>
							</Box>

							<Divider />

							<Typography
								variant="subtitle2"
								sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.08em' }}
							>
								MEASURED VALUES (6 QUAD)
							</Typography>

							<Box
								sx={{
									border: '1px solid',
									borderColor: 'divider',
									borderRadius: 2,
									overflowX: 'auto',
									bgcolor: 'background.paper',
								}}
							>
								<Table size="small" sx={{ minWidth: 1400 }}>
									<TableHead>
										<TableRow>
											<TableCell sx={{ fontWeight: 700 }}>Sr.No</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Quad</TableCell>
											<TableCell sx={{ fontWeight: 700 }}>Pair</TableCell>
											<TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Circuit</TableCell>
											<TableCell sx={{ fontWeight: 700, minWidth: 150 }}>
												Transmission (dB)
											</TableCell>
											<TableCell sx={{ fontWeight: 700, minWidth: 140 }}>Loop (Ohm)</TableCell>
											<TableCell sx={{ fontWeight: 700, minWidth: 120 }}>L1E (MΩ)</TableCell>
											<TableCell sx={{ fontWeight: 700, minWidth: 120 }}>L2E (MΩ)</TableCell>
											<TableCell sx={{ fontWeight: 700, minWidth: 120 }}>L1L2 (MΩ)</TableCell>
											<TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Remarks</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{fields.map((field, index) => (
											<TableRow key={field.id}>
												<TableCell>{field.srNo}</TableCell>
												<TableCell>{field.quadNo}</TableCell>
												<TableCell>{field.pairNo}</TableCell>
												<TableCell>
													<Controller
														name={`measuredValues.${index}.circuitName`}
														control={control}
														render={({ field: formField }) => (
															<TextField
																{...formField}
																size="small"
																fullWidth
																placeholder="Circuit"
															/>
														)}
													/>
												</TableCell>
												<TableCell>
													<Controller
														name={`measuredValues.${index}.transmissionLossDb`}
														control={control}
														render={({ field: formField }) => (
															<TextField
																{...formField}
																size="small"
																type="number"
																fullWidth
																inputProps={{ step: 0.01 }}
															/>
														)}
													/>
												</TableCell>
												<TableCell>
													<Controller
														name={`measuredValues.${index}.loopResistanceOhm`}
														control={control}
														render={({ field: formField }) => (
															<TextField
																{...formField}
																size="small"
																type="number"
																fullWidth
																inputProps={{ step: 0.01 }}
															/>
														)}
													/>
												</TableCell>
												<TableCell>
													<Controller
														name={`measuredValues.${index}.insulationL1E`}
														control={control}
														render={({ field: formField }) => (
															<TextField
																{...formField}
																size="small"
																type="number"
																fullWidth
																inputProps={{ step: 0.01 }}
															/>
														)}
													/>
												</TableCell>
												<TableCell>
													<Controller
														name={`measuredValues.${index}.insulationL2E`}
														control={control}
														render={({ field: formField }) => (
															<TextField
																{...formField}
																size="small"
																type="number"
																fullWidth
																inputProps={{ step: 0.01 }}
															/>
														)}
													/>
												</TableCell>
												<TableCell>
													<Controller
														name={`measuredValues.${index}.insulationL1L2`}
														control={control}
														render={({ field: formField }) => (
															<TextField
																{...formField}
																size="small"
																type="number"
																fullWidth
																inputProps={{ step: 0.01 }}
															/>
														)}
													/>
												</TableCell>
												<TableCell>
													<Controller
														name={`measuredValues.${index}.remarks`}
														control={control}
														render={({ field: formField }) => (
															<TextField
																{...formField}
																size="small"
																fullWidth
																placeholder="Remarks"
															/>
														)}
													/>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Box>
						</Stack>
					</form>
				</Box>

				<Divider />
				<Stack direction="row" spacing={1.25} justifyContent="flex-end" sx={{ p: 2 }}>
					<Button variant="outlined" onClick={handleClose}>
						Cancel
					</Button>
					<RtmLoadingButton
						type="submit"
						form="add-cable-test-report-form"
						variant="contained"
						loading={isLoading}
						loadingText="Saving..."
					>
						Save Test Report
					</RtmLoadingButton>
				</Stack>
			</Box>
		</RtmDrawer>
	);
}
