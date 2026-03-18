'use client';

import { Drawer } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { closeDrawer } from '@/lib/store/slices/drawer-slice';

export default function RtmDrawer({
	children,
	drawerName,
	onCancel,
	isOpen: controlledIsOpen,
	...rest
}) {
	const dispatch = useDispatch();
	const drawerState = useSelector((state) => state.drawers[drawerName]);
	const isOpen =
		controlledIsOpen !== undefined
			? controlledIsOpen
			: typeof drawerState === 'object'
				? Boolean(drawerState?.isOpen)
				: Boolean(drawerState);
	return (
		<Drawer
			open={isOpen}
			anchor="right"
			onClose={() => {
				dispatch(closeDrawer({ drawerName }));
				if (onCancel) {
					onCancel();
				}
			}}
			{...rest}
		>
			{children}
		</Drawer>
	);
}
