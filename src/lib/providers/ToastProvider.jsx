'use client';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useCallback, useState } from 'react';

import { ToastContext } from '@/hooks/commom/useToast';

export const ToastProvider = ({ children }) => {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [severity, setSeverity] = useState('info');

	const showToast = useCallback((msg, sev = 'info') => {
		setMessage(msg);
		setSeverity(sev);
		setOpen(true);
	}, []);

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<ToastContext.Provider value={showToast}>
			{children}
			<Snackbar
				open={open}
				autoHideDuration={5000}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert severity={severity} onClose={handleClose}>
					{message}
				</Alert>
			</Snackbar>
		</ToastContext.Provider>
	);
};
