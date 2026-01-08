import { useQuery } from '@tanstack/react-query';

import { StationService } from '@/services/stations';

import { useToast } from '../commom';

export const useStationSummary = (stationId) => {
	const showToast = useToast();
	return useQuery({
		queryKey: ['station'],
		queryFn: () => StationService.stationSummary(stationId),
		select: (response) => {
			const station = response.data; // Assuming axios response structure

			return station;
		},
		onError: (error) => {
			showToast(error.response.data.message, 'error');
		},
	});
};
