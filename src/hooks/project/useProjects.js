import { useQuery } from '@tanstack/react-query';
import { ProjectService } from '@/services/project';

import { useToast } from '../commom';

export const useProjects = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['projects'],
		queryFn: () => ProjectService.getAllProjects(),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch projects', 'error');
		},
	});
};
