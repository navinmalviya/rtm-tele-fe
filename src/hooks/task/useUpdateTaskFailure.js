import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '@/services/task';
import { useToast } from '../common';

export const useUpdateTaskFailure = (taskId) => {
	const showToast = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload) => {
			if (!taskId) {
				return Promise.reject(new Error('Task id is missing'));
			}
			return TaskService.updateFailureDetails(taskId, payload);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['tasks', { id: taskId }] });
			await queryClient.invalidateQueries({ queryKey: ['tasks'] });
			showToast('Failure details saved', 'success');
		},
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to save failure details', 'error');
		},
	});
};
