import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircuitsService } from '@/services/circuits';
import { useToast } from '../common';

export const useCreateStationCircuit = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => CircuitsService.createStationCircuit(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['station-circuits'] });
			queryClient.invalidateQueries({ queryKey: ['maintenance-my-summary'] });
			showToast('Station circuit submitted', 'success');
		},
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to submit station circuit', 'error');
		},
	});
};
