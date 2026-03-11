import { useQuery } from '@tanstack/react-query';
import { EscalationMatrixService } from '@/services/escalation-matrix';
import { useToast } from '../common';

export const useEscalationMatrix = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['escalation-matrix'],
		queryFn: () => EscalationMatrixService.getAll(),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to fetch escalation matrix', 'error');
		},
	});
};
