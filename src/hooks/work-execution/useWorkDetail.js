import { useQuery } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useWorkDetail = (workId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['work-execution', 'work', workId],
		enabled: Boolean(workId),
		queryFn: () => WorkExecutionService.getWorkById(workId),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to fetch work details', 'error');
		},
	});
};
