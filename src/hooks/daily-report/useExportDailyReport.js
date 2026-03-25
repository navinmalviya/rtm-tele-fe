import { useMutation } from '@tanstack/react-query';
import { DailyReportService } from '@/services/daily-report';
import { useToast } from '../common';

const getFilenameFromDisposition = (disposition, fallback) => {
	if (!disposition) return fallback;
	const match = disposition.match(/filename="?([^";]+)"?/i);
	return match?.[1] || fallback;
};

export const useExportDailyReport = () => {
	const showToast = useToast();

	return useMutation({
		mutationFn: async (params) => {
			const response = await DailyReportService.exportReport(params);
			return response;
		},
		onSuccess: (response, variables) => {
			const format = variables?.format === 'graphical' ? 'html' : 'csv';
			const fallback = `daily-telecom-position.${format}`;
			const filename = getFilenameFromDisposition(
				response.headers?.['content-disposition'],
				fallback
			);
			const blob = new Blob([response.data], {
				type: response.headers?.['content-type'] || 'application/octet-stream',
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
			showToast('Report exported successfully', 'success');
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to export report', 'error');
		},
	});
};
