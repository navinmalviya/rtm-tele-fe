'use client';

import {
	addEdge,
	Background,
	Controls,
	MiniMap,
	Panel,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import AddIcon from '@mui/icons-material/Add'; // Import Add Icon
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Divider, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useBulkUpdateStations } from '@/hooks/stations';
import { useStations } from '@/hooks/stations/useStations';
import { StationNode } from '@/lib/common/nodes';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { AddStationForm } from '../stations';

const nodeTypes = {
	station: StationNode,
};

export default function TopLayerTopology() {
	const { data: stationNodes } = useStations();
	const dispatch = useDispatch();
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
				type: 'station',
				data: {
					...node.data,
					label: node.data.label || node.name,
					code: node.data.code || node.code,
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

	const onNodeDragStop = useCallback((event, node) => {
		setMovedNodes((prev) => ({
			...prev,
			[node.id]: { id: node.id, mapX: node.position.x, mapY: node.position.y },
		}));
	}, []);

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
		if (payload.length > 0) bulkUpdateStations({ stations: payload });
		setIsEditMode(false);
		setMovedNodes({});
	};

	const handleCancel = () => {
		setNodes(stationNodes);
		setMovedNodes({});
		setIsEditMode(false);
	};

	return (
		<Box sx={{ width: '100%', height: '100%', bgcolor: '#F8FAFC' }}>
			{/* Add your logic here: 
                Passing isFormOpen and setIsFormOpen to your component 
            */}
			<AddStationForm />

			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onEdgesChange={onEdgesChange}
				onNodesChange={onNodesChange}
				onConnect={onConnect}
				nodesDraggable={isEditMode}
				onNodeDragStop={onNodeDragStop}
				onSelectionDragStop={onSelectionDragStop}
				zoomOnDoubleClick={false}
				fitView
			>
				<Background variant="dots" gap={24} size={1} color="#cbd5e1" />
				<Panel position="top-left" style={{ margin: 0 }}>
					<Typography variant="h4" sx={{ fontWeight: 800 }}>
						Topology
					</Typography>
				</Panel>

				<Panel
					position="top-right"
					style={{ top: '20px', right: '20px', margin: 0 }}
				>
					<Paper
						elevation={0}
						sx={{
							p: 0.8,
							borderRadius: '16px',
							border: '1px solid #E2E8F0',
							bgcolor: 'rgba(255, 255, 255, 0.9)',
							backdropFilter: 'blur(8px)',
							boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
						}}
					>
						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
						>
							{!isEditMode ? (
								<>
									{/* ADD STATION BUTTON */}
									<Tooltip title="Add Station">
										<IconButton
											onClick={() => {
												dispatch(
													openDrawer(
														{
															drawerName: 'addStationDrawer',
														}
													)
												);
											}}
											sx={{
												bgcolor: 'primary.main',
												color: 'white',
												width: 40,
												height: 40,
												'&:hover': {
													bgcolor: 'primary.dark',
												},
											}}
										>
											<AddIcon fontSize="small" />
										</IconButton>
									</Tooltip>

									<Divider
										orientation="vertical"
										flexItem
										sx={{ mx: 0.5 }}
									/>

									{/* EDIT BUTTON */}
									<Tooltip title="Edit Layout">
										<IconButton
											onClick={() =>
												setIsEditMode(
													true
												)
											}
											sx={{
												bgcolor: 'white',
												border: '1px solid #E2E8F0',
												color: 'text.secondary',
												width: 40,
												height: 40,
												'&:hover': {
													bgcolor: '#F1F5F9',
												},
											}}
										>
											<EditIcon fontSize="small" />
										</IconButton>
									</Tooltip>
								</>
							) : (
								<Stack
									direction="row"
									spacing={1}
									alignItems="center"
								>
									<Typography
										variant="caption"
										sx={{
											fontWeight: 800,
											color: 'primary.main',
											px: 1,
										}}
									>
										EDITING MODE
									</Typography>
									<IconButton
										onClick={handleSave}
										sx={{
											bgcolor: '#4caf50',
											color: 'white',
											width: 40,
											height: 40,
											'&:hover': {
												bgcolor: '#388e3c',
											},
										}}
									>
										<SaveIcon fontSize="small" />
									</IconButton>
									<IconButton
										onClick={
											handleCancel
										}
										sx={{
											bgcolor: '#ef5350',
											color: 'white',
											width: 40,
											height: 40,
											'&:hover': {
												bgcolor: '#d32f2f',
											},
										}}
									>
										<CancelIcon fontSize="small" />
									</IconButton>
								</Stack>
							)}
						</Stack>
					</Paper>
				</Panel>

				<Controls position="bottom-right" />
				<MiniMap position="bottom-left" zoomable pannable />
			</ReactFlow>
		</Box>
	);
}
