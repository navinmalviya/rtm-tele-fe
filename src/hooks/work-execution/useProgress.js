import { useQuery } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useProgress = (workId, roundId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['work-execution', 'progress', workId, roundId],
		enabled: Boolean(workId),
		queryFn: () => WorkExecutionService.listProgress(workId, roundId),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to fetch progress entries', 'error');
		},
	});
};
