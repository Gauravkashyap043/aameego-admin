import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export type AssetAssignmentPage = {
  items: any[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// Hook to assign asset to user
export const useAssignAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assignmentData: {
      assetId: string;
      userId: string;
      vehicleId?: string;
      vehicleAssignmentId?: string;
      assignmentType: 'user_only' | 'vehicle_specific' | 'temporary';
      assignmentReason: string;
      assignmentPurpose: string;
      expectedReturnDate: Date;
      condition: {
        description: string;
        images?: string[];
        videos?: string[];
      };
      notes?: string;
    }) => {
      const res = await api.post('/asset-assignment/assign', assignmentData);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['assetAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['userAssetAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicleAssetAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['assetAssignmentStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['vehicleAssetList'] });
    },
  });
};

// Hook to return asset
export const useReturnAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ assignmentId, returnData }: {
      assignmentId: string;
      returnData: {
        actualReturnDate?: Date;
        condition: {
          description: string;
          images?: string[];
          videos?: string[];
        };
        notes?: string;
      };
    }) => {
      const res = await api.put(`/asset-assignment/${assignmentId}/return`, returnData);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['assetAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['userAssetAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicleAssetAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['assetAssignmentStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['vehicleAssetList'] });
    },
  });
};

// Hook to approve assignment
export const useApproveAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ assignmentId, approvalData }: {
      assignmentId: string;
      approvalData: {
        approvalNotes?: string;
      };
    }) => {
      const res = await api.put(`/asset-assignment/${assignmentId}/approve`, approvalData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['assetAssignmentStatistics'] });
    },
  });
};

// Hook to reject assignment
export const useRejectAssignment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ assignmentId, rejectionData }: {
      assignmentId: string;
      rejectionData: {
        approvalNotes?: string;
      };
    }) => {
      const res = await api.put(`/asset-assignment/${assignmentId}/reject`, rejectionData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['assetAssignmentStatistics'] });
    },
  });
};

// Hook to get user's asset assignments
export const useUserAssetAssignments = (userId: string, includeInactive: boolean = false) => {
  return useQuery({
    queryKey: ['userAssetAssignments', userId, includeInactive],
    queryFn: async () => {
      const res = await api.get(`/asset-assignment/user/${userId}?includeInactive=${includeInactive}`);
      return res.data.data;
    },
    enabled: !!userId,
  });
};

// Hook to get vehicle's asset assignments
export const useVehicleAssetAssignments = (vehicleId: string, includeInactive: boolean = false) => {
  return useQuery({
    queryKey: ['vehicleAssetAssignments', vehicleId, includeInactive],
    queryFn: async () => {
      const res = await api.get(`/asset-assignment/vehicle/${vehicleId}?includeInactive=${includeInactive}`);
      return res.data.data;
    },
    enabled: !!vehicleId,
  });
};

// Hook to get asset assignment history
export const useAssetAssignmentHistory = (assetId: string) => {
  return useQuery({
    queryKey: ['assetAssignmentHistory', assetId],
    queryFn: async () => {
      const res = await api.get(`/asset-assignment/asset/${assetId}/history`);
      return res.data.data;
    },
    enabled: !!assetId,
  });
};

// Hook to get active asset assignments
export const useActiveAssetAssignments = () => {
  return useQuery({
    queryKey: ['activeAssetAssignments'],
    queryFn: async () => {
      const res = await api.get('/asset-assignment/active');
      return res.data.data;
    },
  });
};

// Hook to get overdue asset assignments
export const useOverdueAssetAssignments = () => {
  return useQuery({
    queryKey: ['overdueAssetAssignments'],
    queryFn: async () => {
      const res = await api.get('/asset-assignment/overdue');
      return res.data.data;
    },
  });
};

// Hook to get asset assignment statistics
export const useAssetAssignmentStatistics = () => {
  return useQuery({
    queryKey: ['assetAssignmentStatistics'],
    queryFn: async () => {
      const res = await api.get('/asset-assignment/statistics');
      return res.data.data;
    },
  });
};

// Hook to get paginated asset assignments
export const useAssetAssignments = (
  page = 1,
  limit = 10,
  filters?: {
    search?: string;
    status?: string;
    assignmentType?: string;
    userId?: string;
    vehicleId?: string;
  }
) => {
  return useQuery<AssetAssignmentPage>({
    queryKey: ['assetAssignments', page, limit, filters],
    queryFn: async () => {
      const params: any = { page, limit };
      if (filters) {
        Object.assign(params, filters);
      }
      const res = await api.get('/asset-assignment', { params });
      return res.data.data as AssetAssignmentPage;
    },
  });
};

// Hook to get single asset assignment by ID
export const useAssetAssignment = (id: string) => {
  return useQuery({
    queryKey: ['assetAssignment', id],
    queryFn: async () => {
      const res = await api.get(`/asset-assignment/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};
