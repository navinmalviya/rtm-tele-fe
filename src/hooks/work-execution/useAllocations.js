import { useQuery } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useAllocations = (workId, roundId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['work-execution', 'allocations', workId, roundId],
		enabled: Boolean(workId),
		queryFn: () => WorkExecutionService.listAllocations(workId, roundId),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to fetch allocations', 'error');
		},
	});
};
