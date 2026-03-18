import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useSaveAllocations = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ workId, payload }) => WorkExecutionService.saveAllocations(workId, payload),
		onSuccess: async (_response, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'work', variables.workId] }),
				queryClient.invalidateQueries({
					queryKey: ['work-execution', 'allocations', variables.workId],
				}),
			]);
			showToast('Allocations saved', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to save allocations', 'error');
		},
	});
};
