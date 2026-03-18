import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubSectionService } from '@/services/sub-sections';
import { useToast } from '../common';

export const useDeleteSubSection = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => SubSectionService.deleteSubSection(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['subsections'] });
			showToast('Sub-section deleted successfully!', 'success');
		},
		onError: (error) => {
			const message =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				'Failed to delete sub-section';
			showToast(message, 'error');
		},
	});
};
