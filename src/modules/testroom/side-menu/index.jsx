'use client';
import {
	BadgeOutlined,
	Hub,
	Logout,
	Menu as MenuIcon,
	PersonOutline,
	Settings,
} from '@mui/icons-material';
import {
	Box,
	Drawer,
	FormControlLabel,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Stack,
	Switch,
	Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { useThemeMode } from '@/lib/providers';
import { getNavbarTitle } from '@/lib/util';

const sidebarWidth = 280;

export default function SideMenu({ menuItems }) {
	const pathname = usePathname();
	const router = useRouter();
	const theme = useTheme();
	const { mode, toggleMode } = useThemeMode();
	const { data: session } = useSession();
	const [mobileOpen, setMobileOpen] = useState(false);
	const user = session?.user || {};
	const displayName = user?.name || user?.username || 'User';
	const displayDesignation = user?.designation || user?.role || '-';
	const displayDivision = user?.divisionCode || 'RTM';
	const designationLine = `${displayDesignation} • ${displayDivision}`;
	const basePath = useMemo(() => {
		const firstPath = menuItems?.[0]?.path || '/testroom/dashboard';
		const segments = firstPath.split('/').filter(Boolean);
		return `/${segments[0] || 'testroom'}`;
	}, [menuItems]);
	const canShowSettings = basePath === '/testroom';
	const settingsPath = `${basePath}/settings`;

	const closeMobileMenu = () => setMobileOpen(false);

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

	const sidebarContent = (
		<Box
			sx={{
				width: sidebarWidth,
				flexShrink: 0,
				bgcolor: theme.palette.custom.sidebarBg,
				color: theme.palette.custom.sidebarText,
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				borderRight: `1px solid ${theme.palette.custom.sidebarBorder}`,
				overflow: 'hidden',
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

			<Box
				sx={{
					mx: 2.5,
					p: 1.35,
					borderRadius: 3,
					border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
					bgcolor: alpha(theme.palette.common.white, 0.05),
				}}
			>
				<Stack direction="row" spacing={1.25} alignItems="center">
					<Box
						sx={{
							width: 36,
							height: 36,
							borderRadius: 2,
							bgcolor: alpha(theme.palette.primary.main, 0.2),
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<PersonOutline sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
					</Box>
					<Box sx={{ minWidth: 0, flex: 1 }}>
						<Typography
							sx={{
								fontWeight: 700,
								fontSize: '0.9rem',
								color: theme.palette.custom.sidebarText,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							}}
							title={displayName}
						>
							{displayName}
						</Typography>
						<Stack direction="row" spacing={0.75} alignItems="center">
							<BadgeOutlined sx={{ color: theme.palette.custom.sidebarMuted, fontSize: 14 }} />
							<Typography
								sx={{
									fontSize: '0.76rem',
									color: theme.palette.custom.sidebarMuted,
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
								}}
								title={designationLine}
							>
								{designationLine}
							</Typography>
						</Stack>
					</Box>
				</Stack>
			</Box>

			<Box sx={{ mt: 2, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
				<Typography
					variant="overline"
					sx={{
						px: 3,
						color: theme.palette.custom.sidebarMuted,
						fontWeight: 700,
						flexShrink: 0,
					}}
				>
					GENERAL
				</Typography>
				<Box sx={{ mt: 1, px: 2, pb: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
					<List sx={{ p: 0 }}>
						{menuItems.map((item) => {
							const isActive = pathname === item.path;
							return (
								<ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
									<ListItemButton
										onClick={() => {
											router.push(item.path);
											closeMobileMenu();
										}}
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
												color: isActive
													? 'primary.contrastText'
													: theme.palette.custom.sidebarMuted,
												minWidth: 45,
											}}
										>
											{item.icon}
										</ListItemIcon>
										<ListItemText
											primary={item.text}
											primaryTypographyProps={{
												fontWeight: isActive ? 700 : 500,
												color: isActive
													? 'primary.contrastText'
													: theme.palette.custom.sidebarMuted,
											}}
										/>
									</ListItemButton>
								</ListItem>
							);
						})}
					</List>
				</Box>
			</Box>

			<Box
				sx={{
					p: 2,
					borderTop: `1px solid ${theme.palette.custom.sidebarBorder}`,
					flexShrink: 0,
				}}
			>
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
				{canShowSettings && (
					<ListItemButton
						onClick={() => {
							router.push(settingsPath);
							closeMobileMenu();
						}}
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
				)}
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

	return (
		<Box
			sx={{
				width: 0,
				flexShrink: 0,
			}}
		>
			<Box
				sx={{
					display: { xs: 'flex', md: 'none' },
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					height: 64,
					alignItems: 'center',
					justifyContent: 'space-between',
					px: 2,
					bgcolor: 'background.paper',
					borderBottom: '1px solid',
					borderColor: 'divider',
					zIndex: 1200,
				}}
			>
				<Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
					<IconButton
						onClick={() => setMobileOpen(true)}
						size="small"
						sx={{ bgcolor: 'action.hover' }}
					>
						<MenuIcon fontSize="small" />
					</IconButton>
					<Typography
						sx={{
							fontWeight: 800,
							color: 'text.primary',
							fontSize: '0.95rem',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						{getNavbarTitle(pathname)}
					</Typography>
				</Stack>
				<Box
					sx={{
						px: 1.15,
						py: 0.45,
						borderRadius: 2,
						bgcolor: 'primary.main',
					}}
				>
					<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'primary.contrastText' }}>
						RTM
					</Typography>
				</Box>
			</Box>

			<Drawer
				variant="temporary"
				open={mobileOpen}
				onClose={closeMobileMenu}
				ModalProps={{ keepMounted: true }}
				sx={{
					display: { xs: 'block', md: 'none' },
					'& .MuiDrawer-paper': {
						width: sidebarWidth,
						border: 'none',
						boxSizing: 'border-box',
						bgcolor: theme.palette.custom.sidebarBg,
					},
				}}
			>
				{sidebarContent}
			</Drawer>

			<Box
				sx={{
					display: { xs: 'none', md: 'block' },
					width: sidebarWidth,
					height: '100vh',
					position: 'fixed',
					left: 0,
					top: 0,
					zIndex: 1100,
				}}
			>
				{sidebarContent}
			</Box>
		</Box>
	);
}
