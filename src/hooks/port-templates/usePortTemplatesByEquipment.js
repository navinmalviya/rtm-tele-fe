import { useQuery } from '@tanstack/react-query';
import { PortTemplateService } from '@/services/port-template';
import { useToast } from '../commom';

export const usePortTemplatesByEquipment = (equipmentTemplateId) => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['port-templates', 'by-equipment', equipmentTemplateId],
		queryFn: () => PortTemplateService.getTemplatesByEquipment(equipmentTemplateId),
		enabled: !!equipmentTemplateId, // Only run if ID exists
		select: (response) => response.data,
		onError: (error) => {
			showToast(
				error.response?.data?.message || 'Failed to fetch equipment ports',
				'error'
			);
		},
	});
};
