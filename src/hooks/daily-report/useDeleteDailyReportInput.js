import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyReportService } from '@/services/daily-report';
import { useToast } from '../common';

export const useDeleteDailyReportInput = () => {
	const showToast = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id) => DailyReportService.deleteInput(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['daily-report'] });
			showToast('Daily feed entry deleted', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to delete daily feed entry', 'error');
		},
	});
};
