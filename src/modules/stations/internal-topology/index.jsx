'use client';

import {
	addEdge,
	Background,
	Controls,
	ReactFlow,
	ReactFlowProvider,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useEquipmentByStation, useUpdateEquipment } from '@/hooks/equipment';
import { useCreatePortLink, useDeletePortLink, usePortLinks } from '@/hooks/port-links';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { EquipmentNode } from '@/modules/equipments';
import { LinkDetailDrawer } from '@/modules/port-link';

const nodeTypes = {
	equipmentNode: EquipmentNode,
};

const defaultEdgeOptions = {
	type: 'smoothstep',
	animated: true,
	zIndex: 1000,
	style: { strokeWidth: 2 },
};

function TopologyCanvas({ stationId }) {
	const theme = useTheme();
	const darkEdgeColor =
		theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.primary.dark;
	const EDGE_COLORS = {
		SFP: darkEdgeColor,
		RJ45: darkEdgeColor,
		DEFAULT: theme.palette.text.secondary,
	};

	const { screenToFlowPosition } = useReactFlow();
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const dispatch = useDispatch();

	const { data: equipmentData = [] } = useEquipmentByStation(stationId);
	const { data: linkData = [] } = usePortLinks(stationId);
	const { mutate: updatePosition } = useUpdateEquipment();
	const { mutate: createLink } = useCreatePortLink(stationId);
	const { mutate: deleteLink } = useDeletePortLink(stationId);

	// --- Drag & Drop Handlers ---

	const onDragOver = useCallback((event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);

	const onDrop = useCallback(
		(event) => {
			event.preventDefault();

			const rawData = event.dataTransfer.getData('application/rtm-equipment');
			if (!rawData) return;

			const draggedEquipment = JSON.parse(rawData);

			// Transform screen pixels to relative Flow coordinates
			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			// OPTIMISTIC UPDATE: Add the node locally so it appears instantly
			const newNode = {
				id: draggedEquipment.id,
				type: 'equipmentNode',
				position,
				data: {
					label: draggedEquipment.name,
					ports: draggedEquipment.ports || [],
					template: draggedEquipment.template,
				},
			};

			setNodes((nds) => nds.concat(newNode));

			// TRIGGER API: Save coordinates to DB
			updatePosition({
				id: draggedEquipment.id,
				mapX: position.x,
				mapY: position.y,
			});
		},
		[screenToFlowPosition, updatePosition, setNodes]
	);

	const onNodeDragStop = useCallback(
		(_, node) => {
			// Update coordinates when a node is moved within the canvas
			updatePosition({
				id: node.id,
				mapX: node.position.x,
				mapY: node.position.y,
			});
		},
		[updatePosition]
	);

	// --- Existing Edge & Node Sync Logic ---

	useEffect(() => {
		if (linkData.length > 0) {
			const initialEdges = linkData.map((link) => ({
				id: link.id,
				source: link.source.equipmentId,
				target: link.target.equipmentId,
				sourceHandle: link.sourcePortId,
				targetHandle: link.targetPortId,
				style: {
					stroke: link.mediaType === 'SFP' ? EDGE_COLORS.SFP : EDGE_COLORS.RJ45,
				},
			}));
			setEdges(initialEdges);
		}
	}, [linkData, setEdges]);

	const onConnect = useCallback(
		(params) => {
			const isFiber = params.sourceHandle.includes('sfp');
			setEdges((eds) =>
				addEdge(
					{
						...params,
						style: { stroke: isFiber ? EDGE_COLORS.SFP : EDGE_COLORS.RJ45, strokeWidth: 2 },
					},
					eds
				)
			);

			createLink({
				sourcePortId: params.sourceHandle,
				targetPortId: params.targetHandle,
				mediaType: isFiber ? 'SFP' : 'RJ45',
				cableColor: isFiber ? 'DarkSlate' : 'DeepNavy',
			});
		},
		[createLink, setEdges]
	);

	const onEdgeClick = useCallback(
		(_, edge) => {
			dispatch(openDrawer({ drawerName: 'linkDetailDrawer', id: edge.id }));
		},
		[dispatch]
	);

	useEffect(() => {
		if (equipmentData.length > 0) {
			const placedNodes = equipmentData
				.filter((eq) => eq.mapX !== null && eq.mapY !== null)
				.map((eq) => ({
					id: eq.id,
					type: 'equipmentNode',
					position: { x: eq.mapX, y: eq.mapY },
					data: { label: eq.name, ports: eq.ports, template: eq.template },
				}));
			setNodes(placedNodes);
		}
	}, [equipmentData, setNodes]);

	return (
		<Box
			onDragOver={onDragOver}
			onDrop={onDrop}
			sx={{
				width: '100%',
				height: '100%',
				'& .react-flow__edgelayer': { zIndex: '10 !important' },
				'& .react-flow__edge-path': {
					stroke: `${darkEdgeColor} !important`,
				},
				'& .react-flow__node': { zIndex: '5 !important' },
				'& .react-flow__edge-animation': {
					stroke: theme.palette.text.disabled,
					strokeOpacity: 0.8,
				},
			}}
		>
			<LinkDetailDrawer stationId={stationId} />
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onEdgeClick={onEdgeClick}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onNodeDragStop={onNodeDragStop}
				onEdgesDelete={(deleted) => {
					(deleted || []).forEach((edge) => {
						deleteLink(edge.id);
					});
				}}
				defaultEdgeOptions={defaultEdgeOptions}
				fitView
				colorMode={theme.palette.mode}
			>
				<Background color={theme.palette.divider} gap={20} variant="dots" />
				<Controls />
			</ReactFlow>
		</Box>
	);
}

export default function StationInternalTopology({ stationId }) {
	return (
		<ReactFlowProvider>
			<TopologyCanvas stationId={stationId} />
		</ReactFlowProvider>
	);
}
