import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectService } from '@/services/project';
import { useToast } from '../common';

export const useDeleteProject = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => ProjectService.deleteProject(id),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['projects'] }),
				queryClient.invalidateQueries({ queryKey: ['tasks'] }),
			]);
			showToast('Project deleted successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to delete project', 'error');
		},
	});
};
