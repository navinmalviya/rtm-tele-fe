import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PortTemplateService } from '@/services/port-template';
import { useToast } from '../commom';

export const useUpdatePortTemplate = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, data }) => {
			return PortTemplateService.updatePortTemplate(id, data);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['port-templates'],
			});
			showToast('Port template updated!', 'success');
		},
		onError: (error) => {
			showToast(
				error?.response?.data?.error || 'Failed to update port template',
				'error'
			);
		},
	});
};
