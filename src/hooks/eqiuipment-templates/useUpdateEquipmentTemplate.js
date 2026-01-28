import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { EquipmentTemplateService } from '@/services/equipment-template';

import { useToast } from '../commom';

export const useUpdateEquipmentTemplate = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, templateData }) => {
			return EquipmentTemplateService.updateTemplate(id, templateData);
		},

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['equipment-templates'],
			});

			showToast('Template successfully updated!', 'success');
			dispatch(closeDrawer({ drawerName: 'editEquipmentTemplateDrawer' }));
		},

		onError: (error) => {
			showToast(
				error?.response?.data?.error || 'Failed to update template',
				'error'
			);
		},
	});
};
