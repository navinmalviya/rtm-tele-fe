import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EscalationMatrixService } from '@/services/escalation-matrix';
import { useToast } from '../common';

export const useCreateEscalationMatrix = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => EscalationMatrixService.create(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['escalation-matrix'] });
			showToast('Escalation level created successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to create escalation level', 'error');
		},
	});
};
