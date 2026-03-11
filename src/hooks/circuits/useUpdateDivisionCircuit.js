import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircuitsService } from '@/services/circuits';
import { useToast } from '../common';

export const useUpdateDivisionCircuit = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, payload }) => CircuitsService.updateMaster(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['division-circuit-masters'] });
			showToast('Circuit master updated', 'success');
		},
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to update circuit master', 'error');
		},
	});
};
