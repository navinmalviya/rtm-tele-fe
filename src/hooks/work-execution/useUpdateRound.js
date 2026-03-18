import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useUpdateRound = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ workId, roundId, payload }) =>
			WorkExecutionService.updateRound(workId, roundId, payload),
		onSuccess: async (_response, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'works'] }),
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'work', variables.workId] }),
			]);
			showToast('Round updated', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update round', 'error');
		},
	});
};
