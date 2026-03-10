import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TnpService } from '@/services/tnp';
import { useToast } from '../common';

export const useUpdateTnpItem = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, data }) => TnpService.update(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['tnp-items'] });
			showToast('T&P item updated', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update T&P item', 'error');
		},
	});
};
