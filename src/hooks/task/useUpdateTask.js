import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '@/services/task';
import { useToast } from '../common';

export const useUpdateTask = (taskId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => {
			if (!taskId) {
				return Promise.reject(new Error('Task id is missing'));
			}
			return TaskService.updateTask(taskId, payload);
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['tasks', { id: taskId }] }),
				queryClient.invalidateQueries({ queryKey: ['tasks'] }),
				queryClient.invalidateQueries({ queryKey: ['projects'] }),
			]);
			showToast('Task details updated', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update task details', 'error');
		},
	});
};
