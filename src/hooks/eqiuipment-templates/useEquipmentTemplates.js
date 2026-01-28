import { useQuery } from '@tanstack/react-query';
import { EquipmentTemplateService } from '@/services/equipment-template';

import { useToast } from '../commom';

export const useEquipmentTemplates = (filters = {}) => {
	const showToast = useToast();

	return useQuery({
		// Key includes filters to refetch when search/category changes
		queryKey: ['equipment-templates', filters],
		queryFn: () => EquipmentTemplateService.allTemplates(filters),
		select: (response) => response.data,
		placeholderData: (previousData) => previousData,
		onError: (error) => {
			showToast(
				error.response?.data?.error || 'Failed to fetch templates',
				'error'
			);
		},
	});
};
