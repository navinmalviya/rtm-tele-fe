import { useQuery } from '@tanstack/react-query';
import { DailyReportService } from '@/services/daily-report';
import { useToast } from '../common';

export const useDailyReportDashboard = (params = {}) => {
	const showToast = useToast();
	return useQuery({
		queryKey: ['daily-report', 'dashboard', params],
		queryFn: () => DailyReportService.getDashboard(params),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to load daily report dashboard', 'error');
		},
	});
};
