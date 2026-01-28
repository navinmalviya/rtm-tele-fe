import { useQuery } from '@tanstack/react-query';
import { SubSectionService } from '@/services/sub-sections';
import { useToast } from '../commom';

export const useSubsections = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['subsections'],
		queryFn: () => SubSectionService.allSubSections(),
		select: (response) => {
			const subsections = response.data; // Assuming axios response structure

			return subsections.map((sub) => ({
				id: sub.id,
				name: sub.name,
				code: sub.code,
				// These are useful for React Flow edges
				source: sub.fromStationId,
				target: sub.toStationId,
				// Extra metadata for UI/Forms
				data: {
					sectionId: sub.sectionId,
					fromStation: sub.fromStation?.name,
					toStation: sub.toStation?.name,
				},
			}));
		},
		onSuccess: () => {
			// Optional: Actions on successful fetch
		},
		onError: (error) => {
			const message =
				error?.response?.data?.message || 'Failed to fetch sub-sections';
			showToast(message, 'error');
		},
	});
};
