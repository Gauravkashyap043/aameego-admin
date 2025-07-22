import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useAddVehicle = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/vehicle', data);
      return res.data;
    },
  });
};

export const useVehicleList = () => {
  return useQuery({
    queryKey: ['vehicleList'],
    queryFn: async () => {
      const res = await api.get('/vehicle');
      return res.data.data;
    },
  });
}; 