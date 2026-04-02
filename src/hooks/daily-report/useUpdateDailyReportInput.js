import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyReportService } from '@/services/daily-report';
import { useToast } from '../common';

export const useUpdateDailyReportInput = () => {
	const showToast = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }) => DailyReportService.updateInput(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['daily-report'] });
			showToast('Daily input entry updated', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update daily input entry', 'error');
		},
	});
};
