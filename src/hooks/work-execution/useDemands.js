import { useQuery } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useDemands = (workId, roundId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['work-execution', 'demands', workId, roundId],
		enabled: Boolean(workId),
		queryFn: () => WorkExecutionService.listDemands(workId, roundId),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to fetch demands', 'error');
		},
	});
};
