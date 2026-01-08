'use client';

import { Background, Controls, ReactFlow } from '@xyflow/react';
import { useEffect, useState } from 'react';

export default function StationInternalTopology({ stationId }) {
	const [nodes, setNodes] = useState([]);
	const [edges, setEdges] = useState([]);

	useEffect(() => {
		// Here you would fetch the internal topology using the stationId
		console.log('Fetching internal layout for Station:', stationId);

		// Example: fetch(`/api/stations/${stationId}/topology`)
	}, [stationId]);

	return (
		<div style={{ width: '100%', height: '100%' }}>
			<ReactFlow nodes={nodes} edges={edges} colorMode="light">
				<Background color="#f1f1f1" />
				<Controls />
			</ReactFlow>
		</div>
	);
}
