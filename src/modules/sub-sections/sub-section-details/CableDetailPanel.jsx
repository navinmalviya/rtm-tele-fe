'use client';

import { Close } from '@mui/icons-material';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { useAddEcSocket, useCableDetails, useConnectMedia } from '@/hooks/cable';
import { useAllEquipment } from '@/hooks/equipment';
import { RtmDrawer } from '@/lib/common/layout';
import RtmLoader from '@/lib/common/loader';
import RtmLoadingButton from '@/lib/common/loading-button';

export function CableDetailPanel({ cableId, onClose }) {
	const { data: cable, isLoading } = useCableDetails(cableId);
	const { mutate: addEcSocket, isLoading: isAddingSocket } = useAddEcSocket(cableId);
	const { mutate: connectMedia, isLoading: isConnecting } = useConnectMedia(cableId);
	const { data: allEquipment = [] } = useAllEquipment();
	const [socketKm, setSocketKm] = useState('');
	const [socketError, setSocketError] = useState('');
	const [connectState, setConnectState] = useState({ open: false, mediaType: null, mediaId: null });
	const [selectedEquipmentId, setSelectedEquipmentId] = useState('');

	if (isLoading || !cable) {
		return (
			<RtmDrawer drawerName="cableDetailPanel" onCancel={onClose}>
				<RtmLoader label="Loading cable details..." minHeight="100%" />
			</RtmDrawer>
		);
	}

	const parseKmValue = (value) => {
		const match = String(value || '').match(/^\s*(\d+(\.\d+)?)/);
		return match ? Number.parseFloat(match[1]) : null;
	};

	const handleAddSocket = (event) => {
		event.preventDefault();
		const trimmed = socketKm.trim();
		if (!trimmed) {
			setSocketError('KM value is required');
			return;
		}

		const rangeStart = cable.subsection?.startKm;
		const rangeEnd = cable.subsection?.endKm;
		if (
			rangeStart !== null &&
			rangeEnd !== null &&
			rangeStart !== undefined &&
			rangeEnd !== undefined
		) {
			const kmValue = parseKmValue(trimmed);
			if (kmValue === null) {
				setSocketError(`Enter KM within ${rangeStart}-${rangeEnd}`);
				return;
			}
			if (kmValue < rangeStart || kmValue > rangeEnd) {
				setSocketError(`KM must be within ${rangeStart}-${rangeEnd}`);
				return;
			}
		}

		setSocketError('');
		addEcSocket({ poleKm: trimmed });
		setSocketKm('');
	};

	const handleConnect = () => {
		if (!selectedEquipmentId) return;
		connectMedia({
			mediaType: connectState.mediaType,
			mediaId: connectState.mediaId,
			equipmentId: selectedEquipmentId,
		});
		setConnectState({ open: false, mediaType: null, mediaId: null });
		setSelectedEquipmentId('');
	};

	return (
		<RtmDrawer drawerName="cableDetailPanel" onCancel={onClose}>
			<Box
				sx={{
					width: 420,
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'background.default',
				}}
			>
				{/* Header Section */}
				<Box
					sx={{
						p: 3,
						bgcolor: 'background.paper',
						borderBottom: '1px solid',
						borderColor: 'divider',
					}}
				>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
								{cable.subType}
							</Typography>
							<Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
								Physical Core Mapping
							</Typography>
						</Box>
						<IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
							<Close fontSize="small" />
						</IconButton>
					</Stack>

					<Grid container spacing={1.5} sx={{ mt: 2 }}>
						<StatItem label="Total Length" value={`${cable.length}m`} />
						<StatItem label="Track Side" value={cable.side} />
						<StatItem label="Supervisor" value={cable.supervisor?.name || '—'} />
					</Grid>
				</Box>

				{/* Asset List Section */}
				<Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
					{cable.type === 'PIJF' ? (
						<Stack spacing={2}>
							<QuadList
								pairs={cable.copperPairs}
								onConnect={(id) => setConnectState({ open: true, mediaType: 'PAIR', mediaId: id })}
							/>
							{cable.subType === 'QUAD_6' && (
								<EcSocketList
									sockets={cable.ecSockets}
									subsectionRange={{
										startKm: cable.subsection?.startKm,
										endKm: cable.subsection?.endKm,
									}}
									socketKm={socketKm}
									socketError={socketError}
									isAdding={isAddingSocket}
									onSocketChange={(value) => {
										setSocketKm(value);
										setSocketError('');
									}}
									onSubmit={handleAddSocket}
								/>
							)}
						</Stack>
					) : (
						<FiberList
							fibers={cable.fibers}
							onConnect={(id) => setConnectState({ open: true, mediaType: 'FIBER', mediaId: id })}
						/>
					)}
					{(cable.sideSegments || []).length > 0 && (
						<Paper
							elevation={0}
							sx={{
								mt: 2,
								p: 2,
								borderRadius: 4,
								border: '1px solid',
								borderColor: 'divider',
								bgcolor: 'background.paper',
							}}
						>
							<Typography
								sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'text.primary', mb: 1 }}
							>
								Side Segments
							</Typography>
							<Stack spacing={1}>
								{cable.sideSegments.map((segment) => (
									<Box
										key={segment.id}
										sx={{
											p: 1,
											bgcolor: 'background.default',
											borderRadius: 2,
											display: 'flex',
											justifyContent: 'space-between',
											border: '1px solid',
											borderColor: 'divider',
										}}
									>
										<Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.primary' }}>
											KM {segment.fromKm} - {segment.toKm}
										</Typography>
										<Typography
											sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'text.secondary' }}
										>
											{segment.side}
										</Typography>
									</Box>
								))}
							</Stack>
						</Paper>
					)}
				</Box>

				<Dialog
					open={connectState.open}
					onClose={() => setConnectState({ open: false, mediaType: null, mediaId: null })}
				>
					<DialogTitle>Connect Equipment</DialogTitle>
					<DialogContent sx={{ minWidth: 320 }}>
						<TextField
							select
							label="Select Equipment"
							fullWidth
							value={selectedEquipmentId}
							onChange={(event) => setSelectedEquipmentId(event.target.value)}
							sx={{ mt: 1 }}
						>
							{allEquipment.map((equipment) => (
								<MenuItem key={equipment.id} value={equipment.id}>
									{equipment.name} (
									{equipment.station?.code || equipment.station?.name || 'Station'})
								</MenuItem>
							))}
						</TextField>
					</DialogContent>
					<DialogActions sx={{ px: 3, pb: 2 }}>
						<Button
							onClick={() => setConnectState({ open: false, mediaType: null, mediaId: null })}
						>
							Cancel
						</Button>
						<RtmLoadingButton
							variant="contained"
							disableElevation
							onClick={handleConnect}
							loading={isConnecting}
							loadingText="Connecting..."
						>
							Connect
						</RtmLoadingButton>
					</DialogActions>
				</Dialog>
			</Box>
		</RtmDrawer>
	);
}

/**
 * Renders Fibers grouped by Buffer Tubes
 */
const FiberList = ({ fibers = [], onConnect }) => {
	const tubes = fibers.reduce((acc, fiber) => {
		if (!acc[fiber.tubeNo]) acc[fiber.tubeNo] = [];
		acc[fiber.tubeNo].push(fiber);
		return acc;
	}, {});

	return (
		<Stack spacing={2}>
			{Object.entries(tubes).map(([tNo, tFibers]) => (
				<Paper
					key={tNo}
					elevation={0}
					sx={{
						p: 2,
						borderRadius: 4,
						border: '1px solid',
						borderColor: 'divider',
						bgcolor: 'background.paper',
					}}
				>
					{/* Tube Header */}
					<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
						<Box
							sx={{
								width: 14,
								height: 14,
								borderRadius: '4px',
								bgcolor: (theme) => tFibers[0]?.tubeColor || theme.palette.divider,
								border: (theme) => `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
							}}
						/>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'text.primary' }}>
							TUBE {tNo}: {tFibers[0]?.tubeColor}
						</Typography>
					</Stack>

					<Grid container spacing={1}>
						{tFibers.map((fiber) => {
							const connectedEquipment = (fiber.circuits || []).flatMap(
								(circuit) => circuit.equipments || []
							);
							return (
								<Grid item xs={6} key={fiber.id}>
									<Box
										onClick={() => {
											if (connectedEquipment.length === 0) onConnect(fiber.id);
										}}
										sx={{
											p: 1.2,
											bgcolor: 'background.default',
											borderRadius: 2.5,
											display: 'flex',
											alignItems: 'center',
											gap: 1.5,
											border: '1px solid',
											borderColor: 'divider',
											cursor: connectedEquipment.length === 0 ? 'pointer' : 'default',
										}}
									>
										{/* Fiber Color Circle */}
										<Box
											sx={{
												width: 10,
												height: 10,
												borderRadius: '50%',
												bgcolor: (theme) =>
													fiber.fiberColor === 'Natural'
														? theme.palette.action.hover
														: fiber.fiberColor,
												border: (theme) => `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
											}}
										/>
										<Box sx={{ flex: 1 }}>
											<Typography
												sx={{
													fontSize: '0.7rem',
													fontWeight: 900,
													color: 'text.primary',
													lineHeight: 1,
												}}
											>
												F-{fiber.fiberNo}
											</Typography>
											<Typography
												sx={{ fontSize: '0.6rem', color: 'text.secondary', fontWeight: 600 }}
											>
												{connectedEquipment.length > 0
													? connectedEquipment.map((eq) => eq.name).join(', ')
													: 'SPARE'}
											</Typography>
										</Box>
										{connectedEquipment.length === 0 && (
											<Button size="small" onClick={() => onConnect(fiber.id)}>
												Connect
											</Button>
										)}
									</Box>
								</Grid>
							);
						})}
					</Grid>
				</Paper>
			))}
		</Stack>
	);
};

/**
 * Renders Pairs grouped by Quads
 */
const QuadList = ({ pairs = [], onConnect }) => {
	const quads = pairs.reduce((acc, pair) => {
		if (!acc[pair.quadNo]) acc[pair.quadNo] = [];
		acc[pair.quadNo].push(pair);
		return acc;
	}, {});

	return (
		<Stack spacing={2}>
			{Object.entries(quads).map(([qNo, qPairs]) => (
				<Paper
					key={qNo}
					elevation={0}
					sx={{
						p: 2,
						borderRadius: 4,
						border: '1px solid',
						borderColor: 'divider',
						bgcolor: 'background.paper',
					}}
				>
					<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
						<Box
							sx={{
								width: 12,
								height: 12,
								borderRadius: '50%',
								bgcolor: (theme) => qPairs[0]?.quadColor || theme.palette.divider,
								border: (theme) => `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
							}}
						/>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'text.primary' }}>
							Quad {qNo} Identification
						</Typography>
					</Stack>

					<Stack spacing={1}>
						{qPairs.map((pair) => {
							const connectedEquipment = (pair.circuits || []).flatMap(
								(circuit) => circuit.equipments || []
							);
							return (
								<Box
									key={pair.id}
									onClick={() => {
										if (connectedEquipment.length === 0) onConnect(pair.id);
									}}
									sx={{
										p: 1.5,
										bgcolor: 'background.default',
										borderRadius: 2,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										border: '1px solid',
										borderColor: 'divider',
										cursor: connectedEquipment.length === 0 ? 'pointer' : 'default',
									}}
								>
									<Stack direction="row" spacing={2} alignItems="center">
										<Box
											sx={(theme) => ({
												px: 1,
												py: 0.2,
												borderRadius: 1,
												bgcolor: alpha(theme.palette.primary.main, 0.12),
												border: '1px solid',
												borderColor: alpha(theme.palette.primary.main, 0.2),
											})}
										>
											<Typography
												sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'primary.main' }}
											>
												P-{pair.pairNo}
											</Typography>
										</Box>
										<Typography
											sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}
										>
											{pair.pairColor}
										</Typography>
									</Stack>
									<Stack alignItems="flex-end" spacing={0.2}>
										<Typography
											sx={{
												fontSize: '0.65rem',
												fontWeight: 800,
												color: connectedEquipment.length > 0 ? 'success.main' : 'text.disabled',
											}}
										>
											{connectedEquipment.length > 0
												? connectedEquipment.map((eq) => eq.name).join(', ')
												: 'SPARE'}
										</Typography>
										{connectedEquipment.length === 0 && (
											<Button size="small" onClick={() => onConnect(pair.id)}>
												Connect
											</Button>
										)}
									</Stack>
								</Box>
							);
						})}
					</Stack>
				</Paper>
			))}
		</Stack>
	);
};

const EcSocketList = ({
	sockets = [],
	subsectionRange,
	socketKm,
	socketError,
	isAdding,
	onSocketChange,
	onSubmit,
}) => {
	const rangeLabel =
		subsectionRange?.startKm !== undefined &&
		subsectionRange?.startKm !== null &&
		subsectionRange?.endKm !== undefined &&
		subsectionRange?.endKm !== null
			? `KM ${subsectionRange.startKm} - ${subsectionRange.endKm}`
			: null;

	if (!sockets.length) {
		return (
			<Paper
				elevation={0}
				sx={{
					p: 2,
					borderRadius: 4,
					border: '1px solid',
					borderColor: 'divider',
					bgcolor: 'background.paper',
				}}
			>
				<Stack spacing={1.5}>
					<Box>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'text.primary' }}>
							EC Sockets
						</Typography>
						{rangeLabel && (
							<Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 0.5 }}>
								Subsection range: {rangeLabel}
							</Typography>
						)}
						<Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 1 }}>
							No sockets recorded yet.
						</Typography>
					</Box>
					<form onSubmit={onSubmit}>
						<Stack direction="row" spacing={1.5} alignItems="flex-start">
							<TextField
								value={socketKm}
								onChange={(event) => onSocketChange(event.target.value)}
								label="Socket KM"
								placeholder="e.g. 10.2/3"
								size="small"
								error={!!socketError}
								helperText={socketError || ' '}
								fullWidth
							/>
							<RtmLoadingButton
								type="submit"
								variant="contained"
								disableElevation
								loading={isAdding}
								loadingText="Adding..."
							>
								Add
							</RtmLoadingButton>
						</Stack>
					</form>
				</Stack>
			</Paper>
		);
	}

	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				borderRadius: 4,
				border: '1px solid',
				borderColor: 'divider',
				bgcolor: 'background.paper',
			}}
		>
			<Stack spacing={1.5}>
				<Box>
					<Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'text.primary' }}>
						EC Sockets
					</Typography>
					{rangeLabel && (
						<Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 0.5 }}>
							Subsection range: {rangeLabel}
						</Typography>
					)}
				</Box>
				<form onSubmit={onSubmit}>
					<Stack direction="row" spacing={1.5} alignItems="flex-start">
						<TextField
							value={socketKm}
							onChange={(event) => onSocketChange(event.target.value)}
							label="Socket KM"
							placeholder="e.g. 10.2/3"
							size="small"
							error={!!socketError}
							helperText={socketError || ' '}
							fullWidth
						/>
						<RtmLoadingButton
							type="submit"
							variant="contained"
							disableElevation
							loading={isAdding}
							loadingText="Adding..."
						>
							Add
						</RtmLoadingButton>
					</Stack>
				</form>
				<Stack spacing={1}>
					{sockets.map((socket, index) => (
						<Box
							key={socket.id}
							sx={{
								p: 1,
								bgcolor: 'background.default',
								borderRadius: 2,
								display: 'flex',
								justifyContent: 'space-between',
								border: '1px solid',
								borderColor: 'divider',
							}}
						>
							<Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'text.primary' }}>
								Socket {index + 1}
							</Typography>
							<Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'text.secondary' }}>
								KM {socket.poleKm}
							</Typography>
						</Box>
					))}
				</Stack>
			</Stack>
		</Paper>
	);
};

const StatItem = ({ label, value }) => (
	<Grid item xs={6}>
		<Box
			sx={{
				p: 1.5,
				bgcolor: 'background.default',
				borderRadius: 2,
				border: '1px solid',
				borderColor: 'divider',
			}}
		>
			<Typography
				sx={{
					fontSize: '0.6rem',
					fontWeight: 700,
					color: 'text.secondary',
					textTransform: 'uppercase',
					mb: 0.5,
				}}
			>
				{label}
			</Typography>
			<Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: 'text.primary' }}>
				{value}
			</Typography>
		</Box>
	</Grid>
);
