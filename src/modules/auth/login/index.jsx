'use client';

import {
	Box,
	Button,
	Checkbox,
	CircularProgress,
	FormControlLabel,
	Grid,
	Link,
	Stack,
	TextField,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { redirectUser } from '@/lib/util';

export default function LoginPage() {
	const [loading, setLoading] = useState(false);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			username: '',
			password: '',
			remember: false,
		},
	});

	const onSubmit = async (credentials) => {
		setLoading(true);
		const response = await signIn('credentials', {
			username: credentials.username,
			password: credentials.password,
			redirect: false,
		});

		const session = await getSession();
		if (response?.status === 200 && session) {
			redirectUser(session, router);
		} else {
			setLoading(false);
			// Optional: Add a toast or error state here
		}
	};

	return (
		<Grid container component="main" sx={{ height: '100vh', width: '100vw' }}>
			{/* Left Side: Professional Branding Panel */}
			{!isMobile && (
				<Grid
					item
					xs={false}
					lg={6}
					sx={{
						bgcolor: 'background.paper', // #101214
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						p: 8,
						color: 'white',
						position: 'relative',
						overflow: 'hidden',
					}}
				>
					<Box sx={{ position: 'relative', zIndex: 2 }}>
						<Typography
							variant="h2"
							component="h1"
							sx={{ fontWeight: 800, mb: 2 }}
						>
							Railway Telecom <br />
							<Box
								component="span"
								sx={{ color: 'primary.main' }}
							>
								Control Desk
							</Box>
						</Typography>
						<Typography
							variant="h6"
							sx={{
								color: 'text.secondary',
								fontWeight: 400,
								maxWidth: 480,
							}}
						>
							Real-time infrastructure monitoring and
							maintenance management for Western Railway.
						</Typography>
					</Box>

					{/* Subtle decorative element */}
					<Box
						sx={{
							position: 'absolute',
							bottom: -50,
							right: -50,
							width: 300,
							height: 300,
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(16, 18, 20, 0) 70%)',
						}}
					/>
				</Grid>
			)}

			{/* Right Side: Clean Login Form */}
			<Grid
				item
				xs={12}
				lg={6}
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					bgcolor: 'background.default', // #F8FAFC
					p: 4,
				}}
			>
				<Box sx={{ width: '100%', maxWidth: 400 }}>
					<Stack spacing={1} sx={{ mb: 4 }}>
						<Typography
							variant="h4"
							sx={{
								fontWeight: 800,
								color: 'text.primary',
							}}
						>
							Sign In
						</Typography>
						<Typography variant="body1" color="text.secondary">
							Please enter your credentials to access your
							dashboard.
						</Typography>
					</Stack>

					<Box
						component="form"
						noValidate
						onSubmit={handleSubmit(onSubmit)}
					>
						{loading ? (
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'center',
									py: 4,
								}}
							>
								<CircularProgress />
							</Box>
						) : (
							<Stack spacing={2.5}>
								<Controller
									name="username"
									control={control}
									rules={{
										required: 'Username is required',
									}}
									render={({ field }) => (
										<TextField
											{...field}
											fullWidth
											label="Username"
											variant="outlined"
											autoFocus
											error={
												!!errors.username
											}
											helperText={
												errors
													.username
													?.message
											}
											sx={{
												bgcolor: 'white',
											}}
										/>
									)}
								/>

								<Controller
									name="password"
									control={control}
									rules={{
										required: 'Password is required',
										minLength: {
											value: 4,
											message: 'Minimum 4 characters',
										},
									}}
									render={({ field }) => (
										<TextField
											{...field}
											fullWidth
											label="Password"
											type="password"
											variant="outlined"
											error={
												!!errors.password
											}
											helperText={
												errors
													.password
													?.message
											}
											sx={{
												bgcolor: 'white',
											}}
										/>
									)}
								/>

								<Box
									sx={{
										display: 'flex',
										justifyContent:
											'space-between',
										alignItems: 'center',
									}}
								>
									<Controller
										name="remember"
										control={control}
										render={({
											field,
										}) => (
											<FormControlLabel
												control={
													<Checkbox
														{...field}
														checked={
															field.value
														}
														color="primary"
													/>
												}
												label={
													<Typography variant="body2">
														Remember
														me
													</Typography>
												}
											/>
										)}
									/>
									<Link
										href="#"
										variant="body2"
										sx={{
											fontWeight: 600,
											color: 'primary.main',
											textDecoration:
												'none',
										}}
									>
										Forgot password?
									</Link>
								</Box>

								<Button
									type="submit"
									fullWidth
									variant="contained"
									size="large"
									sx={{
										py: 1.8,
										fontWeight: 800,
										fontSize: '1rem',
										textTransform:
											'none',
										boxShadow: 'none',
										'&:hover': {
											boxShadow: 'none',
										},
									}}
								>
									Login
								</Button>
							</Stack>
						)}
					</Box>

					<Typography
						variant="body2"
						color="text.secondary"
						align="center"
						sx={{ mt: 6 }}
					>
						&copy; 2026 Indian Railways S&T Department
					</Typography>
				</Box>
			</Grid>
		</Grid>
	);
}
