'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { EquipmentService } from '@/services/equipment';
import { useToast } from '../common';

export const useAddEquipment = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: (equipmentData) => {
			// Data refinement before hitting the API
			const refinedData = {
				...equipmentData,
				// Ensure uPosition is a number or null
				uPosition: equipmentData.uPosition ? Number.parseInt(equipmentData.uPosition) : null,
				mapX: null,
				mapY: null,
				// Ensure the date is valid or null
				installationDate: equipmentData.installationDate || null,
			};

			return EquipmentService.addEquipment(refinedData);
		},

		onSuccess: async () => {
			// Invalidate equipment and racks to update visual load/counts
			await queryClient.invalidateQueries({
				queryKey: ['equipment'],
			});

			showToast('Asset deployed successfully!', 'success');

			// Close the specific drawer
			dispatch(closeDrawer({ drawerName: 'addEquipmentDrawer' }));
		},

		onError: (error) => {
			console.error('Equipment Deployment Error:', error);
			showToast(error?.response?.data?.error || 'Failed to deploy equipment', 'error');
		},
	});
};
