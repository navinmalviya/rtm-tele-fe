'use client';

import { Drawer } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function RtmDrawer({ children, drawerName, onCancel }) {
	const dispatch = useDispatch();
	const isOpen = useSelector((state) => state.drawers[drawerName]);
	return (
		<Drawer
			open={isOpen || false}
			anchor="right"
			onClose={() => {
				dispatch(closeDrawer({ drawerName }));
				if (onCancel) {
					onCancel();
				}
			}}
		>
			{children}
		</Drawer>
	);
}
