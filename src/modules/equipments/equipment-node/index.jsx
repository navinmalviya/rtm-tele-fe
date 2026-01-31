'use client';

import { Memory, Router, Storage } from '@mui/icons-material';
import { Box, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { Handle, Position } from '@xyflow/react';
import { memo, useMemo } from 'react';

const PORT_COLORS = {
	RJ45: '#10B981', // Emerald Green for Ethernet
	SFP: '#3B82F6', // Blue for Fiber/SFP
	CONSOLE: '#64748B', // Slate Gray
	DEFAULT: '#CBD5E1',
};

const ICON_MAP = {
	NETWORKING: <Router sx={{ fontSize: 10 }} />,
	DEFAULT: <Memory sx={{ fontSize: 10 }} />,
};

const EquipmentNode = ({ data, selected }) => {
	const icon = ICON_MAP[data.template?.category] || ICON_MAP.DEFAULT;

	// Helper to detect port type from the 'name' field provided in your JSON
	const getPortType = (name = '') => {
		const lowerName = name.toLowerCase();
		if (lowerName.includes('ethernet')) return 'RJ45';
		if (lowerName.includes('sfp')) return 'SFP';
		if (lowerName.includes('console')) return 'CONSOLE';
		return 'DEFAULT';
	};

	const sortedPorts = useMemo(() => {
		return [...(data.ports || [])].sort((a, b) => {
			// Sort by type (Ethernet first, then SFP)
			const typeA = getPortType(a.name);
			const typeB = getPortType(b.name);
			if (typeA !== typeB) return typeA.localeCompare(typeB);
			// Then sort numerically by the name
			return a.name.localeCompare(b.name, undefined, { numeric: true });
		});
	}, [data.ports]);

	return (
		<Box sx={{ width: 130 }}>
			<Paper
				elevation={selected ? 2 : 0}
				sx={{
					p: '6px 8px',
					borderRadius: 1.5,
					bgcolor: 'white',
					border: selected ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
					transition: 'border 0.1s ease',
				}}
			>
				{/* Header */}
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

				{/* Symmetrical Port Grid - No Background */}
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
										bgcolor: portColor,
										borderRadius: '1px',
										position: 'relative',
										border: '0.5px solid rgba(0,0,0,0.05)',
										'&:hover': {
											transform: 'scale(2)',
											zIndex: 50,
											boxShadow: `0 0 4px ${portColor}`,
										},
									}}
								>
									<Handle
										type="source"
										position={Position.Bottom}
										id={port.id}
										style={{
											background: 'transparent',
											border: 'none',
											width: '100%',
											height: '100%',
											top: 0,
											left: 0,
											transform: 'none',
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
