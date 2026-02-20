import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenance';
import { useToast } from '../common';

export const useToggleMaintenanceSchedule = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => MaintenanceService.toggleScheduleStatus(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
			showToast('Schedule status updated', 'success');
		},
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to update status', 'error');
		},
	});
};
