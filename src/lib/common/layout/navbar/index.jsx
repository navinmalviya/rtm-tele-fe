'use client';

import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { getNavbarTitle } from '@/lib/util';

export default function CompactNavbar() {
	const [anchorEl, setAnchorEl] = useState(null);
	const params = useParams(); // Get stationId from URL
	const pathname = usePathname();
	const dispatch = useDispatch();
	const router = useRouter();
	const open = Boolean(anchorEl);
	const isStationView = !!params.stationId;

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				width: '30%', // Restricts the navbar to 30% of the 1350px container
				minWidth: '380px', // Prevents it from getting too squashed on smaller screens
				gap: 3, // Space between "RTM Tele" and the "Dashboard" pill
			}}
		>
			{/* 1. RTM Tele - Occupies its own space on the far left */}
			<Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
				<Typography
					variant="h6"
					sx={{
						fontWeight: 800,
						lineHeight: 1,
						color: '#333',
						fontSize: '1.7rem',
					}}
				>
					RTM tele
				</Typography>
			</Box>

			{/* 2. Dashboard Pill - Follows immediately after */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					bgcolor: '#1565c0',
					borderRadius: '50px',
					pl: 0.8,
					pr: 3,
					py: 0.6,
					boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
					flexShrink: 0, // Prevents the pill from shrinking
				}}
			>
				<IconButton
					onClick={handleClick}
					sx={{
						bgcolor: '#fff',
						border: '1.5px solid #2196f3',
						mr: 1.5,
						width: 42,
						height: 42,
						'&:hover': { bgcolor: '#fff' },
					}}
				>
					<MenuIcon sx={{ color: '#333', fontSize: '1.3rem' }} />
				</IconButton>

				<Typography
					variant="body1"
					sx={{
						fontWeight: 700,
						color: '#FFF',
						whiteSpace: 'nowrap',
					}}
				>
					{getNavbarTitle(pathname)}
				</Typography>

				<Menu
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					PaperProps={{
						sx: {
							mt: 1,
							borderRadius: '12px',
							bgcolor: '#FFF',
							minWidth: 160,
						},
					}}
				>
					{isStationView
						? // --- STATION SPECIFIC MENU ---
							[
								<MenuItem
									key="loc"
									onClick={() => {
										dispatch(
											openDrawer({
												drawerName: 'addLocationDrawer',
											})
										);
										handleClose();
									}}
								>
									Add Location
								</MenuItem>,
								<MenuItem
									key="rack"
									onClick={() => {
										dispatch(
											openDrawer({
												drawerName: 'addRackDrawer',
											})
										);
										handleClose();
									}}
								>
									Add Rack
								</MenuItem>,
								<MenuItem
									key="eq"
									onClick={() => {
										dispatch(
											openDrawer({
												drawerName: 'addEquipmentDrawer',
											})
										);
										handleClose();
									}}
								>
									Add Equipment
								</MenuItem>,
								<MenuItem
									key="topo"
									sx={{
										borderTop: '1px solid #eee',
										mt: 1,
										color: '#1565c0',
									}}
									onClick={() =>
										router.push(
											'/admin/topology'
										)
									}
								>
									Top Layer Topology
								</MenuItem>,
							]
						: // --- GLOBAL MENU ---
							[
								<MenuItem
									key="station"
									onClick={() => {
										dispatch(
											openDrawer({
												drawerName: 'addStationDrawer',
											})
										);
										handleClose();
									}}
								>
									Add Station
								</MenuItem>,
								<MenuItem
									key="dash"
									onClick={() =>
										router.push(
											'/admin/dashboard'
										)
									}
								>
									Dashboard
								</MenuItem>,
							]}
				</Menu>
			</Box>
		</Box>
	);
}
