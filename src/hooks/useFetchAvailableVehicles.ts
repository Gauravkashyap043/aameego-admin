import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useFetchAvailableVehicles() {
  return useQuery({
    queryKey: ['available-vehicles'],
    queryFn: async () => {
      const res = await api.get('/vehicle/available-vehicles');
      return res.data.data;
    },
  });
}
