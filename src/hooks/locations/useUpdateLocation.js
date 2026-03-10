import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { LocationService } from '@/services/locations';
import { useToast } from '../common';

export const useUpdateLocation = (stationId) => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, data }) => LocationService.updateLocation(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['locations', stationId] });
			await queryClient.invalidateQueries({ queryKey: ['locations'] });
			showToast('Location updated successfully!', 'success');
			dispatch(closeDrawer({ drawerName: 'editLocationDrawer' }));
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to update location', 'error');
		},
	});
};
