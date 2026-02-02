'use client';

import { Memory, Router } from '@mui/icons-material';
import { Box, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { Handle, Position } from '@xyflow/react';
import { memo, useMemo } from 'react';

const PORT_COLORS = {
	RJ45: '#10B981',
	SFP: '#3B82F6',
	SFP_PLUS: '#8B5CF6',
	CONSOLE: '#64748B',
	DEFAULT: '#CBD5E1',
};

const PORT_PRIORITY = { CONSOLE: 1, RJ45: 2, SFP: 3, SFP_PLUS: 4, DEFAULT: 5 };

const ICON_MAP = {
	NETWORKING: <Router sx={{ fontSize: 10 }} />,
	DEFAULT: <Memory sx={{ fontSize: 10 }} />,
};

const EquipmentNode = ({ data, selected }) => {
	const icon = ICON_MAP[data.template?.category] || ICON_MAP.DEFAULT;

	const getPortType = (name = '') => {
		const lowerName = name.toLowerCase();
		if (lowerName.includes('ethernet')) return 'RJ45';
		if (lowerName.includes('sfp')) return 'SFP';
		if (lowerName.includes('console')) return 'CONSOLE';
		return 'DEFAULT';
	};

	const sortedPorts = useMemo(() => {
		return [...(data.ports || [])].sort((a, b) => {
			const typeA = getPortType(a.name);
			const typeB = getPortType(b.name);
			if (typeA !== typeB) return typeA.localeCompare(typeB);
			return a.name.localeCompare(b.name, undefined, { numeric: true });
		});
	}, [data.ports]);

	return (
		<Box sx={{ width: 130 }}>
			<Paper
				elevation={0} // HIGH elevation creates a new stacking context that blocks edges
				sx={{
					p: '6px 8px',
					bgcolor: 'white',
					border: selected ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
					position: 'relative',
					zIndex: 1, // Keep this low!
					// ...
				}}
			>
				<Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.8 }}>
					<Box sx={{ color: '#3B82F6', display: 'flex' }}>{icon}</Box>
					<Typography
						noWrap
						sx={{
							fontWeight: 900,
							fontSize: '0.55rem',
							color: '#1E293B',
							letterSpacing: '-0.2px',
							flex: 1,
						}}
					>
						{data.label}
					</Typography>
				</Stack>

				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: `repeat(${Math.ceil(sortedPorts.length / 2)}, 1fr)`,
						gap: '2px',
						justifyContent: 'center',
					}}
				>
					{sortedPorts.map((port) => {
						const portType = getPortType(port.name);
						const portColor = PORT_COLORS[portType] || PORT_COLORS.DEFAULT;

						return (
							<Tooltip key={port.id} title={port.name} arrow size="small">
								<Box
									sx={{
										width: 6,
										height: 6,
										bgcolor: port.isOccupied ? '#E2E8F0' : portColor,
										borderRadius: '1px',
										position: 'relative',
										border: '0.5px solid rgba(0,0,0,0.05)',
										'&:hover': {
											transform: 'scale(2.5)',
											zIndex: 50,
											boxShadow: `0 0 4px ${portColor}`,
										},
									}}
								>
									{/* STACKED HANDLES: Allows port to be both Start and End of a cable */}
									<Handle
										type="source"
										position={Position.Bottom}
										id={`${port.id}`}
										isConnectable={!port.isOccupied}
										style={{
											opacity: 0,
											width: '100%',
											height: '100%',
											transform: 'none',
											top: 0,
											left: 0,
										}}
									/>
									<Handle
										type="target"
										position={Position.Bottom}
										id={`${port.id}`}
										isConnectable={!port.isOccupied}
										style={{
											opacity: 0,
											width: '100%',
											height: '100%',
											transform: 'none',
											top: 0,
											left: 0,
										}}
									/>
								</Box>
							</Tooltip>
						);
					})}
				</Box>
			</Paper>
		</Box>
	);
};

export default memo(EquipmentNode);
