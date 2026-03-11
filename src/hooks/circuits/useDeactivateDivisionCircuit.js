import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircuitsService } from '@/services/circuits';
import { useToast } from '../common';

export const useDeactivateDivisionCircuit = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => CircuitsService.deactivateMaster(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['division-circuit-masters'] });
			showToast('Circuit master deactivated', 'success');
		},
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to deactivate circuit master', 'error');
		},
	});
};
