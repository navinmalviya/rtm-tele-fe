import { useQuery } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useWorkScope = (workId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['work-execution', 'scope', workId],
		enabled: Boolean(workId),
		queryFn: () => WorkExecutionService.listScope(workId),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to fetch work scope', 'error');
		},
	});
};
