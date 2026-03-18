import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkExecutionService } from '@/services/work-execution';
import { useToast } from '../common';

export const useDeleteWork = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => WorkExecutionService.deleteWork(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['work-execution', 'works'] });
			showToast('Work deleted successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to delete work', 'error');
		},
	});
};
