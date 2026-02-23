import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../common';
import { CableService } from '@/services/cable';

export const useConnectMedia = (cableId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => CableService.connectMedia(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['cable', cableId] });
			showToast('Connection updated', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to connect media', 'error');
		},
	});
};
