import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectService } from '@/services/project';
import { useToast } from '../common';

export const useSyncProjectProgress = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => ProjectService.syncProjectProgress(id),

		onSuccess: async (response, projectId) => {
			// Refresh the specific project details to show the new progress
			await queryClient.invalidateQueries({
				queryKey: ['projects', projectId],
			});

			showToast('Progress Synchronized!', 'info');
		},

		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to sync progress', 'error');
		},
	});
};
