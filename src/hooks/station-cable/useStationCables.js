'use client';

import { useQuery } from '@tanstack/react-query';
import { StationCableService } from '@/services/station-cable';
import { useToast } from '../common';

export const useStationCables = (stationId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['station-cables', stationId],
		queryFn: () => StationCableService.byStation(stationId),
		enabled: Boolean(stationId),
		select: (response) => response.data || [],
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to fetch station cables', 'error');
		},
	});
};
