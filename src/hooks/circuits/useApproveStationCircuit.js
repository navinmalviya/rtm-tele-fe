import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircuitsService } from '@/services/circuits';
import { useToast } from '../common';

export const useApproveStationCircuit = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, payload }) => CircuitsService.approveStationCircuit(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['station-circuits'] });
			showToast('Station circuit approved', 'success');
		},
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to approve station circuit', 'error');
		},
	});
};
