import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TnpService } from '@/services/tnp';
import { useToast } from '../common';

export const useDeleteTnpItem = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => TnpService.remove(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['tnp-items'] });
			showToast('T&P item deleted', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to delete T&P item', 'error');
		},
	});
};
