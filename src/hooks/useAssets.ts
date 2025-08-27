import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export type AssetPage = {
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

// Hook to fetch assets list
export const useAssetList = (page = 1, limit = 10, filters?: {
  assetType?: string;
  assetVendor?: string;
  status?: string;
  ownership?: string;
  condition?: string;
  search?: string;
}) => {
  return useQuery<AssetPage>({
    queryKey: ['assetList', page, limit, filters],
    queryFn: async () => {
      const params: any = { page, limit };
      if (filters) {
        Object.assign(params, filters);
      }
      const res = await api.get('/asset', { params });
      return res.data.data as AssetPage;
    },
  });
};

// Hook to fetch asset statistics
export const useAssetStatistics = () => {
  return useQuery({
    queryKey: ['assetStatistics'],
    queryFn: async () => {
      const res = await api.get('/asset/statistics');
      return res.data.data;
    },
  });
};

// Hook to fetch a single asset
export const useAsset = (id: string) => {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: async () => {
      const res = await api.get(`/asset/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};

// Hook to create a new asset
export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/asset', data, {
        headers: {
          'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetList'] });
      queryClient.invalidateQueries({ queryKey: ['assetStatistics'] });
    },
  });
};

// Hook to update an asset
export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await api.put(`/asset/${id}`, data, {
        headers: {
          'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetList'] });
      queryClient.invalidateQueries({ queryKey: ['asset'] });
      queryClient.invalidateQueries({ queryKey: ['assetStatistics'] });
    },
  });
};

// Hook to delete an asset
export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/asset/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetList'] });
      queryClient.invalidateQueries({ queryKey: ['assetStatistics'] });
    },
  });
};



// Hook to get assets by user
export const useAssetsByUser = (userId: string) => {
  return useQuery({
    queryKey: ['assetsByUser', userId],
    queryFn: async () => {
      const res = await api.get(`/asset/user/${userId}`);
      return res.data.data;
    },
    enabled: !!userId,
  });
};

// Hook to get current user's assets
export const useCurrentUserAssets = () => {
  return useQuery({
    queryKey: ['currentUserAssets'],
    queryFn: async () => {
      const res = await api.get('/asset/user/current/assets');
      return res.data.data;
    },
  });
};


