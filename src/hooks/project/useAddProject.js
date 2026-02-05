import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { ProjectService } from '@/services/project';
import { useToast } from '../commom';

export const useAddProject = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => ProjectService.createProject(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['projects'],
			});

			showToast('Project Initiated Successfully!', 'success');
			dispatch(closeDrawer({ drawerName: 'addProjectDrawer' }));
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to initiate project', 'error');
		},
	});
};
