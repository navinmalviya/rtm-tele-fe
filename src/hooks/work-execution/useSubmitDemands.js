import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useSubmitDemands = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ workId, payload }) => WorkExecutionService.submitDemands(workId, payload),
		onSuccess: async (_response, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['work-execution', 'work', variables.workId] }),
				queryClient.invalidateQueries({
					queryKey: ['work-execution', 'demands', variables.workId],
				}),
			]);
			showToast('Demands submitted', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to submit demands', 'error');
		},
	});
};
