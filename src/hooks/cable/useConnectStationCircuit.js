import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../common';
import { CableService } from '@/services/cable';

export const useConnectStationCircuit = (cableId) => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => CableService.connectStationCircuit(payload),
		onSuccess: async (response) => {
			await queryClient.invalidateQueries({ queryKey: ['cable', cableId] });
			showToast(response?.data?.message || 'Circuit mapped successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to map circuit', 'error');
		},
	});
};
