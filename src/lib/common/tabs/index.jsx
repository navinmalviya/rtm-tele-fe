'use client';

import { Tab, Tabs } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
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
	const searchParams = useSearchParams();
	const { goTo, clear, set, currentTab } = useTabs(tabsName, initialState);

	// Sync URL params
	const queryTab = searchParams.get('tab');

	// Determine the active tab index for MUI
	const activeIndex = useMemo(() => {
		const target = currentTab || queryTab || initialState.currentTab;
		const index = tabs.findIndex((t) => t.step === target);
		return index === -1 ? 0 : index;
	}, [tabs, currentTab, queryTab, initialState.currentTab]);

	const handleTabChange = (_, newValue) => {
		const selectedTab = tabs[newValue].step;

		// 1. Update Redux via your custom hook
		goTo(selectedTab);

		// 2. Update URL for persistence on refresh
		const params = new URLSearchParams(searchParams);
		params.set('tab', selectedTab);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	};

	// Initialize and Cleanup
	useEffect(() => {
		// If URL has a tab, override the initial state in Redux
		if (queryTab) {
			goTo(queryTab);
		} else {
			set();
		}

		return () => {
			clear();
		};
	}, [tabsName]);

	return (
		<Tabs
			value={activeIndex}
			onChange={handleTabChange}
			sx={{
				mb: 3,
				borderBottom: '1px solid #E2E8F0',
				'& .MuiTab-root': {
					fontWeight: 700,
					textTransform: 'none',
					fontSize: '0.875rem',
					minHeight: '48px',
					transition: 'all 0.2s ease',
				},
				'& .Mui-selected': {
					color: '#3B82F6 !important',
				},
				'& .MuiTabs-indicator': {
					height: 3,
					borderRadius: '3px 3px 0 0',
					bgcolor: '#3B82F6',
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
