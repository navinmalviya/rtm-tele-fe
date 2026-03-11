'use client';

import { Dialog } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function RtmDialog({ children, drawerName, onCancel, ...rest }) {
	const dispatch = useDispatch();
	const dialogState = useSelector((state) => state.drawers?.[drawerName]);
	const isOpen = Boolean(dialogState?.isOpen);

	return (
		<Dialog
			open={isOpen}
			onClose={() => {
				dispatch(closeDrawer({ drawerName }));
				if (onCancel) onCancel();
			}}
			{...rest}
		>
			{children}
		</Dialog>
	);
}
