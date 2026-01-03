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
		mutationFn: ({ stationData, createdById }) => {
			const payload = {
				...stationData,
				createdById,
			};
			console.log('payload', payload);
			return StationService.addStation(payload);
		},

		onSuccess: async () => {
			// ✅ v5 invalidate syntax
			await queryClient.invalidateQueries({
				queryKey: ['stations'],
			});

			showToast('Station Successfully Added!', 'success');
			dispatch(closeDrawer({ drawerName: 'addStationDrawer' }));
		},

		onError: (error) => {
			showToast(
				error?.response?.data?.errors?.[0] || 'Failed to add station',
				'error'
			);
		},
	});
};
