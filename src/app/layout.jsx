'use client';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Box, CssBaseline } from '@mui/material';
import { QueryProvider, SessionProvider, StoreProvider } from '@/lib/providers';
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
				<CssBaseline />
				{/* Global Background */}
				<Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', width: '100%' }}>
					{/* The 1400px Centered App Shell */}
					<Box
						sx={{
							maxWidth: '1450px',
							width: '100%', // Use 100%, NEVER 100vw
							margin: '0 auto', // This handles the centering perfectly
							bgcolor: '#fff',
							minHeight: '100vh',
							display: 'flex',
							flexDirection: 'column',
							boxShadow: '0 0 15px rgba(0,0,0,0.05)',
						}}
					>
						<SessionProvider>
							<ToastProvider>
								<StoreProvider>
									<QueryProvider>
										{children}
									</QueryProvider>
								</StoreProvider>
							</ToastProvider>
						</SessionProvider>
					</Box>
				</Box>
			</body>
		</html>
	);
}
