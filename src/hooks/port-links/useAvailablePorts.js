'use client';

import { useQuery } from '@tanstack/react-query';
import { PortLinkService } from '@/services/port-link';
import { useToast } from '../commom';

/**
 * Hook to fetch all ports within a station that are currently available for cabling.
 * Used during inter-station link creation in the Top-Layer Topology.
 */
export const useAvailablePorts = (stationId) => {
	const showToast = useToast();

	return useQuery({
		// Unique key for the station's available port cache
		queryKey: ['available-ports', stationId],
		queryFn: () => PortLinkService.getAvailablePortsByStation(stationId),

		// Only run the query when a station is actually selected/clicked
		enabled: !!stationId,

		// Extract the data array from the Axios/HTTP response
		select: (response) => response.data,

		// Error handling with your shared toast utility
		onError: (error) => {
			console.error('Fetch Available Ports Error:', error);
			showToast(error.response?.data?.error || 'Failed to load available station ports', 'error');
		},

		// Optional: Keep data fresh but don't refetch on every window focus
		staleTime: 30000,
		refetchOnWindowFocus: false,
	});
};
