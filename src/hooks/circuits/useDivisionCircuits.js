import { useQuery } from '@tanstack/react-query';
import { CircuitsService } from '@/services/circuits';
import { useToast } from '../common';

export const useDivisionCircuits = (params = {}) => {
	const showToast = useToast();
	const keySuffix = params.includeInactive ? 'all' : 'active';

	return useQuery({
		queryKey: ['division-circuit-masters', keySuffix],
		queryFn: () => CircuitsService.listMasters(params),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch circuit masters', 'error');
		},
	});
};
