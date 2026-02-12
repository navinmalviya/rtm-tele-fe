'use client';

import { useDispatch, useSelector } from 'react-redux';

import { clearTabs, setCurrentTab, setTabs } from '@/lib/store/slices/tab-slice';

export const useTabs = (tabsName, initialState) => {
	const dispatch = useDispatch();

	const tabs = useSelector((state) => state.tabs[tabsName] || initialState);

	const goTo = (tab) => {
		dispatch(setCurrentTab({ tabsName, currentTab: tab }));
	};

	const clear = () => {
		dispatch(clearTabs({ tabsName }));
	};

	const set = () => {
		dispatch(setTabs({ tabsName, currentTab: initialState.currentTab }));
	};

	return {
		currentTab: tabs.currentTab,
		goTo,
		clear,
		set,
	};
};
