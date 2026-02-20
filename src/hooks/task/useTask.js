import { useQuery } from '@tanstack/react-query';
import { TaskService } from '@/services/task';
import { useToast } from '../common';

export const useTask = (taskId, options = {}) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['tasks', { id: taskId }],
		queryFn: () => TaskService.getTaskById(taskId),
		enabled: !!taskId,
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch task', 'error');
		},
		...options,
	});
};
