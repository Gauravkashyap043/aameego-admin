import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useVehicleAssignments(vehicleId?: string) {
  return useQuery({
    queryKey: ['vehicle-assignments', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];
      const res = await api.get(`/vehicle-assignment/vehicle/${vehicleId}`);
      return res.data.data;
    },
    enabled: !!vehicleId,
  });
}

export function useVehicleAssignmentsByNumber(vehicleNumber?: string) {
  return useQuery({
    queryKey: ['vehicle-assignments-by-number', vehicleNumber],
    queryFn: async () => {
      if (!vehicleNumber) return [];
      const res = await api.get(`/vehicle-assignment/vehicle-number/${vehicleNumber}`);
      return res.data.data;
    },
    enabled: !!vehicleNumber,
  });
}