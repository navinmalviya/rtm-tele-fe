import { useQuery } from '@tanstack/react-query';
import { EquipmentService } from '@/services/equipment';

export const useAllEquipment = () => {
	return useQuery({
		queryKey: ['equipment', 'all'],
		queryFn: () => EquipmentService.findAll(),
		select: (response) => response.data,
	});
};
