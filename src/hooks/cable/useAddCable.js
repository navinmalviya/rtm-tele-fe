'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { closeDrawer } from '@/lib/store/slices/drawer-slice';
import { CableService } from '@/services/cable';
import { useToast } from '../common';

/**
 * Utility to map subType to structural counts.
 * This ensures the backend transaction generates the correct number of quads/fibers.
 */
const getStructuralCounts = (subType) => {
	switch (subType) {
		case 'QUAD_6':
			return { quadCount: 6, pairCount: 24, fiberCount: 0, tubeCount: 0 };
		case 'OFC_24':
			return { quadCount: 0, pairCount: 0, fiberCount: 24, tubeCount: 6 };
		case 'OFC_48':
			return { quadCount: 0, pairCount: 0, fiberCount: 48, tubeCount: 6 };
		case 'PAIR_10':
			return { quadCount: 0, pairCount: 10, fiberCount: 0, tubeCount: 0 };
		default:
			return {};
	}
};

export const useAddCable = (drawerName = 'addCableDrawer') => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const showToast = useToast();

	return useMutation({
		mutationFn: (formData) => {
			// Merge the form data with the structural counts required by the backend
			const structuralData = getStructuralCounts(formData.subType);
			const payload = { ...formData, ...structuralData };

			return CableService.addCable(payload);
		},

		onSuccess: async (data) => {
			const createdCable = data.data || {};
			const subsectionId = createdCable.subsectionId;

			if (subsectionId) {
				await queryClient.invalidateQueries({ queryKey: ['cables', subsectionId] });
			}

			showToast('New cable and all physical assets registered successfully!', 'success');

			// Close the entry drawer
			dispatch(closeDrawer({ drawerName }));
		},

		onError: (error) => {
			showToast(
				error?.response?.data?.error || 'Failed to register cable and child assets',
				'error'
			);
		},
	});
};
