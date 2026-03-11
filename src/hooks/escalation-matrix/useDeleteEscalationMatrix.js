import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EscalationMatrixService } from '@/services/escalation-matrix';
import { useToast } from '../common';

export const useDeleteEscalationMatrix = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => EscalationMatrixService.remove(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['escalation-matrix'] });
			showToast('Escalation level deleted successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to delete escalation level', 'error');
		},
	});
};
