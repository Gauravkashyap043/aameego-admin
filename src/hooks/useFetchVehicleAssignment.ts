import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useFetchVehicleAssignment(userId?: string) {
  return useQuery({
    queryKey: ['vehicle-assignment', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await api.get(`/vehicle-assignment/rider/${userId}`);
      return res.data.data;
    },
    enabled: !!userId,
  });
}
