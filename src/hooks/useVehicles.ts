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

export const useVehicleList = (page = 1, limit = 10, search?: string, rented?: string) => {
  return useQuery<VehiclePage>({
    queryKey: ['vehicleList', page, limit, search ?? '', rented ?? ''],
    queryFn: async () => {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (rented) params.rented = rented;
      const res = await api.get('/vehicle', { params });
      return res.data.data as VehiclePage;
    },
  });
};

export const useAllVehicles = (search?: string, rented?: string) => {
  return useQuery({
    queryKey: ['allVehicles', search ?? '', rented ?? ''],
    queryFn: async () => {
      const params: any = {};
      if (search) params.search = search;
      if (rented) params.rented = rented;
      const res = await api.get('/vehicle/qr-generation', { params });
      return res.data.data as any[];
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