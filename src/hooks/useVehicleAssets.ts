import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../services/api';

export type VehicleAssetPage = {
  items: any[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// Hook to fetch asset types
export const useAssetTypes = () => {
  return useQuery({
    queryKey: ['assetTypes'],
    queryFn: async () => {
      const res = await api.get('/asset-type');
      return res.data.data;
    },
  });
};

// Hook to fetch asset vendors
export const useAssetVendors = () => {
  return useQuery({
    queryKey: ['assetVendors'],
    queryFn: async () => {
      const res = await api.get('/asset-vendor');
      return res.data.data;
    },
  });
};

// Hook to fetch vehicle assets list
export const useVehicleAssetList = (page = 1, limit = 10, filters?: {
  vehicle?: string;
  assetType?: string;
  assetVendor?: string;
  status?: string;
  ownership?: string;
  assignedTo?: string;
  condition?: string;
}) => {
  return useQuery<VehicleAssetPage>({
    queryKey: ['vehicleAssetList', page, limit, filters],
    queryFn: async () => {
      const params: any = { page, limit };
      if (filters) {
        Object.assign(params, filters);
      }
      const res = await api.get('/vehicle-asset', { params });
      return res.data.data as VehicleAssetPage;
    },
  });
};

// Hook to fetch asset statistics
export const useAssetStatistics = () => {
  return useQuery({
    queryKey: ['assetStatistics'],
    queryFn: async () => {
      const res = await api.get('/vehicle-asset/statistics');
      return res.data.data;
    },
  });
};

// Hook to fetch a single vehicle asset
export const useVehicleAsset = (id: string) => {
  return useQuery({
    queryKey: ['vehicleAsset', id],
    queryFn: async () => {
      const res = await api.get(`/vehicle-asset/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};

// Hook to create a new vehicle asset
export const useCreateVehicleAsset = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/vehicle-asset', data, {
        headers: {
          'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return res.data;
    },
  });
};

// Hook to update a vehicle asset
export const useUpdateVehicleAsset = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await api.put(`/vehicle-asset/${id}`, data, {
        headers: {
          'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return res.data;
    },
  });
};

// Hook to delete a vehicle asset
export const useDeleteVehicleAsset = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/vehicle-asset/${id}`);
      return res.data;
    },
  });
};

// Hook to assign asset to user
export const useAssignAssetToUser = () => {
  return useMutation({
    mutationFn: async ({ assetId, userId, vehicleAssignmentId }: {
      assetId: string;
      userId: string;
      vehicleAssignmentId?: string;
    }) => {
      const res = await api.post(`/vehicle-asset/${assetId}/assign`, {
        userId,
        vehicleAssignmentId,
      });
      return res.data;
    },
  });
};

// Hook to return asset
export const useReturnAsset = () => {
  return useMutation({
    mutationFn: async ({ assetId, notes }: { assetId: string; notes?: string }) => {
      const res = await api.post(`/vehicle-asset/${assetId}/return`, { notes });
      return res.data;
    },
  });
};

// Removed useAssetsByVehicle hook as vehicle field is no longer part of assets

// Hook to get assets by user
export const useAssetsByUser = (userId: string) => {
  return useQuery({
    queryKey: ['assetsByUser', userId],
    queryFn: async () => {
      const res = await api.get(`/vehicle-asset/user/${userId}`);
      return res.data.data;
    },
    enabled: !!userId,
  });
};
