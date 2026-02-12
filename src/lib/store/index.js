import { combineReducers, configureStore } from '@reduxjs/toolkit';
import drawerReducer from './slices/drawer-slice';
import tabsReducer from './slices/tab-slice';

const rootReducer = combineReducers({
	drawers: drawerReducer,
	tabs: tabsReducer,
});

export const store = configureStore({
	reducer: rootReducer,
});
