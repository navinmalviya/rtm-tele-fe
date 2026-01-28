import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PortTemplateService } from '@/services/port-template';
import { useToast } from '../commom';

export const useDeletePortTemplate = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => {
			return PortTemplateService.deletePortTemplate(id);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['port-templates'],
			});
			showToast('Port template deleted successfully', 'success');
		},
		onError: (error) => {
			showToast(
				error?.response?.data?.error || 'Failed to delete port template',
				'error'
			);
		},
	});
};
