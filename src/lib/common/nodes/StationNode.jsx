'use client';

import { Box, Paper, Typography } from '@mui/material';
import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';

const StationNode = memo(({ data }) => {
	// 5-6 horizontal offsets for existing links to spread out
	const handleOffsets = [15, 30, 50, 70, 85];

	return (
		<Box
			onDoubleClick={(e) => {
				e.stopPropagation();
				data.onDoubleClick();
			}}
			sx={{ cursor: 'pointer' }}
		>
			<Paper
				elevation={3}
				sx={{
					p: 2,
					minWidth: 140,
					textAlign: 'center',
					border: '1px solid',
					borderColor: 'divider',
					borderRadius: '8px',
					bgcolor: 'background.paper',
					position: 'relative',
					'&:hover': { borderColor: 'primary.main' },
				}}
			>
				<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
					{data.label}
				</Typography>

				{/* --- MASTER HANDLES (For creating NEW links) --- */}
				{/* These have no ID, so the 'createLink' logic finds them first */}
				<Handle
					type="target"
					position={Position.Top}
					style={{ opacity: 0, width: '100%', borderRadius: 0 }}
				/>
				<Handle
					type="source"
					position={Position.Bottom}
					style={{ opacity: 0, width: '100%', borderRadius: 0 }}
				/>

				{/* --- DISTRIBUTION HANDLES (For showing EXISTING links) --- */}
				{handleOffsets.map((offset, index) => (
					<Box key={`handles-${index}`}>
						<Handle
							type="target"
							position={Position.Top}
							id={`target-${index}`} // Specific IDs for DB links
							style={{
								left: `${offset}%`,
								background: 'transparent',
								border: 'none',
							}}
						/>
						<Handle
							type="source"
							position={Position.Bottom}
							id={`source-${index}`} // Specific IDs for DB links
							style={{
								left: `${offset}%`,
								background: 'transparent',
								border: 'none',
							}}
						/>
					</Box>
				))}
			</Paper>
		</Box>
	);
});

StationNode.displayName = 'StationNode';
export default StationNode;
