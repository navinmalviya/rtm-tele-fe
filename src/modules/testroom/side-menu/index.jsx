'use client';
import {
	AccountTree,
	Assessment,
	AssignmentTurnedIn,
	Dashboard,
	Hub,
	Inventory,
	LibraryBooks,
	Logout,
	Settings,
} from '@mui/icons-material';
import {
	Box,
	FormControlLabel,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Switch,
	Typography,
} from '@mui/material';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { alpha, useTheme } from '@mui/material/styles';
import { useThemeMode } from '@/lib/providers';

const sidebarWidth = 280;

export default function SideMenu({ menuItems }) {
	const pathname = usePathname();
	const router = useRouter();
	const theme = useTheme();
	const { mode, toggleMode } = useThemeMode();
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
				bgcolor: theme.palette.custom.sidebarBg,
				color: theme.palette.custom.sidebarText,
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				position: 'fixed',
				left: 0,
				top: 0,
				borderRight: `1px solid ${theme.palette.custom.sidebarBorder}`,
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
					<Hub sx={{ color: 'primary.contrastText' }} />
				</Box>
				<Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.custom.sidebarText }}>
					Telcom Control Desk
				</Typography>
			</Box>

			<Typography
				variant="overline"
				sx={{
					px: 3,
					mt: 2,
					color: theme.palette.custom.sidebarMuted,
					fontWeight: 700,
				}}
			>
				GENERAL
			</Typography>

			<List sx={{ px: 2, mt: 1 }}>
				{menuItems.map((item) => {
					const isActive = pathname === item.path;
					return (
						<ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
							<ListItemButton
								onClick={() => router.push(item.path)}
								sx={{
									borderRadius: 3,
									bgcolor: isActive ? 'primary.main' : 'transparent',
									'&:hover': {
										bgcolor: isActive
											? 'primary.main'
											: alpha(theme.palette.common.white, 0.08),
									},
									transition: 'all 0.2s',
								}}
							>
								<ListItemIcon
									sx={{
										color: isActive ? 'primary.contrastText' : theme.palette.custom.sidebarMuted,
										minWidth: 45,
									}}
								>
									{item.icon}
								</ListItemIcon>
								<ListItemText
									primary={item.text}
									primaryTypographyProps={{
										fontWeight: isActive ? 700 : 500,
										color: isActive ? 'primary.contrastText' : theme.palette.custom.sidebarMuted,
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
						color: theme.palette.custom.sidebarMuted,
						fontWeight: 700,
					}}
				>
					SUPPORT
				</Typography>
				<Box sx={{ px: 2, py: 1 }}>
					<FormControlLabel
						control={<Switch checked={mode === 'dark'} onChange={toggleMode} size="small" />}
						label={mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
						sx={{
							color: theme.palette.custom.sidebarMuted,
							'& .MuiFormControlLabel-label': { fontSize: '0.85rem', fontWeight: 600 },
						}}
					/>
				</Box>
				<ListItemButton
					sx={{
						borderRadius: 3,
						color: theme.palette.custom.sidebarMuted,
						'&:hover': { bgcolor: alpha(theme.palette.common.white, 0.08) },
					}}
				>
					<ListItemIcon sx={{ color: 'inherit', minWidth: 45 }}>
						<Settings />
					</ListItemIcon>
					<ListItemText primary="Settings" />
				</ListItemButton>
				<ListItemButton
					onClick={handleLogout}
					sx={{
						borderRadius: 3,
						color: theme.palette.error.main,
						'&:hover': { bgcolor: alpha(theme.palette.error.main, 0.12) },
					}}
				>
					<ListItemIcon sx={{ color: 'inherit', minWidth: 45 }}>
						<Logout />
					</ListItemIcon>
					<ListItemText primary="Logout" />
				</ListItemButton>
			</Box>
		</Box>
	);
}
