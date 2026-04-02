import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyReportService } from '@/services/daily-report';
import { useToast } from '../common';

export const useCreateDailyReportInput = () => {
	const showToast = useToast();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload) => DailyReportService.createInput(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['daily-report'] });
			showToast('Daily input entry saved', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to save daily input entry', 'error');
		},
	});
};
