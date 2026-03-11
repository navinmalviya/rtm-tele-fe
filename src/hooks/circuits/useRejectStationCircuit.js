import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircuitsService } from '@/services/circuits';
import { useToast } from '../common';

export const useRejectStationCircuit = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, payload }) => CircuitsService.rejectStationCircuit(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['station-circuits'] });
			showToast('Station circuit rejected', 'success');
		},
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to reject station circuit', 'error');
		},
	});
};
