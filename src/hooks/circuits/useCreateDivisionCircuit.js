import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircuitsService } from '@/services/circuits';
import { useToast } from '../common';

export const useCreateDivisionCircuit = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => CircuitsService.createMaster(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['division-circuit-masters'] });
			showToast('Circuit master created', 'success');
		},
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to create circuit master', 'error');
		},
	});
};
