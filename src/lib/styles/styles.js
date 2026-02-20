import { createTheme } from '@mui/material/styles';

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
		},
	});

const theme = getTheme('light');
export default theme;
