import { useQuery } from '@tanstack/react-query';
import { SubSectionService } from '@/services/sub-sections';

export const useSubSectionDetails = (subsectionId) => {
	return useQuery({
		queryKey: ['subsection', subsectionId],
		queryFn: () => SubSectionService.subSectionDetails(subsectionId),
		enabled: Boolean(subsectionId),
		select: (response) => response.data?.details ?? response.data,
	});
};
