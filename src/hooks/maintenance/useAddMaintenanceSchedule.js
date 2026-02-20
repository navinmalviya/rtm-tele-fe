import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenance';
import { useToast } from '../common';

export const useAddMaintenanceSchedule = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => MaintenanceService.createSchedule(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] });
			showToast('Schedule created', 'success');
		},
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to create schedule', 'error');
		},
	});
};
