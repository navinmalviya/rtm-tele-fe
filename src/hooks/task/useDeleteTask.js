import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '@/services/task';
import { useToast } from '../common';

export const useDeleteTask = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => TaskService.deleteTask(id),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['tasks'] }),
				queryClient.invalidateQueries({ queryKey: ['projects'] }),
			]);
			showToast('Task deleted successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to delete task', 'error');
		},
	});
};
