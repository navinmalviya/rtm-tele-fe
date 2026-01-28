import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { EquipmentTemplateService } from '@/services/equipment-template';
import { useToast } from '../commom';

export const useAddEquipmentTemplate = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: (templateData) => {
			return EquipmentTemplateService.addTemplate(templateData);
		},

		onSuccess: async () => {
			// Refresh the library list
			await queryClient.invalidateQueries({
				queryKey: ['equipment-templates'],
			});

			showToast('Template successfully added!', 'success');
			dispatch(closeDrawer({ drawerName: 'addEquipmentTemplateDrawer' }));
		},

		onError: (error) => {
			showToast(
				error?.response?.data?.error || 'Failed to add template',
				'error'
			);
		},
	});
};
