import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { SubSectionService } from '@/services/sub-sections';
import { useToast } from '../common';

export const useUpdateSubSection = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, data }) => SubSectionService.updateSubSection(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['subsections'] });
			showToast('Sub-section updated successfully!', 'success');
			dispatch(closeDrawer({ drawerName: 'editSubSectionDrawer' }));
		},
		onError: (error) => {
			const message =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				'Failed to update sub-section';
			showToast(message, 'error');
		},
	});
};
