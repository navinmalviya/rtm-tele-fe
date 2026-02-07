import { useQuery } from '@tanstack/react-query';
import { TaskService } from '@/services/task';
import { useToast } from '../commom';

export const useTasks = (filters = {}) => {
	const showToast = useToast();

	return useQuery({
		// Key includes filters to ensure independent caching
		queryKey: ['tasks', filters],
		queryFn: () => TaskService.getAllTasks(filters),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch tasks', 'error');
		},
	});
};
