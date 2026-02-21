import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../common';
import { CableService } from '@/services/cable';

export const useAddEcSocket = (cableId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => CableService.addEcSocket(cableId, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['cable', cableId] });
			showToast('EC socket added successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to add EC socket', 'error');
		},
	});
};
