import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useAddProgress = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ workId, payload }) => WorkExecutionService.addProgress(workId, payload),
		onSuccess: async (_response, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'work', variables.workId] }),
				queryClient.invalidateQueries({
					queryKey: ['work-execution', 'progress', variables.workId],
				}),
			]);
			showToast('Progress added', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to add progress', 'error');
		},
	});
};
