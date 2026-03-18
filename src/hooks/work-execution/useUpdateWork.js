import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useUpdateWork = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, payload }) => WorkExecutionService.updateWork(id, payload),
		onSuccess: async (_response, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'works'] }),
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'work', variables.id] }),
			]);
			showToast('Work updated successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update work', 'error');
		},
	});
};
