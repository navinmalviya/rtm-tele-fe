import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenance';
import { useToast } from '../common';

export const useUpdateMaintenanceSchedule = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, payload }) => MaintenanceService.updateSchedule(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
			showToast('Schedule updated', 'success');
		},
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to update schedule', 'error');
		},
	});
};
