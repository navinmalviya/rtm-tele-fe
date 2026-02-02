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
import { useDispatch } from 'react-redux';
import { useEquipmentByStation, useUpdateEquipment } from '@/hooks/equipment';
import { useCreatePortLink, useDeletePortLink, usePortLinks } from '@/hooks/port-links';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { EquipmentNode } from '@/modules/equipments';
import { LinkDetailDrawer } from '@/modules/port-link';

const nodeTypes = {
	equipmentNode: EquipmentNode,
};

// Dark color palette for professional networking
const EDGE_COLORS = {
	SFP: '#1E293B', // Dark Slate (Fiber)
	RJ45: '#0F172A', // Deep Navy (Copper)
	DEFAULT: '#334155', // Slate 700
};

const defaultEdgeOptions = {
	type: 'smoothstep',
	animated: true,
	zIndex: 1000,
	style: {
		strokeWidth: 2,
	},
};

function TopologyCanvas({ stationId }) {
	const { screenToFlowPosition } = useReactFlow();
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const dispatch = useDispatch();

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
				style: {
					// Using dark colors based on media type
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
						style: {
							stroke: isFiber ? EDGE_COLORS.SFP : EDGE_COLORS.RJ45,
							strokeWidth: 2,
						},
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
			dispatch(
				openDrawer({
					drawerName: 'linkDetailDrawer',
					id: edge.id,
				})
			);
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
					data: {
						label: eq.name,
						ports: eq.ports,
						template: eq.template,
					},
				}));
			setNodes(placedNodes);
		}
	}, [equipmentData, setNodes]);

	return (
		<Box
			sx={{
				width: '100%',
				height: '100%',
				// Force Edge layer above Node layer
				'& .react-flow__edgelayer': {
					zIndex: '10 !important',
				},
				// Ensure nodes are below but still interactive
				'& .react-flow__node': {
					zIndex: '5 !important',
				},
				// Darken the animated dots for better visibility on light background
				'& .react-flow__edge-animation': {
					stroke: '#94A3B8',
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
				// biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
				onEdgesDelete={(deleted) => deleted.forEach((e) => deleteLink(e.id))}
				defaultEdgeOptions={defaultEdgeOptions}
				fitView
				colorMode="light"
			>
				<Background color="#E2E8F0" gap={20} variant="dots" />
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
