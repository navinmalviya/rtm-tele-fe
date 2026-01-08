import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { LocationService } from '@/services/locations';
import { useToast } from '../commom';

export const useAddLocation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ locationData, stationId }) => {
			const payload = {
				...locationData,
				stationId,
			};
			console.log('payload', payload);
			return LocationService.addLocation(payload);
		},

		onSuccess: async () => {
			// ✅ v5 invalidate syntax
			await queryClient.invalidateQueries({
				queryKey: ['locations'],
			});

			showToast('Location Successfully Added!', 'success');
			dispatch(closeDrawer({ drawerName: 'addLocationDrawer' }));
		},

		onError: (error) => {
			showToast(
				error?.response?.data?.errors?.[0] || 'Failed to add location',
				'error'
			);
		},
	});
};
