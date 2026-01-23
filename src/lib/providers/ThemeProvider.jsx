'use client';

import { ThemeProvider } from '@mui/material';
import theme from '../styles/styles';

export function MuiThemeProvider({ children }) {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
