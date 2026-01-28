import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { PortTemplateService } from '@/services/port-template';
import { useToast } from '../commom';

export const useAddPortTemplate = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: (portData) => {
			// portData now includes { name, category, type, speed, voltage, etc. }
			return PortTemplateService.addPortTemplate(portData);
		},
		onSuccess: async () => {
			// Invalidate the cache to refresh the Port Library table/list
			await queryClient.invalidateQueries({
				queryKey: ['port-templates'],
			});

			showToast('Port Blueprint successfully added to Library!', 'success');

			// Close the drawer upon successful creation
			dispatch(closeDrawer({ drawerName: 'addPortTemplateDrawer' }));
		},
		onError: (error) => {
			// Extract the most specific error message possible from the server
			const errorMessage =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				'Failed to save port blueprint';

			showToast(errorMessage, 'error');
		},
	});
};
