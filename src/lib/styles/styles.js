import { createTheme } from '@mui/material/styles';

const theme = createTheme({
	palette: {
		primary: {
			main: '#3B82F6', // Your Blue Accent
			dark: '#2563EB',
		},
		background: {
			default: '#F8FAFC', // Soft light gray
			paper: '#101214', // Dark sidebar/panel color
		},
		text: {
			primary: '#101214',
			secondary: '#64748B',
		},
	},
	shape: {
		borderRadius: 12, // Modern rounded corners
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		h1: { fontWeight: 800 },
		h2: { fontWeight: 800 },
	},
});

export default theme;
