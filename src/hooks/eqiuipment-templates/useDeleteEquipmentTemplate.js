import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EquipmentTemplateService } from '@/services/equipment-template';

import { useToast } from '../commom';

export const useDeleteEquipmentTemplate = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => {
			return EquipmentTemplateService.deleteTemplate(id);
		},

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['equipment-templates'],
			});

			showToast('Template deleted from library', 'success');
		},

		onError: (error) => {
			showToast(
				error?.response?.data?.error || 'Failed to delete template',
				'error'
			);
		},
	});
};
