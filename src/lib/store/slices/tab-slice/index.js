import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const tabsSlice = createSlice({
	name: 'tabs',
	initialState,
	reducers: {
		setTabs: (state, action) => {
			const { tabsName, currentTab } = action.payload;
			// Ensure the object exists before setting properties
			state[tabsName] = { currentTab };
		},
		setCurrentTab: (state, action) => {
			const { tabsName, currentTab } = action.payload;
			// Safe update: Create the group if it doesn't exist yet
			if (!state[tabsName]) {
				state[tabsName] = { currentTab };
			} else {
				state[tabsName].currentTab = currentTab;
			}
		},
		clearTabs: (state, action) => {
			const { tabsName } = action.payload;
			delete state[tabsName];
		},
	},
});

export const { setTabs, setCurrentTab, clearTabs } = tabsSlice.actions;
export default tabsSlice.reducer;
