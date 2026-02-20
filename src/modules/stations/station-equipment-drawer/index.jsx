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
import { alpha } from '@mui/material/styles';
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
					boxShadow: (theme) => `10px 0 20px ${alpha(theme.palette.common.black, 0.08)}`,
					borderLeft: '1px solid',
					borderColor: 'divider',
				},
			}}
		>
			<Box
				sx={{
					width: 380,
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'background.paper',
				}}
			>
				{/* Header */}
				<Box sx={{ p: 3 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
								Station Assets
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
								Drag assets to the canvas to position them
							</Typography>
						</Box>
						<IconButton
							onClick={handleClose}
							size="small"
							sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
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
						sx={{
							mt: 2,
							'& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.default' },
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Search sx={{ fontSize: 18, color: 'text.disabled' }} />
								</InputAdornment>
							),
						}}
					/>
				</Box>

				{/* List Section */}
				<Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
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
									border: '1px solid',
									borderColor: 'divider',
									borderRadius: 3,
									cursor: 'grab',
									userSelect: 'none',
									transition: 'all 0.2s',
									'&:hover': {
										borderColor: 'primary.main',
										bgcolor: 'background.paper',
										boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`,
									},
								}}
							>
								<Stack direction="row" spacing={2} alignItems="center">
									<DragIndicator sx={{ color: 'text.disabled', fontSize: 20 }} />
									<Box
										sx={(theme) => ({
											p: 1,
											bgcolor: alpha(theme.palette.primary.main, 0.12),
											borderRadius: 2,
											color: theme.palette.primary.main,
											display: 'flex',
										})}
									>
										<Memory fontSize="small" />
									</Box>
									<Box sx={{ flex: 1 }}>
										<Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: 'text.primary' }}>
											{eq.name}
										</Typography>
										<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
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
									color: 'text.disabled',
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
