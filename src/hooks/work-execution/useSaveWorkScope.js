import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useSaveWorkScope = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ workId, payload }) => WorkExecutionService.saveScope(workId, payload),
		onSuccess: async (_response, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'works'] }),
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'work', variables.workId] }),
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'scope', variables.workId] }),
			]);
			showToast('Work scope saved', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to save work scope', 'error');
		},
	});
};
