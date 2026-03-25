import { useQuery } from '@tanstack/react-query';
import { DailyReportService } from '@/services/daily-report';
import { useToast } from '../common';

export const useDailyFeedCoverage = (params = {}, enabled = true) => {
	const showToast = useToast();
	return useQuery({
		queryKey: ['daily-report', 'coverage', params],
		queryFn: () => DailyReportService.getCoverage(params),
		select: (response) => response.data,
		enabled,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to load feed coverage', 'error');
		},
	});
};
