'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { StationCableService } from '@/services/station-cable';
import { useToast } from '../common';

export const useAddStationCable = ({ stationId, drawerName }) => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: (payload) => StationCableService.create(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['station-cables', stationId] });
			showToast('Station cable created successfully', 'success');
			dispatch(closeDrawer({ drawerName }));
		},
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to create station cable', 'error');
		},
	});
};
