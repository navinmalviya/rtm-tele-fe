import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceService } from '@/services/maintenance';
import { useToast } from '../common';

export const useDeleteMaintenanceSchedule = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: (id) => MaintenanceService.deleteSchedule(id),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] }),
				queryClient.invalidateQueries({ queryKey: ['maintenance-overdue'] }),
			]);
			showToast('Schedule deleted successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to delete schedule', 'error');
		},
	});
};
