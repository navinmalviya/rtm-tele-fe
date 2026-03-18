import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useUpdateWorkItem = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ workId, itemId, payload }) =>
			WorkExecutionService.updateItem(workId, itemId, payload),
		onSuccess: async (_response, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'works'] }),
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'work', variables.workId] }),
			]);
			showToast('LOA item updated', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update LOA item', 'error');
		},
	});
};
