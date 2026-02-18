'use client';

import { Close, DragIndicator, Memory, Search } from '@mui/icons-material';
import {
	Box,
	IconButton,
	InputAdornment,
	Paper,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { RtmDrawer } from '@/lib/common/layout';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function AddStationEquipmentDrawer({
	stationId,
	equipments = [],
	isLoading = false,
}) {
	const dispatch = useDispatch();
	const [searchTerm, setSearchTerm] = useState('');

	const onDragStart = (event, equipment) => {
		// Store the full equipment object so the canvas has the data it needs immediately
		event.dataTransfer.setData('application/rtm-equipment', JSON.stringify(equipment));
		event.dataTransfer.effectAllowed = 'move';

		// Visual feedback for the drag start
		event.currentTarget.style.opacity = '0.4';
	};

	const onDragEnd = (event) => {
		event.currentTarget.style.opacity = '1';
	};

	const handleClose = () => {
		dispatch(closeDrawer({ drawerName: 'stationEquipmentDrawer' }));
	};

	// Filter assets that don't have coordinates yet
	const unplacedEquipment = equipments.filter(
		(eq) =>
			(eq.mapX === null || eq.mapY === null) &&
			(eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				eq.template?.modelName.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	return (
		<RtmDrawer
			drawerName="stationEquipmentDrawer"
			variant="persistent"
			sx={{
				'& .MuiBackdrop-root': { display: 'none' },
				'& .MuiDrawer-paper': {
					pointerEvents: 'auto',
					boxShadow: '10px 0 20px rgba(0,0,0,0.05)',
					borderLeft: '1px solid #E2E8F0',
				},
			}}
		>
			<Box
				sx={{
					width: 380,
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'white',
				}}
			>
				{/* Header */}
				<Box sx={{ p: 3 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
								Station Assets
							</Typography>
							<Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
								Drag assets to the canvas to position them
							</Typography>
						</Box>
						<IconButton
							onClick={handleClose}
							size="small"
							sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}
						>
							<Close fontSize="small" />
						</IconButton>
					</Stack>

					<TextField
						fullWidth
						size="small"
						placeholder="Search unplaced assets..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#F8FAFC' } }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Search sx={{ fontSize: 18, color: '#94A3B8' }} />
								</InputAdornment>
							),
						}}
					/>
				</Box>

				{/* List Section */}
				<Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#F8FAFC' }}>
					<Stack spacing={1.5}>
						{unplacedEquipment.map((eq) => (
							<Paper
								key={eq.id}
								draggable
								onDragStart={(e) => onDragStart(e, eq)}
								onDragEnd={onDragEnd}
								elevation={0}
								sx={{
									p: 2,
									border: '1px solid #E2E8F0',
									borderRadius: 3,
									cursor: 'grab',
									userSelect: 'none',
									transition: 'all 0.2s',
									'&:hover': {
										borderColor: '#3B82F6',
										bgcolor: 'white',
										boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
									},
								}}
							>
								<Stack direction="row" spacing={2} alignItems="center">
									<DragIndicator sx={{ color: '#CBD5E1', fontSize: 20 }} />
									<Box
										sx={{
											p: 1,
											bgcolor: '#EFF6FF',
											borderRadius: 2,
											color: '#3B82F6',
											display: 'flex',
										}}
									>
										<Memory fontSize="small" />
									</Box>
									<Box sx={{ flex: 1 }}>
										<Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>
											{eq.name}
										</Typography>
										<Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
											{eq.template?.make} {eq.template?.modelName}
										</Typography>
									</Box>
								</Stack>
							</Paper>
						))}

						{unplacedEquipment.length === 0 && !isLoading && (
							<Typography
								sx={{
									textAlign: 'center',
									py: 8,
									color: '#94A3B8',
									fontSize: '0.85rem',
									fontWeight: 600,
								}}
							>
								All assets have been placed.
							</Typography>
						)}
					</Stack>
				</Box>
			</Box>
		</RtmDrawer>
	);
}
