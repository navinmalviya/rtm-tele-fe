import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { SubSectionService } from '@/services/sub-sections';
import { useToast } from '../commom';

export const useAddSubSection = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: (subSectionData) => {
			console.log('Sending Sub-section Payload:', subSectionData);
			return SubSectionService.addSubSection(subSectionData);
		},

		onSuccess: async () => {
			// Invalidate subsections so dropdowns and maps update
			await queryClient.invalidateQueries({
				queryKey: ['subsections'],
			});

			showToast('Sub-section Created Successfully!', 'success');
			dispatch(closeDrawer({ drawerName: 'addSubSectionDrawer' }));
		},

		onError: (error) => {
			const errorMessage =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				'Failed to add sub-section';

			showToast(errorMessage, 'error');
		},
	});
};
