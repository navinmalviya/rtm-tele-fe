'use client';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Box, Container, CssBaseline } from '@mui/material';
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
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<CssBaseline />

				{/* 1. The Wrapper: Ensures the background covers the whole screen */}
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					{/* 2. The Content Constraint: Restricts width to 1350px */}
					<Container
						maxWidth={false}
						sx={
							{
								// maxWidth: '1350px !important',
								// padding: { xs: 2, md: 4 }, // Standard gutter spacing
							}
						}
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
					</Container>
				</Box>
			</body>
		</html>
	);
}
