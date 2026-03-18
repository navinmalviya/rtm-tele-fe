import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useCreateWorkItem = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ workId, payload }) => WorkExecutionService.createItem(workId, payload),
		onSuccess: async (_response, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'works'] }),
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'work', variables.workId] }),
			]);
			showToast('Work item added', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to add work item', 'error');
		},
	});
};
