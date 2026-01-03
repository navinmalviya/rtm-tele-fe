'use client';

import {
	Box,
	Button,
	Checkbox,
	CircularProgress,
	FormControlLabel,
	Grid,
	Link,
	Paper,
	TextField,
	Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { redirectUser } from '@/lib/util';

export default function LoginPage() {
	const [loading, setLoading] = useState(false);
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
	// const { data: user, status } = useSession();
	const router = useRouter();

	const onSubmit = async (credentials) => {
		setLoading(true);
		await signIn('credentials', {
			username: credentials.username,
			password: credentials.password,
			redirect: false,
		}).then(async (response) => {
			const session = await getSession();
			if (response.status === 200 && session) {
				redirectUser(session, router);
			} else if (response.status === 401) {
				setLoading(false);
			}
		});
	};

	// if (user) {
	// 	redirectUser(user, router);
	// 	return null;
	// }

	return (
		<Grid container component="main" sx={{ height: '100vh' }}>
			{/* Left Side: Image (30% width) */}
			<Grid
				item
				xs={false}
				sm={3.6} // Roughly 30%
				sx={{
					backgroundImage:
						'url(https://images.unsplash.com/photo-1497215728101-856f4ea42174)',
					backgroundRepeat: 'no-repeat',
					backgroundColor: (t) => t.palette.grey[50],
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}
			/>

			{/* Right Side: Login Form (70% width) */}
			<Grid item xs={12} sm={8.4} component={Paper} elevation={6} square>
				<Box
					sx={{
						my: 8,
						mx: 4,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						height: '100%',
					}}
				>
					<Box
						component="form"
						noValidate
						onSubmit={handleSubmit(onSubmit)}
						sx={{ width: '100%', maxWidth: '400px' }}
					>
						<Typography
							component="h1"
							variant="h4"
							sx={{ fontWeight: 'bold', mb: 1 }}
						>
							Sign In
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 3 }}
						>
							Enter your username and password to
							continue.
						</Typography>

						{/* Username Field */}
						{!(loading || status === 'loading') ? (
							<>
								<Controller
									name="username"
									control={control}
									rules={{
										required: 'Username is required',
									}}
									render={({ field }) => (
										<TextField
											{...field}
											margin="normal"
											fullWidth
											label="Username"
											autoFocus
											error={
												!!errors.username
											}
											helperText={
												errors
													.username
													?.message
											}
										/>
									)}
								/>

								{/* Password Field */}
								<Controller
									name="password"
									control={control}
									rules={{
										required: 'Password is required',
										minLength: {
											value: 4,
											message: 'Minimum 4 characters required',
										},
									}}
									render={({ field }) => (
										<TextField
											{...field}
											margin="normal"
											fullWidth
											label="Password"
											type="password"
											error={
												!!errors.password
											}
											helperText={
												errors
													.password
													?.message
											}
										/>
									)}
								/>

								<Box
									sx={{
										display: 'flex',
										justifyContent:
											'space-between',
										alignItems: 'center',
										mt: 1,
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
												label="Remember me"
											/>
										)}
									/>
									<Link
										href="#"
										variant="body2"
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
										mt: 3,
										mb: 2,
										py: 1.5,
										fontWeight: 'bold',
									}}
								>
									Login
								</Button>
							</>
						) : (
							<CircularProgress />
						)}
					</Box>
				</Box>
			</Grid>
		</Grid>
	);
}
