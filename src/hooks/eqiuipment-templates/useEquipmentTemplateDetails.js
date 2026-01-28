import { useQuery } from '@tanstack/react-query';
import { EquipmentTemplateService } from '@/services/equipment-template';

import { useToast } from '../commom';

export const useEquipmentTemplateDetails = (templateId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['equipment-templates', templateId],
		queryFn: () => EquipmentTemplateService.templateDetails(templateId),
		select: (response) => response.data,
		enabled: !!templateId, // Only fetch if ID is present
		onError: (error) => {
			showToast(
				error.response?.data?.error || 'Failed to fetch details',
				'error'
			);
		},
	});
};
