import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { StationService } from '@/services/stations';
import { useToast } from '../commom';

export const useAddStation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		// Simplified: stationData is now the direct payload from the form
		mutationFn: (stationData) => {
			console.log('Sending Station Payload:', stationData);
			return StationService.addStation(stationData);
		},

		onSuccess: async () => {
			// Refresh the stations list on the React Flow canvas
			await queryClient.invalidateQueries({
				queryKey: ['stations'],
			});

			showToast('Station Successfully Added!', 'success');
			dispatch(closeDrawer({ drawerName: 'addStationDrawer' }));
		},

		onError: (error) => {
			// Improved error parsing for Express/Prisma errors
			const errorMessage =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				'Failed to add station';

			showToast(errorMessage, 'error');
		},
	});
};
