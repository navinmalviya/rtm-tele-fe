import { createTheme } from '@mui/material/styles';

const theme = createTheme({
	palette: {
		mode: 'light', // Explicitly force light mode logic
		primary: {
			main: '#3B82F6', // Your brand Blue
			dark: '#2563EB',
			contrastText: '#ffffff',
		},
		background: {
			default: '#F8FAFC', // Main page background (soft gray)
			paper: '#ffffff', // Surface color for Tables, Cards, and Drawers
		},
		text: {
			primary: '#0F172A', // Very dark blue-gray (near black) for readability
			secondary: '#64748B', // Slate gray for captions
		},
		divider: '#E2E8F0', // Border color matching your "Blueprint" look
	},
	shape: {
		borderRadius: 12, // Consistent rounded corners across the app
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		button: {
			textTransform: 'none', // Keeps buttons looking like a modern app
			fontWeight: 700,
		},
		h1: { fontWeight: 800 },
		h2: { fontWeight: 800 },
		h6: { fontWeight: 800 },
	},
	components: {
		// Optional: Ensure Paper always feels consistent
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: 'none', // Removes MUI's dark mode elevation overlays
				},
			},
		},
	},
});

export default theme;
