import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { TaskService } from '@/services/task';
import { useToast } from '../commom';

export const useAddTask = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => TaskService.createTask(payload),
		onSuccess: async (response) => {
			const taskType = response.data?.task?.type || 'Task';

			// Invalidate tasks list and projects (since progress likely changed)
			await queryClient.invalidateQueries({ queryKey: ['tasks'] });
			await queryClient.invalidateQueries({ queryKey: ['projects'] });

			showToast(`${taskType} Created Successfully!`, 'success');
			dispatch(closeDrawer({ drawerName: 'addTaskDrawer' }));
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to create task', 'error');
		},
	});
};
