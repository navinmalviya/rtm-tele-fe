import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { SectionService } from '@/services/sections';
import { useToast } from '../commom';

export const useAddSection = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: (sectionData) => {
			console.log('Sending Section Payload:', sectionData);
			return SectionService.addSection(sectionData);
		},

		onSuccess: async () => {
			// Refresh the sections list
			await queryClient.invalidateQueries({
				queryKey: ['sections'],
			});

			showToast('Main Section Created Successfully!', 'success');
			dispatch(closeDrawer({ drawerName: 'addSectionDrawer' }));
		},

		onError: (error) => {
			const errorMessage =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				'Failed to add section';

			showToast(errorMessage, 'error');
		},
	});
};
