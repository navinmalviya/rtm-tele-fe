'use client';

import {
	addEdge,
	Background,
	Controls,
	MiniMap,
	Panel, // Added for UI controls inside Flow
	ReactFlow,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useBulkUpdateStations } from '@/hooks/stations';
import { useStations } from '@/hooks/stations/useStations';
import { StationNode } from '@/lib/common/nodes';
import { AddStationForm } from '../stations';

const nodeTypes = {
	station: StationNode,
};

export default function TopLayerTopology() {
	const { data: stationNodes } = useStations();
	const router = useRouter();
	const { mutate: bulkUpdateStations } = useBulkUpdateStations();
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);

	const [isEditMode, setIsEditMode] = useState(false);
	const [movedNodes, setMovedNodes] = useState({});

	useEffect(() => {
		if (stationNodes) {
			const formattedNodes = stationNodes.map((node) => ({
				...node,
				type: 'station', // Use our custom type
				data: {
					...node.data,
					label: node.data.label || node.name,
					code: node.data.code || node.code,
					// Pass the navigation function directly into the data object
					onDoubleClick: () =>
						router.push(`/admin/station/${node.id}`),
				},
			}));
			setNodes(formattedNodes);
		}
	}, [stationNodes, setNodes, router]);

	const onConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[setEdges]
	);

	// --- New Event Handlers ---

	// Tracks nodes as they are moved
	const onNodeDragStop = useCallback((event, node) => {
		setMovedNodes((prev) => ({
			...prev,
			[node.id]: { id: node.id, mapX: node.position.x, mapY: node.position.y },
		}));
	}, []);

	// Tracks multiple nodes if dragged together
	const onSelectionDragStop = useCallback((event, selectedNodes) => {
		const updates = {};
		selectedNodes.forEach((node) => {
			updates[node.id] = {
				id: node.id,
				mapX: node.position.x,
				mapY: node.position.y,
			};
		});
		setMovedNodes((prev) => ({ ...prev, ...updates }));
	}, []);

	const handleSave = () => {
		const payload = Object.values(movedNodes);
		if (payload.length > 0) {
			console.log('Sending Bulk Update:', payload);
			bulkUpdateStations({ stations: payload });
		}
		setIsEditMode(false);
		setMovedNodes({});
	};

	const handleCancel = () => {
		setNodes(stationNodes); // Reset to original positions from API
		setMovedNodes({});
		setIsEditMode(false);
	};

	return (
		<Box sx={{ width: '100%', height: '100%' }}>
			<AddStationForm />
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes} // Register custom types
				onEdgesChange={onEdgesChange}
				onNodesChange={onNodesChange}
				onConnect={onConnect}
				nodesDraggable={isEditMode}
				onNodeDragStop={onNodeDragStop}
				onSelectionDragStop={onSelectionDragStop}
				zoomOnDoubleClick={false}
				nodesFocusable={true}
				elementsSelectable={true}
				fitView
				colorMode="light"
			>
				<Background variant="dots" gap={20} size={1} color="#cbd5e1" />

				{/* Floating Action Panel (Positioned top-right) */}
				<Panel
					position="top-right"
					style={{
						margin: 0,
						top: '55px', // Match this to your Navbar's top position
						right: '200px', // Optional: padding from the right edge
						width: 'fit-content',
					}}
				>
					<Paper
						elevation={4}
						sx={{
							px: '8px',
							py: '5px',
							borderRadius: '100px',
							border: '1px solid #e0e0e0',
							bgcolor: 'rgba(255, 255, 255, 0.9)',
							backdropFilter: 'blur(2px)',
						}}
					>
						{!isEditMode ? (
							<IconButton
								onClick={() => setIsEditMode(true)}
								sx={{
									bgcolor: '#fff',
									border: '1.5px solid #2196f3',
									// mr: 1.5,
									width: 42,
									height: 42,
									'&:hover': {
										bgcolor: '#fff',
									},
								}}
							>
								<EditIcon
									sx={{
										color: '#333',
										fontSize: '1.3rem',
									}}
								/>
							</IconButton>
						) : (
							<Stack
								direction="row"
								spacing={1}
								alignItems="center"
							>
								<Typography
									variant="caption"
									sx={{
										mr: 1,
										fontWeight: 700,
										color: 'primary.main',
									}}
								>
									EDITING MODE
								</Typography>
								<IconButton
									onClick={handleSave}
									sx={{
										bgcolor: '#fff',
										border: '2px solid #4caf50',
										// mr: 1.5,
										width: 42,
										height: 42,
										'&:hover': {
											bgcolor: '#fff',
										},
									}}
								>
									<SaveIcon
										sx={{
											color: '#4caf50',
											fontSize: '1.3rem',
										}}
									/>
								</IconButton>
								<IconButton
									onClick={handleCancel}
									sx={{
										bgcolor: '#fff',
										border: '2px solid #ef5350',
										// mr: 1.5,
										width: 42,
										height: 42,
										'&:hover': {
											bgcolor: '#fff',
										},
									}}
								>
									<CancelIcon
										sx={{
											color: '#ef5350',
											fontSize: '1.3rem',
										}}
									/>
								</IconButton>
							</Stack>
						)}
					</Paper>
				</Panel>

				<Controls position="bottom-right" />
				<MiniMap position="bottom-right" zoomable pannable />
			</ReactFlow>
		</Box>
	);
}
