import { combineReducers, configureStore } from '@reduxjs/toolkit';
import drawerReducer from './slices/drawer-slice';

const rootReducer = combineReducers({
	drawers: drawerReducer,
});

export const store = configureStore({
	reducer: rootReducer,
});
