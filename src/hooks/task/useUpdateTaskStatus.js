import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '@/services/task';
import { useToast } from '../commom';

export const useUpdateTaskStatus = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, status }) => TaskService.updateTaskStatus(id, status),
		onSuccess: async () => {
			// Refresh both tasks and projects to show updated progress bars
			await queryClient.invalidateQueries({ queryKey: ['tasks'] });
			await queryClient.invalidateQueries({ queryKey: ['projects'] });

			showToast('Task status updated', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update task status', 'error');
		},
	});
};
