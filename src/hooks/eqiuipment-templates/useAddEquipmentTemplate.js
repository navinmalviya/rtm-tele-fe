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
			// 1. Ensure all boolean flags are strictly boolean
			// 2. Ensure numerical values are correctly typed
			// 3. portConfigs should be passed through as an array of { portTemplateId, quantity }
			const refinedData = {
				...templateData,
				isMPLSEnables: !!templateData.isMPLSEnables,
				isSMRBased: !!templateData.isSMRBased,
				isPoe: !!templateData.isPoe,
				isModular: !!templateData.isModular,
				// Ensure quantities in portConfigs are Numbers
				portConfigs:
					templateData.portConfigs?.map((cfg) => ({
						portTemplateId: cfg.portTemplateId,
						quantity: Number.parseInt(cfg.quantity || 1),
					})) || [],
			};

			return EquipmentTemplateService.addTemplate(refinedData);
		},

		onSuccess: async () => {
			// Refresh the library list to show the new template immediately
			await queryClient.invalidateQueries({
				queryKey: ['equipment-templates'],
			});

			showToast('Template successfully added to library!', 'success');

			// Close the drawer
			dispatch(closeDrawer({ drawerName: 'addTemplateDrawer' }));
		},

		onError: (error) => {
			console.error('Template Creation Error:', error);
			showToast(error?.response?.data?.error || 'Failed to add equipment template', 'error');
		},
	});
};
