import { useQuery } from '@tanstack/react-query';
import { DailyReportService } from '@/services/daily-report';
import { useToast } from '../common';

export const useDailyReportInputs = (params = {}) => {
	const showToast = useToast();
	return useQuery({
		queryKey: ['daily-report', 'inputs', params],
		queryFn: () => DailyReportService.listInputs(params),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to load daily inputs', 'error');
		},
	});
};
