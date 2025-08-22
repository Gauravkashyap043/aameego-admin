import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { toast } from 'react-toastify';

// Hook for admin to assign vehicle to rider
export const useAssignVehicleByAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      vehicleNumber, 
      riderId, 
      vehicleCondition 
    }: { 
      vehicleNumber: string; 
      riderId: string; 
      vehicleCondition: { description: string; images?: string[]; videos?: string[]; }
    }) => {
      const response = await api.post('/vehicle-assignment/assign/admin', {
        vehicleNumber,
        riderId,
        vehicleCondition,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Vehicle assigned successfully!');
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to assign vehicle');
    },
  });
};

// Hook for regular vehicle assignment (for riders)
export const useAssignVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      vehicleNumber, 
      vehicleCondition 
    }: { 
      vehicleNumber: string; 
      vehicleCondition: { description: string; images?: string[]; videos?: string[]; }
    }) => {
      const response = await api.post('/vehicle-assignment/assign', {
        vehicleNumber,
        vehicleCondition,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Vehicle assigned successfully!');
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to assign vehicle');
    },
  });
};

// Hook for unassigning a vehicle from a rider
export const useUnassignVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      vehicleId, 
      notes, 
      returnVehicleCondition 
    }: { 
      vehicleId: string; 
      notes?: string; 
      returnVehicleCondition?: { description?: string; images?: string[]; videos?: string[]; }
    }) => {
      const response = await api.put('/vehicle-assignment/unAssignVehical', {
        vehichleId: vehicleId, // Note: API expects 'vehichleId' (typo in backend)
        notes,
        returnVehicleCondition,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Vehicle unassigned successfully!');
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to unassign vehicle');
    },
  });
};

// Hook for returning a vehicle
export const useReturnVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      assignmentId, 
      returnDate, 
      notes, 
      returnVehicleCondition 
    }: { 
      assignmentId: string; 
      returnDate: Date; 
      notes?: string; 
      returnVehicleCondition?: { description?: string; images?: string[]; videos?: string[]; }
    }) => {
      const response = await api.put(`/vehicle-assignment/return/${assignmentId}`, {
        returnDate,
        notes,
        returnVehicleCondition,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Vehicle returned successfully!');
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['vehicle-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to return vehicle');
    },
  });
};

// Hook for updating vehicle status
export const useUpdateVehicleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      vehicleId, 
      status, 
      notes, 
      returnVehicleCondition, 
      maintenanceDate, 
      damageDate 
    }: { 
      vehicleId: string; 
      status: 'available' | 'damaged' | 'maintenance'; 
      notes?: string; 
      returnVehicleCondition?: { description?: string; images?: string[]; videos?: string[]; }
      maintenanceDate?: Date;
      damageDate?: Date;
    }) => {
      const response = await api.put(`/vehicle-assignment/vehicle-status/${vehicleId}`, {
        status,
        notes,
        returnVehicleCondition,
        maintenanceDate,
        damageDate,
      });
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
