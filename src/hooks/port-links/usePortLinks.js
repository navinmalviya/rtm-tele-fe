'use client';

import { useQuery } from '@tanstack/react-query';
import { PortLinkService } from '@/services/port-link';
import { useToast } from '../commom';

export const usePortLinks = (stationId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['port-links', stationId],
		queryFn: () => PortLinkService.getStationLinks(stationId),
		enabled: !!stationId, // Only fetch if stationId exists
		select: (response) => response.data,
		onError: (error) => {
			console.error('Fetch Links Error:', error);
			showToast(error.response?.data?.error || 'Failed to fetch cable connections', 'error');
		},
	});
};
