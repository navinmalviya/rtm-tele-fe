import { Paper, Typography } from '@mui/material';
import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';

// We wrap in memo to prevent unnecessary re-renders
const StationNode = memo(({ data }) => {
	console.log('data', data);
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
		<div
			// Standard DOM double-click handler
			onDoubleClick={(e) => {
				e.stopPropagation(); // Prevent the pane from zooming/panning
				data.onDoubleClick();
			}}
			style={{ cursor: 'pointer' }}
		>
			<Paper
				elevation={3}
				sx={{
					p: 2,
					minWidth: 120,
					textAlign: 'center',
					border: '1px solid #ccc',
					bgcolor: '#fff',
					'&:hover': { borderColor: '#2196f3' },
				}}
			>
				<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
					{data.label}
				</Typography>
				<Typography variant="caption" color="textSecondary">
					{data.code}
				</Typography>

				{/* Handles stay here for connectivity */}
				<Handle type="target" position={Position.Top} />
				<Handle type="source" position={Position.Bottom} />
			</Paper>
		</div>
	);
});

StationNode.displayName = 'StationNode';
export default StationNode;
