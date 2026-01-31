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
import { useCallback, useEffect } from 'react';
import { useEquipmentByStation, useUpdateEquipment } from '@/hooks/equipment';
import { useCreatePortLink, useDeletePortLink, usePortLinks } from '@/hooks/port-links';
import { EquipmentNode } from '@/modules/equipments';

const nodeTypes = {
	equipmentNode: EquipmentNode,
};

function TopologyCanvas({ stationId }) {
	const { screenToFlowPosition } = useReactFlow();
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);

	const { data: equipmentData = [] } = useEquipmentByStation(stationId);
	const { data: linkData = [] } = usePortLinks(stationId);
	const { mutate: updatePosition } = useUpdateEquipment();
	const { mutate: createLink } = useCreatePortLink(stationId);
	const { mutate: deleteLink } = useDeletePortLink(stationId);

	useEffect(() => {
		if (linkData.length > 0) {
			const initialEdges = linkData.map((link) => ({
				id: link.id,
				source: link.source.equipmentId,
				target: link.target.equipmentId,
				sourceHandle: link.sourcePortId,
				targetHandle: link.targetPortId,
				animated: true,
				style: {
					stroke: link.mediaType === 'SFP' ? '#3B82F6' : '#10B981',
					strokeWidth: 1.5,
				},
			}));
			setEdges(initialEdges);
		}
	}, [linkData, setEdges]);

	// Validation: Prevent self-connections or connections within same device
	const isValidConnection = useCallback((connection) => {
		return connection.source !== connection.target;
	}, []);

	const onConnect = useCallback(
		(params) => {
			// 1. Optimistically update UI (XYFlow needs the suffixed IDs to draw the line)
			setEdges((eds) => addEdge({ ...params, animated: true }, eds));

			// 2. STRIP SUFFIXES: Be aggressive with the cleaning
			// This ensures only the pure UUID reaches the Prisma create call
			const cleanSourceId = params.sourceHandle;
			const cleanTargetId = params.targetHandle;

			// 3. Persist to DB
			createLink({
				sourcePortId: cleanSourceId,
				targetPortId: cleanTargetId,
				mediaType: params.sourceHandle.includes('sfp') ? 'SFP' : 'RJ45',
				cableColor: 'Blue',
			});
		},
		[createLink, setEdges]
	);

	const onEdgesDelete = useCallback(
		(deletedEdges) => {
			for (const edge of deletedEdges) {
				deleteLink(edge.id);
			}
		},
		[deleteLink]
	);

	useEffect(() => {
		if (equipmentData.length > 0) {
			const placedNodes = equipmentData
				.filter((eq) => eq.mapX !== null && eq.mapY !== null)
				.map((eq) => ({
					id: eq.id,
					type: 'equipmentNode',
					position: { x: eq.mapX, y: eq.mapY },
					data: {
						label: eq.name,
						ports: eq.ports,
						template: eq.template,
					},
				}));
			setNodes(placedNodes);
		}
	}, [equipmentData, setNodes]);

	const onDragOver = useCallback((event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);

	const onDrop = useCallback(
		(event) => {
			event.preventDefault();
			const dataStr = event.dataTransfer.getData('application/rtm-equipment');
			if (!dataStr) return;

			const equipment = JSON.parse(dataStr);
			const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

			setNodes((nds) => {
				const filtered = nds.filter((n) => n.id !== equipment.id);
				return filtered.concat({
					id: equipment.id,
					type: 'equipmentNode',
					position,
					data: {
						label: equipment.name,
						ports: equipment.ports,
						template: equipment.template,
					},
				});
			});

			updatePosition({
				id: equipment.id,
				data: { mapX: position.x, mapY: position.y },
			});
		},
		[screenToFlowPosition, setNodes, updatePosition]
	);

	const onNodesDelete = useCallback(
		(deletedNodes) => {
			for (const node of deletedNodes) {
				updatePosition({ id: node.id, data: { mapX: null, mapY: null } });
			}
		},
		[updatePosition]
	);

	return (
		<Box sx={{ width: '100%', height: '100%' }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onEdgesDelete={onEdgesDelete}
				isValidConnection={isValidConnection}
				onDragOver={onDragOver}
				onDrop={onDrop}
				fitView
				colorMode="light"
			>
				<Background color="#CBD5E1" gap={20} variant="dots" />
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
