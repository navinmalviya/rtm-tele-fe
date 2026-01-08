import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { RackService } from '@/services/racks';
import { useToast } from '../commom';

export const useAddRack = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: ({ rackData }) => {
			const payload = {
				...rackData,
			};
			return RackService.addRack(payload);
		},

		onSuccess: async () => {
			// ✅ v5 invalidate syntax
			await queryClient.invalidateQueries({
				queryKey: ['racks'],
			});

			showToast('Rack Successfully Added!', 'success');
			dispatch(closeDrawer({ drawerName: 'addRackDrawer' }));
		},

		onError: (error) => {
			showToast(
				error?.response?.data?.errors?.[0] || 'Failed to add rack',
				'error'
			);
		},
	});
};
