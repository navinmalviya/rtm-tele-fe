'use client';

import { ThemeProvider, useMediaQuery } from '@mui/material';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getTheme } from '../styles/styles';

const ThemeModeContext = createContext({
	mode: 'light',
	setMode: () => {},
	toggleMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

export function MuiThemeProvider({ children }) {
	const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
	const [mode, setMode] = useState('light');

	useEffect(() => {
		const stored = typeof window !== 'undefined' ? localStorage.getItem('rtm-theme') : null;
		if (stored === 'light' || stored === 'dark') {
			setMode(stored);
		} else {
			setMode(prefersDark ? 'dark' : 'light');
		}
	}, [prefersDark]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('rtm-theme', mode);
			document.documentElement.setAttribute('data-theme', mode);
		}
	}, [mode]);

	const theme = useMemo(() => getTheme(mode), [mode]);
	const toggleMode = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

	return (
		<ThemeModeContext.Provider value={{ mode, setMode, toggleMode }}>
			<ThemeProvider theme={theme}>{children}</ThemeProvider>
		</ThemeModeContext.Provider>
	);
}
