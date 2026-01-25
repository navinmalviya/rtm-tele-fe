'use client';
import { Assessment, Dashboard, Hub, Inventory, Logout, Settings } from '@mui/icons-material';
import {
	Box,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

const sidebarWidth = 280;

const menuItems = [
	{ text: 'Dashboard', icon: <Dashboard />, path: '/testroom/dashboard' },
	{ text: 'Topology', icon: <Hub />, path: '/testroom/topology' },
	{ text: 'Reports', icon: <Assessment />, path: '/testroom/reports' },
	{ text: 'Asset Management', icon: <Inventory />, path: '/testroom/assets' },
];

export default function SideMenu() {
	const pathname = usePathname();
	const router = useRouter();
	const handleLogout = async () => {
		// 1. Clear NextAuth Session (Clears 'next-auth.session-token')
		await signOut({ redirect: false });

		// 2. Clear Custom Cookies
		// If you know the names:
		// Cookies.remove('next-auth.csrf-token');
		// Cookies.remove('next-auth.callback-url');
		// Cookies.remove('__next_hmr_refresh_hash__');

		// If you want to clear ALL cookies:
		Object.keys(Cookies.get()).forEach((cookieName) => {
			Cookies.remove(cookieName);
		});

		// 3. Clear Storage
		localStorage.clear();
		sessionStorage.clear();

		// 4. Redirect to home/login
		router.push('/');
	};

	return (
		<Box
			sx={{
				width: sidebarWidth,
				flexShrink: 0,
				bgcolor: 'background.paper',
				color: 'white',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				position: 'fixed',
				left: 0,
				top: 0,
			}}
		>
			{/* Logo/Header Area */}
			<Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
				<Box
					sx={{
						width: 40,
						height: 40,
						bgcolor: 'primary.main',
						borderRadius: 2,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Hub sx={{ color: 'white' }} />
				</Box>
				<Typography variant="h6" sx={{ fontWeight: 800 }}>
					RTM Telecom
				</Typography>
			</Box>

			<Typography
				variant="overline"
				sx={{
					px: 3,
					mt: 2,
					color: 'rgba(255,255,255,0.4)',
					fontWeight: 700,
				}}
			>
				GENERAL
			</Typography>

			<List sx={{ px: 2, mt: 1 }}>
				{menuItems.map((item) => {
					const isActive = pathname === item.path;
					return (
						<ListItem
							key={item.text}
							disablePadding
							sx={{ mb: 1 }}
						>
							<ListItemButton
								onClick={() =>
									router.push(item.path)
								}
								sx={{
									borderRadius: 3,
									bgcolor: isActive
										? 'primary.main'
										: 'transparent',
									'&:hover': {
										bgcolor: isActive
											? 'primary.main'
											: 'rgba(255,255,255,0.05)',
									},
									transition: 'all 0.2s',
								}}
							>
								<ListItemIcon
									sx={{
										color: isActive
											? 'white'
											: 'rgba(255,255,255,0.5)',
										minWidth: 45,
									}}
								>
									{item.icon}
								</ListItemIcon>
								<ListItemText
									primary={item.text}
									primaryTypographyProps={{
										fontWeight: isActive
											? 700
											: 500,
										color: isActive
											? 'white'
											: 'rgba(255,255,255,0.7)',
									}}
								/>
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>

			<Box sx={{ mt: 'auto', p: 2 }}>
				<Typography
					variant="overline"
					sx={{
						px: 2,
						color: 'rgba(255,255,255,0.4)',
						fontWeight: 700,
					}}
				>
					SUPPORT
				</Typography>
				<ListItemButton
					sx={{ borderRadius: 3, color: 'rgba(255,255,255,0.7)' }}
				>
					<ListItemIcon sx={{ color: 'inherit', minWidth: 45 }}>
						<Settings />
					</ListItemIcon>
					<ListItemText primary="Settings" />
				</ListItemButton>
				<ListItemButton sx={{ borderRadius: 3, color: '#ef4444' }}>
					<ListItemIcon sx={{ color: 'inherit', minWidth: 45 }}>
						<Logout />
					</ListItemIcon>
					<ListItemText onClick={handleLogout} primary="Logout" />
				</ListItemButton>
			</Box>
		</Box>
	);
}
