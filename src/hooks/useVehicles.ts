import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';
export type VehiclePage = {
  items: any[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const useAddVehicle = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/vehicle', data);
      return res.data;
    },
  });
};

export const useVehicleList = (page = 1, limit = 10, search?: string) => {
  return useQuery<VehiclePage>({
    queryKey: ['vehicleList', page, limit, search ?? ''],
    queryFn: async () => {
      const res = await api.get('/vehicle', { params: { page, limit, search } });
      return res.data.data as VehiclePage;
    },
  });
};

export const useUpdateVehicle = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await api.put(`/vehicle/${id}`, data);
      return res.data;
    },
  });
}; 