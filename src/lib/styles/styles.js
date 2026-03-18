import { alpha, createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') =>
	createTheme({
		palette: {
			mode,
			primary: {
				main: '#3B82F6', // Brand Blue
				dark: '#2563EB',
				contrastText: '#ffffff',
			},
			background:
				mode === 'dark'
					? {
							default: '#0B0F14',
							paper: '#0F172A',
						}
					: {
							default: '#F8FAFC',
							paper: '#ffffff',
						},
			text:
				mode === 'dark'
					? {
							primary: '#F8FAFC',
							secondary: '#94A3B8',
						}
					: {
							primary: '#0F172A',
							secondary: '#64748B',
						},
			divider: mode === 'dark' ? '#1F2937' : '#E2E8F0',
			custom: {
				sidebarBg: mode === 'dark' ? '#0B0F14' : '#101214',
				sidebarText: mode === 'dark' ? '#F8FAFC' : '#FFFFFF',
				sidebarMuted: mode === 'dark' ? '#94A3B8' : 'rgba(255,255,255,0.7)',
				sidebarBorder: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
			},
		},
		shape: {
			borderRadius: 12,
		},
		typography: {
			fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
			button: {
				textTransform: 'none',
				fontWeight: 700,
			},
			h1: { fontWeight: 800 },
			h2: { fontWeight: 800 },
			h6: { fontWeight: 800 },
		},
		components: {
			MuiPaper: {
				styleOverrides: {
					root: {
						backgroundImage: 'none',
					},
				},
			},
			MuiButton: {
				defaultProps: {
					disableElevation: true,
				},
				styleOverrides: {
					root: {
						borderRadius: '12px !important',
						fontWeight: '700 !important',
						textTransform: 'none',
						letterSpacing: 0,
						paddingInline: 16,
					},
					contained: {
						boxShadow: 'none',
						'&:hover': {
							boxShadow: 'none',
						},
					},
					outlined: {
						borderWidth: 1.25,
					},
					sizeSmall: {
						minHeight: 34,
					},
					sizeMedium: {
						minHeight: 40,
					},
					sizeLarge: {
						minHeight: 46,
					},
				},
			},
			MuiIconButton: {
				styleOverrides: {
					root: {
						borderRadius: 10,
					},
				},
			},
			MuiTextField: {
				defaultProps: {
					variant: 'outlined',
					size: 'small',
				},
			},
			MuiInputLabel: {
				styleOverrides: {
					root: {
						fontWeight: 600,
						color: mode === 'dark' ? '#94A3B8' : '#64748B',
						'&.Mui-focused': {
							color: '#3B82F6',
						},
					},
				},
			},
			MuiOutlinedInput: {
				styleOverrides: {
					root: {
						borderRadius: '12px !important',
						backgroundColor: mode === 'dark' ? alpha('#0F172A', 0.75) : alpha('#FFFFFF', 0.94),
						transition: 'background-color 0.2s ease, border-color 0.2s ease',
						'& fieldset': {
							borderColor: `${mode === 'dark' ? '#1F2937' : '#CBD5E1'} !important`,
						},
						'&:hover fieldset': {
							borderColor: `${mode === 'dark' ? '#64748B' : '#94A3B8'} !important`,
						},
						'&.Mui-focused fieldset': {
							borderColor: '#3B82F6 !important',
							borderWidth: '1.5px !important',
						},
						'&.Mui-disabled': {
							backgroundColor: mode === 'dark' ? alpha('#334155', 0.22) : alpha('#E2E8F0', 0.55),
						},
						'& .MuiInputBase-input': {
							fontWeight: 600,
							color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
						},
						'&.MuiInputBase-sizeSmall .MuiInputBase-input': {
							paddingTop: 10.5,
							paddingBottom: 10.5,
						},
						'& .MuiSelect-icon': {
							color: `${mode === 'dark' ? '#94A3B8' : '#64748B'} !important`,
						},
					},
				},
			},
			MuiInputAdornment: {
				styleOverrides: {
					root: {
						'& .MuiSvgIcon-root': {
							fontSize: 20,
							color: `${mode === 'dark' ? '#94A3B8' : '#64748B'} !important`,
						},
					},
				},
			},
			MuiFormHelperText: {
				styleOverrides: {
					root: {
						fontWeight: 500,
						marginTop: 4,
					},
				},
			},
			MuiMenuItem: {
				styleOverrides: {
					root: {
						fontSize: '0.9rem',
						fontWeight: 600,
					},
				},
			},
		},
	});

const theme = getTheme('light');
export default theme;
