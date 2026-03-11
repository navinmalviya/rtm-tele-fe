import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EscalationMatrixService } from '@/services/escalation-matrix';
import { useToast } from '../common';

export const useUpdateEscalationMatrix = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, data }) => EscalationMatrixService.update(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['escalation-matrix'] });
			showToast('Escalation level updated successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update escalation level', 'error');
		},
	});
};
