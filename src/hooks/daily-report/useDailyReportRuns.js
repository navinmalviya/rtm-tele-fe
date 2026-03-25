import { useQuery } from '@tanstack/react-query';
import { DailyReportService } from '@/services/daily-report';
import { useToast } from '../common';

export const useDailyReportRuns = (params = {}, enabled = true) => {
	const showToast = useToast();
	return useQuery({
		queryKey: ['daily-report', 'runs', params],
		queryFn: () => DailyReportService.listRuns(params),
		select: (response) => response.data,
		enabled,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to load report history', 'error');
		},
	});
};
