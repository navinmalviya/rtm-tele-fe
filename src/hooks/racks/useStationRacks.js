import { useQuery } from '@tanstack/react-query';

import { RackService } from '@/services/racks';

import { useToast } from '../commom';

export const useStationRacks = (stationId) => {
	const showToast = useToast();
	return useQuery({
		// Include stationId in the key for proper caching
		queryKey: ['racks', stationId],
		queryFn: () => RackService.stationRacks(stationId),
		select: (response) => response.data,
		// Note: In TanStack Query v5+, use 'meta' or global callbacks for toasts
		// but keeping your structure for consistency:
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch', 'error');
		},
		enabled: !!stationId, // Only fetch if stationId exists
	});
};
