import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CableService } from '@/services/cable';
import { useToast } from '../common';

export const useAddCableTestReport = (cableId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => CableService.addCableTestReport(cableId, payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['cables'] }),
				queryClient.invalidateQueries({ queryKey: ['cable', cableId] }),
			]);
			showToast('Cable testing report added successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to add cable testing report', 'error');
		},
	});
};
