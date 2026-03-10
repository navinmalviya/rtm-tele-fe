import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { RackService } from '@/services/racks';
import { useToast } from '../common';

export const useUpdateRack = (stationId) => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ id, data }) => RackService.updateRack(id, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['racks', stationId] });
			await queryClient.invalidateQueries({ queryKey: ['racks'] });
			showToast('Rack updated successfully!', 'success');
			dispatch(closeDrawer({ drawerName: 'editRackDrawer' }));
		},
		onError: (error) => {
			showToast(error?.response?.data?.error || 'Failed to update rack', 'error');
		},
	});
};
