'use client';

import { Tab, Tabs } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTabs } from '@/hooks/common';

/**
 * RtmTabs - A common component for synchronized Material UI Tabs
 * @param {Array} tabs - Array of { label, step, icon }
 * @param {String} tabsName - Unique key for Redux state storage
 * @param {Object} initialState - { currentTab: string }
 */
const RtmTabs = ({ tabs, tabsName, initialState }) => {
	const router = useRouter();
	const pathname = usePathname();
	const { goTo, clear, set, currentTab } = useTabs(tabsName, initialState);
	const [urlTab, setUrlTab] = useState('');

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const params = new URLSearchParams(window.location.search);
		setUrlTab(params.get('tab') || '');
	}, [pathname]);

	// Determine the active tab index for MUI
	const activeIndex = useMemo(() => {
		const target = currentTab || urlTab || initialState.currentTab;
		const index = tabs.findIndex((t) => t.step === target);
		return index === -1 ? 0 : index;
	}, [tabs, currentTab, urlTab, initialState.currentTab]);

	const handleTabChange = (_, newValue) => {
		const selectedTab = tabs[newValue].step;

		// 1. Update Redux via your custom hook
		goTo(selectedTab);

		// 2. Update URL for persistence on refresh
		const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
		params.set('tab', selectedTab);
		setUrlTab(selectedTab);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	};

	// Initialize default state and cleanup on unmount.
	useEffect(() => {
		set();
		return () => {
			clear();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tabsName]);

	// URL tab has priority over default tab.
	useEffect(() => {
		if (urlTab) {
			goTo(urlTab);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [urlTab]);

	return (
		<Tabs
			value={activeIndex}
			onChange={handleTabChange}
			sx={{
				mb: 3,
				borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
				'& .MuiTab-root': {
					fontWeight: 700,
					textTransform: 'none',
					fontSize: '0.875rem',
					minHeight: '48px',
					transition: 'all 0.2s ease',
				},
				'& .Mui-selected': {
					color: (theme) => `${theme.palette.primary.main} !important`,
				},
				'& .MuiTabs-indicator': {
					height: 3,
					borderRadius: '3px 3px 0 0',
					bgcolor: (theme) => theme.palette.primary.main,
				},
			}}
		>
			{tabs.map((tab) => (
				<Tab
					key={tab.step}
					icon={tab.icon}
					iconPosition="start"
					label={tab.label}
					sx={{ minWidth: 120 }}
				/>
			))}
		</Tabs>
	);
};

export default RtmTabs;
