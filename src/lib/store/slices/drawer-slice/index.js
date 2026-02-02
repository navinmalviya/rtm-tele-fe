import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const drawerSlice = createSlice({
	name: 'drawers',
	initialState,
	reducers: {
		openDrawer: (state, action) => {
			const { drawerName, ...payload } = action.payload;
			state[drawerName] = {
				isOpen: true,
				...payload,
			};
		},
		closeDrawer: (state, action) => {
			const { drawerName } = action.payload;
			state[drawerName] = false;
		},
	},
});

export const { openDrawer, closeDrawer } = drawerSlice.actions;
export default drawerSlice.reducer;
