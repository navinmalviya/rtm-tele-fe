import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectService } from '@/services/project';

import { useToast } from '../common';

export const useUpdateProject = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, payload }) => ProjectService.updateProject(id, payload),

		onSuccess: async (response) => {
			const projectId = response.data?.id;

			// Invalidate the list and the specific detail view
			await queryClient.invalidateQueries({ queryKey: ['projects'] });
			if (projectId) {
				await queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
			}

			showToast('Project Updated Successfully!', 'success');
		},

		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update project', 'error');
		},
	});
};
