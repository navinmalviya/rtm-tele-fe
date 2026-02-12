'use client';

import { useQuery } from '@tanstack/react-query';
import { PortLinkService } from '@/services/port-link';
import { useToast } from '../common';

export const usePortLinks = (stationId = null) => {
	const showToast = useToast();
	return useQuery({
		// If stationId is null, the key is ['port-links', 'global']
		queryKey: ['port-links', stationId || 'global'],
		queryFn: () =>
			stationId ? PortLinkService.getStationLinks(stationId) : PortLinkService.getAllLinks(), // New Service Method
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.error || 'Failed to fetch links', 'error');
		},
	});
};
