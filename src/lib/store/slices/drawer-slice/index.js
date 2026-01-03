import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const drawerSlice = createSlice({
	name: 'drawers',
	initialState,
	reducers: {
		openDrawer: (state, action) => {
			const { drawerName } = action.payload;
			state[drawerName] = true;
		},
		closeDrawer: (state, action) => {
			const { drawerName } = action.payload;
			state[drawerName] = false;
		},
	},
});

export const { openDrawer, closeDrawer } = drawerSlice.actions;
export default drawerSlice.reducer;
