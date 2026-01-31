'use client';

import {
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
import { EquipmentNode } from '@/modules/equipments';

// Register the custom equipment node
const nodeTypes = {
	equipmentNode: EquipmentNode,
};

function TopologyCanvas({ stationId }) {
	const { screenToFlowPosition } = useReactFlow();
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const { mutate: updatePosition } = useUpdateEquipment();

	const { data: equipmentData = [] } = useEquipmentByStation(stationId);

	// Sync placed equipment with nodes
	useEffect(() => {
		if (equipmentData.length > 0) {
			const placedNodes = equipmentData
				.filter((eq) => eq.mapX !== null && eq.mapY !== null)
				.map((eq) => ({
					id: eq.id,
					type: 'equipmentNode', // Using the custom type
					position: { x: eq.mapX, y: eq.mapY },
					data: {
						label: eq.name,
						ports: eq.ports, // Essential for rendering the port grid
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
			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			// Optimistic UI update
			const newNode = {
				id: equipment.id,
				type: 'equipmentNode',
				position,
				data: {
					label: equipment.name,
					ports: equipment.ports,
					template: equipment.template,
				},
			};

			setNodes((nds) => {
				const filtered = nds.filter((n) => n.id !== equipment.id);
				return filtered.concat(newNode);
			});

			// Persistence
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
				updatePosition({
					id: node.id,
					data: { mapX: null, mapY: null },
				});
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
				onNodesDelete={onNodesDelete}
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
