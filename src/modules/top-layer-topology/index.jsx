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

// Icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import CableIcon from '@mui/icons-material/Cable';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import PlaceIcon from '@mui/icons-material/Place';
import RouterIcon from '@mui/icons-material/Router';
import SaveIcon from '@mui/icons-material/Save';

import {
	Box,
	Button,
	CircularProgress,
	Divider,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

// Hooks & State
import { useAvailablePorts, useCreatePortLink, usePortLinks } from '@/hooks/port-links';
import { useBulkUpdateStations, useStations } from '@/hooks/stations';
import { StationNode } from '@/lib/common/nodes';
import { openDrawer } from '@/lib/store/slices/drawer-slice';

// Sub-components
import { AddSectionForm } from '../sections';
import { AddStationForm } from '../stations';
import { AddSubSectionForm } from '../sub-sections';

const nodeTypes = {
	station: StationNode,
};

const EDGE_STYLE = {
	type: 'smoothstep',
	animated: true,
	style: { stroke: '#0F172A', strokeWidth: 2 },
	zIndex: 1000,
};

export default function TopLayerTopology() {
	const dispatch = useDispatch();
	const router = useRouter();

	const { data: stationNodes } = useStations();
	const { data: linkData = [] } = usePortLinks(); // Fetch existing links
	const { mutate: bulkUpdateStations } = useBulkUpdateStations();
	const { mutate: createLink } = useCreatePortLink();

	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [movedNodes, setMovedNodes] = useState({});

	const [portMenuAnchor, setPortMenuAnchor] = useState(null);
	const [pendingConnection, setPendingConnection] = useState(null);
	const [activeStationId, setActiveStationId] = useState(null);
	const [assetMenuAnchor, setAssetMenuAnchor] = useState(null);

	const { data: stationPorts = [], isLoading: loadingPorts } = useAvailablePorts(activeStationId);

	// Sync Station Nodes
	useEffect(() => {
		if (stationNodes) {
			const formattedNodes = stationNodes.map((node) => ({
				...node,
				type: 'station',
				data: {
					...node.data,
					label: node.data.label || node.name,
					code: node.data.code || node.code,
					onDoubleClick: () => router.push(`/testroom/station/${node.id}`),
				},
			}));
			setNodes(formattedNodes);
		}
	}, [stationNodes, setNodes, router]);

	useEffect(() => {
		if (linkData.length > 0 && nodes.length > 0) {
			const interStationEdges = linkData
				.filter((link) => {
					// Access nested station IDs
					const sourceStation = link.source.equipment?.stationId;
					const targetStation = link.target.equipment?.stationId;
					return sourceStation && targetStation && sourceStation !== targetStation;
				})
				.map((link) => ({
					id: link.id,
					// Map to the nested equipment.stationId
					source: link.source.equipment.stationId,
					target: link.target.equipment.stationId,
					...EDGE_STYLE,
				}));
			setEdges(interStationEdges);
		}
	}, [linkData, nodes, setEdges]);

	const onNodeClick = useCallback(
		(event, node) => {
			if (!isEditMode) return;
			if (pendingConnection && pendingConnection.stationId === node.id) return;
			setActiveStationId(node.id);
			setPortMenuAnchor(event.currentTarget);
		},
		[isEditMode, pendingConnection]
	);

	const handlePortSelect = (port) => {
		if (!pendingConnection) {
			setPendingConnection({
				stationId: activeStationId,
				portId: port.id,
				portName: port.name,
				equipmentName: port.equipment?.name,
			});
		} else {
			const newEdge = {
				id: `inter-station-${Date.now()}`,
				source: pendingConnection.stationId,
				target: activeStationId,
				...EDGE_STYLE,
			};

			setEdges((eds) => addEdge(newEdge, eds));
			createLink({
				sourcePortId: pendingConnection.portId,
				targetPortId: port.id,
				mediaType: 'OFC',
				cableColor: '#0F172A',
			});

			setPendingConnection(null);
			setActiveStationId(null);
		}
		setPortMenuAnchor(null);
	};

	const handleSavePositions = () => {
		const payload = Object.values(movedNodes);
		if (payload.length > 0) bulkUpdateStations({ stations: payload });
		setIsEditMode(false);
		setMovedNodes({});
	};

	const handleDrawerAction = (drawerName) => {
		dispatch(openDrawer({ drawerName }));
		setAssetMenuAnchor(null);
	};

	return (
		<Box
			sx={{
				width: '100%',
				height: '100%',
				bgcolor: '#F8FAFC',
				p: 2,
				'& .react-flow__edgelayer': { zIndex: '10 !important' },
			}}
		>
			<AddStationForm />
			<AddSubSectionForm />
			<AddSectionForm />

			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodeClick={onNodeClick}
				onNodeDragStop={(_, node) => {
					setMovedNodes((prev) => ({
						...prev,
						[node.id]: { id: node.id, mapX: node.position.x, mapY: node.position.y },
					}));
				}}
				nodesDraggable={isEditMode}
				zoomOnDoubleClick={false}
				fitView
			>
				<Background variant="dots" gap={24} size={1} color="#cbd5e1" />

				<Menu
					anchorEl={portMenuAnchor}
					open={Boolean(portMenuAnchor)}
					onClose={() => {
						setPortMenuAnchor(null);
						if (!pendingConnection) setActiveStationId(null);
					}}
					PaperProps={{
						sx: { width: 320, maxHeight: 400, borderRadius: 3, border: '1px solid #E2E8F0' },
					}}
				>
					<Box sx={{ px: 2, py: 1.5 }}>
						<Typography variant="overline" fontWeight={900} color="primary">
							{pendingConnection ? 'Destination Port' : 'Source Port'}
						</Typography>
					</Box>
					<Divider />
					{loadingPorts ? (
						<Stack alignItems="center" sx={{ p: 4 }}>
							<CircularProgress size={20} />
						</Stack>
					) : stationPorts.length > 0 ? (
						stationPorts.map((port) => (
							<MenuItem key={port.id} onClick={() => handlePortSelect(port)} sx={{ py: 1.2 }}>
								<ListItemIcon>
									<RouterIcon fontSize="small" color="action" />
								</ListItemIcon>
								<ListItemText
									primary={port.name}
									secondary={port.equipment?.name}
									primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
								/>
							</MenuItem>
						))
					) : (
						<Box sx={{ p: 3, textAlign: 'center' }}>
							<Typography variant="caption" color="text.secondary">
								No ports available for this station.
							</Typography>
						</Box>
					)}
				</Menu>

				{pendingConnection && (
					<Panel position="bottom-center">
						<Paper
							elevation={4}
							sx={{
								p: 2,
								borderRadius: 4,
								border: '2px solid #3B82F6',
								bgcolor: 'rgba(255, 255, 255, 0.95)',
							}}
						>
							<Stack direction="row" spacing={3} alignItems="center">
								<CableIcon color="primary" />
								<Box>
									<Typography variant="caption" fontWeight={800} color="primary">
										PHYSICAL ROUTING
									</Typography>
									<Typography variant="body2" fontWeight={700}>
										From: {pendingConnection.equipmentName} ({pendingConnection.portName})
									</Typography>
								</Box>
								<Button
									variant="contained"
									color="error"
									size="small"
									onClick={() => {
										setPendingConnection(null);
										setActiveStationId(null);
									}}
									sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
								>
									Cancel
								</Button>
							</Stack>
						</Paper>
					</Panel>
				)}

				<Panel position="top-right" style={{ top: '20px', right: '20px' }}>
					<Paper
						elevation={0}
						sx={{
							p: 0.8,
							borderRadius: '16px',
							border: '1px solid #E2E8F0',
							bgcolor: 'rgba(255,255,255,0.9)',
						}}
					>
						<Stack direction="row" spacing={1} alignItems="center">
							{!isEditMode ? (
								<>
									<Tooltip title="Add Asset">
										<IconButton
											onClick={(e) => setAssetMenuAnchor(e.currentTarget)}
											sx={{ bgcolor: 'primary.main', color: 'white' }}
										>
											<AddIcon fontSize="small" />
										</IconButton>
									</Tooltip>
									<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
									<Tooltip title="Modify Layout">
										<IconButton onClick={() => setIsEditMode(true)}>
											<EditIcon fontSize="small" />
										</IconButton>
									</Tooltip>
								</>
							) : (
								<>
									<Typography
										variant="caption"
										sx={{ fontWeight: 800, color: 'primary.main', px: 1 }}
									>
										TOPOLOGY EDITING
									</Typography>
									<IconButton
										onClick={handleSavePositions}
										sx={{ bgcolor: '#4caf50', color: 'white' }}
									>
										<SaveIcon fontSize="small" />
									</IconButton>
									<IconButton
										onClick={() => setIsEditMode(false)}
										sx={{ bgcolor: '#ef5350', color: 'white' }}
									>
										<CancelIcon fontSize="small" />
									</IconButton>
								</>
							)}
						</Stack>
					</Paper>
				</Panel>

				<Menu
					anchorEl={assetMenuAnchor}
					open={Boolean(assetMenuAnchor)}
					onClose={() => setAssetMenuAnchor(null)}
				>
					<MenuItem onClick={() => handleDrawerAction('addSectionDrawer')}>
						<ListItemIcon>
							<AccountTreeIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText primary="Add Section" />
					</MenuItem>
					<MenuItem onClick={() => handleDrawerAction('addSubSectionDrawer')}>
						<ListItemIcon>
							<LinearScaleIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText primary="Add Sub-section" />
					</MenuItem>
					<MenuItem onClick={() => handleDrawerAction('addStationDrawer')}>
						<ListItemIcon>
							<PlaceIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText primary="Add Station" />
					</MenuItem>
				</Menu>

				<Controls position="bottom-right" />
				<MiniMap position="bottom-left" zoomable pannable />
			</ReactFlow>
		</Box>
	);
}
