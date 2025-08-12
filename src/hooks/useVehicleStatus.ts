import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { toast } from 'react-toastify';

export const useUpdateVehicleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, data }: { assignmentId: string; data: any }) => {
      const response = await api.put(`/vehicle-assignment/status/${assignmentId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Vehicle status updated successfully!');
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update vehicle status');
    },
  });
};


