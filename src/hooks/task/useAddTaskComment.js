import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '@/services/task';
import { useToast } from '../common';

export const useAddTaskComment = (taskId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => TaskService.addTaskComment(taskId, payload),
		onSuccess: async () => {
			// Invalidate the specific task detail to refresh the comment thread
			await queryClient.invalidateQueries({
				queryKey: ['tasks', { id: taskId }],
			});

			showToast('Comment added successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to add comment', 'error');
		},
	});
};
