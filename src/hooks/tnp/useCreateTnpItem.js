import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TnpService } from '@/services/tnp';
import { useToast } from '../common';

export const useCreateTnpItem = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => TnpService.create(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['tnp-items'] });
			showToast('T&P item created', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to create T&P item', 'error');
		},
	});
};
