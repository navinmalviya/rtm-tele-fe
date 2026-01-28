import { useQuery } from '@tanstack/react-query';
import { PortTemplateService } from '@/services/port-template';
import { useToast } from '../commom';

export const usePortTemplates = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['port-templates'],
		queryFn: () => PortTemplateService.allPortTemplates(),
		select: (response) => response.data,
		onError: (error) => {
			showToast(
				error.response?.data?.message || 'Failed to fetch port templates',
				'error'
			);
		},
	});
};
