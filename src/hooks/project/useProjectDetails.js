import { useQuery } from '@tanstack/react-query';
import { ProjectService } from '@/services/project';
import { useToast } from '../common';

export const useProjectDetails = (projectId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['projects', projectId],
		queryFn: () => ProjectService.getProjectDetails(projectId),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch project details', 'error');
		},
		enabled: !!projectId,
	});
};
