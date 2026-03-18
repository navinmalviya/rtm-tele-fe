import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useCreateWork = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => WorkExecutionService.createWork(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['work-execution', 'works'] });
			showToast('Work created successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to create work', 'error');
		},
	});
};
