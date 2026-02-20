'use client';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Box, CssBaseline } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MuiThemeProvider, QueryProvider, SessionProvider, StoreProvider } from '@/lib/providers';
import { ToastProvider } from '@/lib/providers/ToastProvider';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<MuiThemeProvider>
					<CssBaseline />
					{/* Global Background */}
					<Box
						sx={(theme) => ({
							bgcolor: theme.palette.background.default,
							minHeight: '100vh',
							width: '100%',
						})}
					>
						{/* App Shell */}
						<Box
							sx={(theme) => ({
								width: '100%',
								margin: '0 auto',
								bgcolor: theme.palette.background.paper,
								minHeight: '100vh',
								display: 'flex',
								flexDirection: 'column',
								boxShadow:
									theme.palette.mode === 'dark'
										? 'none'
										: `0 0 15px ${alpha(theme.palette.common.black, 0.05)}`,
							})}
						>
							<SessionProvider>
								<ToastProvider>
									<StoreProvider>
										<QueryProvider>{children}</QueryProvider>
									</StoreProvider>
								</ToastProvider>
							</SessionProvider>
						</Box>
					</Box>
				</MuiThemeProvider>
			</body>
		</html>
	);
}
