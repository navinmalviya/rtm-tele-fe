import { useQuery } from '@tanstack/react-query';
import { SectionService } from '@/services/sections';
import { useToast } from '../common';

export const useSections = () => {
	const showToast = useToast();
	return useQuery({
		queryKey: ['sections'],
		queryFn: () => SectionService.allSections(),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error.response?.data?.message || 'Failed to fetch', 'error');
		},
	});
};
