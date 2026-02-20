import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenance';
import { useToast } from '../common';

export const useCompleteMaintenance = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ occurrenceId, payload }) =>
			MaintenanceService.completeOccurrence(occurrenceId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['maintenance-overdue'] });
			queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
			showToast('Maintenance marked complete', 'success');
		},
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to complete maintenance', 'error');
		},
	});
};
