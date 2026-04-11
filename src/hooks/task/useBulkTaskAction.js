import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '@/services/task';
import { useToast } from '../common';

export const useBulkTaskAction = () => {
	const showToast = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ taskIds = [], action }) => TaskService.bulkTaskAction({ taskIds, action }),
		onSuccess: async (response, variables) => {
			await queryClient.invalidateQueries({ queryKey: ['tasks'] });
			await queryClient.invalidateQueries({ queryKey: ['projects'] });
			const actionLabel = variables?.action === 'PUBLISH' ? 'published' : 'updated';
			showToast(response?.data?.message || `Selected tasks ${actionLabel} successfully`, 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to apply bulk action', 'error');
		},
	});
};
