import {
	AddCircleOutline,
	Cable,
	ChangeHistory,
	Edit,
	Launch,
	Visibility,
} from '@mui/icons-material';
import {
	Box,
	ButtonBase,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
	Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';

const getCableRange = (cable) => {
	if ((cable.sideSegments || []).length > 0) {
		const min = Math.min(...cable.sideSegments.map((segment) => segment.fromKm));
		const max = Math.max(...cable.sideSegments.map((segment) => segment.toKm));
		return { min, max };
	}
	const lengthMeters = Number.parseFloat(cable.length);
	if (Number.isFinite(lengthMeters)) {
		return { min: 0, max: lengthMeters / 1000 };
	}
	return { min: 0, max: 0 };
};

const buildRange = (cables) => {
	let min = Infinity;
	let max = -Infinity;
	cables.forEach((cable) => {
		const range = getCableRange(cable);
		min = Math.min(min, range.min);
		max = Math.max(max, range.max);
	});
	if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
		return { min: 0, max: 10 };
	}
	return { min, max };
};

export const TrackLayout = ({
	cables,
	selectedId,
	onCableSelect,
	onViewCable,
	onEditCable,
	onOpenCablePage,
	onAddJoint,
	onAddEcJoint,
}) => {
	const range = buildRange(cables);
	const span = range.max - range.min;
	const ticks = Array.from({ length: 6 }, (_, i) => range.min + (span / 5) * i);
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);
	const [menuCable, setMenuCable] = useState(null);

	const openCableMenu = (event, cable) => {
		setMenuAnchorEl(event.currentTarget);
		setMenuCable(cable);
		onCableSelect(cable.id);
	};

	const closeCableMenu = () => {
		setMenuAnchorEl(null);
		setMenuCable(null);
	};

	return (
		<Box
			sx={{
				borderRadius: 4,
				border: '1px solid',
				borderColor: 'divider',
				bgcolor: 'background.paper',
				p: 3,
			}}
		>
			<Stack spacing={2}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography sx={{ fontWeight: 800, color: 'text.primary' }}>Cable Route Map</Typography>
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
						KM {range.min.toFixed(1)} - {range.max.toFixed(1)}
					</Typography>
				</Box>

				<Box sx={{ position: 'relative' }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 1 }}>
						{ticks.map((tick) => (
							<Typography key={tick} sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
								{tick.toFixed(1)}
							</Typography>
						))}
					</Box>

					<SingleTrackCanvas
						cables={cables}
						range={range}
						selectedId={selectedId}
						onSelect={openCableMenu}
					/>
				</Box>
			</Stack>
			<Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={closeCableMenu}>
				<MenuItem
					onClick={() => {
						if (menuCable?.id) onOpenCablePage?.(menuCable.id);
						closeCableMenu();
					}}
				>
					<ListItemIcon>
						<Launch fontSize="small" />
					</ListItemIcon>
					<ListItemText primary="View" />
				</MenuItem>
				<MenuItem
					onClick={() => {
						if (menuCable?.id) onViewCable?.(menuCable.id);
						closeCableMenu();
					}}
				>
					<ListItemIcon>
						<Visibility fontSize="small" />
					</ListItemIcon>
					<ListItemText primary="View Parameters & Circuits" />
				</MenuItem>
				<MenuItem
					onClick={() => {
						if (menuCable?.id) onEditCable?.(menuCable.id);
						closeCableMenu();
					}}
				>
					<ListItemIcon>
						<Edit fontSize="small" />
					</ListItemIcon>
					<ListItemText primary="Edit Cable" />
				</MenuItem>
				<MenuItem
					onClick={() => {
						if (menuCable?.id) onAddJoint?.(menuCable.id);
						closeCableMenu();
					}}
				>
					<ListItemIcon>
						<AddCircleOutline fontSize="small" />
					</ListItemIcon>
					<ListItemText primary="Add Joint" />
				</MenuItem>
				<MenuItem
					onClick={() => {
						if (menuCable?.id) onAddEcJoint?.(menuCable.id);
						closeCableMenu();
					}}
				>
					<ListItemIcon>
						<ChangeHistory fontSize="small" />
					</ListItemIcon>
					<ListItemText primary="Add EC Joint" />
				</MenuItem>
			</Menu>
		</Box>
	);
};

const SingleTrackCanvas = ({ cables, range, selectedId, onSelect }) => {
	const theme = useTheme();
	const height = 220;
	const width = 900;
	const upY = 60;
	const downY = 160;
	const railY = 110;
	const rowSpacing = 12;
	const parseJointKmFromText = (value) => {
		const match = String(value || '').match(/^\s*(\d+(\.\d+)?)/);
		return match ? Number.parseFloat(match[1]) : null;
	};

	const scaleX = (km) => ((km - range.min) / (range.max - range.min)) * width;

	const cableRows = cables.map((cable, index) => {
		const segments =
			(cable.sideSegments || []).length > 0
				? cable.sideSegments
				: [
						{
							fromKm: range.min,
							toKm: range.min + (Number.parseFloat(cable.length) || 0) / 1000,
							side: cable.side || 'UP',
						},
					];

		const sortedSegments = [...segments].sort((a, b) => a.fromKm - b.fromKm);
		const connectors = [];
		for (let i = 1; i < sortedSegments.length; i += 1) {
			const prev = sortedSegments[i - 1];
			const next = sortedSegments[i];
			if (prev.side !== next.side && Math.abs(prev.toKm - next.fromKm) < 0.01) {
				connectors.push({
					x: scaleX(prev.toKm),
					fromSide: prev.side,
					toSide: next.side,
				});
			}
		}

		const stroke =
			selectedId === cable.id ? theme.palette.primary.dark : theme.palette.primary.main;
		const ofcStroke = theme.palette.warning.main;
		const cableStroke = cable.type === 'OFC' ? ofcStroke : stroke;
		const offset = index * rowSpacing;
		const jointMarkers = (cable.joints || [])
			.map((joint) => {
				const jointKm = Number.isFinite(Number(joint.jointKm))
					? Number(joint.jointKm)
					: parseJointKmFromText(joint.locationKM);
				if (jointKm === null || jointKm < range.min || jointKm > range.max) {
					return null;
				}
				let markerSide = joint.side || null;
				if (!markerSide) {
					const matchedSegment = sortedSegments.find(
						(segment) => jointKm >= segment.fromKm && jointKm <= segment.toKm
					);
					markerSide = matchedSegment?.side || cable.side || 'UP';
				}
				return {
					id: joint.id,
					x: scaleX(jointKm),
					y: markerSide === 'DOWN' ? downY + offset : upY - offset,
					type: joint.jointType || 'NORMAL',
					jointKm,
					jointDate: joint.jointDate,
					locationKM: joint.locationKM,
				};
			})
			.filter(Boolean);

		return { cable, sortedSegments, connectors, cableStroke, offset, jointMarkers };
	});

	return (
		<Box
			sx={{
				borderRadius: 3,
				border: '1px solid',
				borderColor: 'divider',
				bgcolor: 'background.default',
				p: 2,
			}}
		>
			<svg
				width="100%"
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				preserveAspectRatio="none"
				role="img"
				aria-label="Cable route map"
			>
				<title>Cable Route Map</title>
				{/* Track */}
				<rect x="0" y={railY - 14} width={width} height="28" fill="#2b2f36" rx="14" />
				<line x1="0" x2={width} y1={railY - 6} y2={railY - 6} stroke="#cbd5f5" strokeWidth="2" />
				<line x1="0" x2={width} y1={railY + 6} y2={railY + 6} stroke="#cbd5f5" strokeWidth="2" />
				{Array.from({ length: 20 }).map((_, i) => (
					<rect
						key={`sleeper-${i}`}
						x={10 + i * 44}
						y={railY - 20}
						width="34"
						height="40"
						fill="#1f2937"
						rx="5"
						opacity="0.6"
					/>
				))}

				{/* UP/DOWN guide lines */}
				<line x1="0" x2={width} y1={upY} y2={upY} stroke="#e5e7eb" strokeWidth="2" />
				<line x1="0" x2={width} y1={downY} y2={downY} stroke="#e5e7eb" strokeWidth="2" />

				{cableRows.map((row) => (
					<g key={row.cable.id}>
						{row.sortedSegments.map((segment, segIndex) => {
							const x1 = scaleX(segment.fromKm);
							const x2 = scaleX(segment.toKm);
							const y = segment.side === 'DOWN' ? downY + row.offset : upY - row.offset;
							return (
								// biome-ignore lint/a11y/noStaticElementInteractions: SVG line interaction selects a cable row.
								<line
									key={`${row.cable.id}-${segment.side}-${segIndex}`}
									x1={x1}
									x2={x2}
									y1={y}
									y2={y}
									stroke={row.cableStroke}
									strokeWidth="4"
									strokeLinecap="round"
									style={{ cursor: 'pointer' }}
									onClick={(event) => onSelect(event, row.cable)}
								/>
							);
						})}
						{row.connectors.map((connector, idx) => {
							const fromY = connector.fromSide === 'DOWN' ? downY + row.offset : upY - row.offset;
							const toY = connector.toSide === 'DOWN' ? downY + row.offset : upY - row.offset;
							const controlY = (fromY + toY) / 2;
							return (
								// biome-ignore lint/a11y/noStaticElementInteractions: SVG path interaction selects a cable row.
								<path
									key={`${row.cable.id}-connector-${idx}`}
									d={`M ${connector.x} ${fromY} C ${connector.x + 25} ${controlY}, ${connector.x - 25} ${controlY}, ${connector.x} ${toY}`}
									stroke={row.cableStroke}
									strokeWidth="3"
									fill="none"
									style={{ cursor: 'pointer' }}
									onClick={(event) => onSelect(event, row.cable)}
								/>
							);
						})}
						{row.jointMarkers.map((joint) => (
							<g key={`${row.cable.id}-joint-${joint.id}`}>
								{joint.type === 'EC' ? (
									<path
										d={`M ${joint.x} ${joint.y - 7} L ${joint.x + 7} ${joint.y} L ${joint.x} ${joint.y + 7} L ${joint.x - 7} ${joint.y} Z`}
										fill={theme.palette.warning.main}
										stroke={theme.palette.background.paper}
										strokeWidth="1.5"
									>
										<title>
											{`EC Joint • KM ${joint.jointKm.toFixed(2)}${joint.locationKM ? ` • ${joint.locationKM}` : ''}${
												joint.jointDate
													? ` • ${new Date(joint.jointDate).toLocaleDateString('en-IN')}`
													: ''
											}`}
										</title>
									</path>
								) : (
									<circle
										cx={joint.x}
										cy={joint.y}
										r="5"
										fill={theme.palette.info.main}
										stroke={theme.palette.background.paper}
										strokeWidth="1.5"
									>
										<title>
											{`Joint • KM ${joint.jointKm.toFixed(2)}${joint.locationKM ? ` • ${joint.locationKM}` : ''}${
												joint.jointDate
													? ` • ${new Date(joint.jointDate).toLocaleDateString('en-IN')}`
													: ''
											}`}
										</title>
									</circle>
								)}
							</g>
						))}
					</g>
				))}
			</svg>

			<Stack direction="row" spacing={2} sx={{ mt: 1 }}>
				<Stack direction="row" spacing={0.75} alignItems="center">
					<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'info.main' }} />
					<Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', fontWeight: 700 }}>
						Joint
					</Typography>
				</Stack>
				<Stack direction="row" spacing={0.75} alignItems="center">
					<Box
						sx={{
							width: 10,
							height: 10,
							bgcolor: 'warning.main',
							transform: 'rotate(45deg)',
						}}
					/>
					<Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', fontWeight: 700 }}>
						EC Joint
					</Typography>
				</Stack>
			</Stack>

			<Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap' }}>
				{cables.map((cable) => (
					<ButtonBase
						key={cable.id}
						onClick={(event) => onSelect(event, cable)}
						sx={{
							borderRadius: 2,
							border: '1px solid',
							borderColor: selectedId === cable.id ? 'primary.main' : 'divider',
							bgcolor: selectedId === cable.id ? 'action.hover' : 'background.paper',
							px: 1.5,
							py: 1,
						}}
					>
						<Stack direction="row" spacing={1} alignItems="center">
							<Cable sx={{ fontSize: 14, color: 'primary.main' }} />
							<Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'text.primary' }}>
								{cable.subType}
							</Typography>
							<Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
								{cable.length}m
							</Typography>
						</Stack>
					</ButtonBase>
				))}
			</Stack>
		</Box>
	);
};
