import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { StationService } from '@/services/stations';
import { useToast } from '../common';

export const useUpdateStation = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, data }) => StationService.updateStation(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['stations'] });
			showToast('Station updated successfully!', 'success');
			dispatch(closeDrawer({ drawerName: 'editStationDrawer' }));
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update station', 'error');
		},
	});
};
