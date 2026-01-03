import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StationService } from '@/services/stations';
import { useToast } from '../commom';

export const useBulkUpdateStations = () => {
	const queryClient = useQueryClient();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ stations }) => {
			return StationService.bulkUpdateStations({ stations });
		},

		onSuccess: async () => {
			// ✅ v5 invalidate syntax
			await queryClient.invalidateQueries({
				queryKey: ['stations'],
			});

			showToast('Stations Successfully Updated!', 'success');
		},

		onError: (error) => {
			console.log('error', error);
			showToast(
				error?.response?.data?.message || 'Failed to update stations',
				'error'
			);
		},
	});
};
