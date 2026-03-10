import { useQuery } from '@tanstack/react-query';
import { TnpService } from '@/services/tnp';
import { useToast } from '../common';

export const useTnpItems = () => {
	const showToast = useToast();

	return useQuery({
		queryKey: ['tnp-items'],
		queryFn: () => TnpService.getAll(),
		select: (response) => response.data,
		onError: (error) => {
			showToast(error?.response?.data?.message || 'Failed to load T&P items', 'error');
		},
	});
};
