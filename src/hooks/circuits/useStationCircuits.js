import { useQuery } from '@tanstack/react-query';
import { CircuitsService } from '@/services/circuits';
import { useToast } from '../common';

export const useStationCircuits = (params = {}) => {
	const showToast = useToast();
	const key = JSON.stringify(params || {});

	return useQuery({
		queryKey: ['station-circuits', key],
		queryFn: () => CircuitsService.listStationCircuits(params),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch station circuits', 'error');
		},
	});
};
