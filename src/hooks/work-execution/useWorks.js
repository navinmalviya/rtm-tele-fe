import { useQuery } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useWorks = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['work-execution', 'works'],
		queryFn: () => WorkExecutionService.listWorks(),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to fetch works', 'error');
		},
	});
};
