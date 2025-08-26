import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../services/api";
import API_ENDPOINTS from "../constants/apiEndpoints";
import type { Vehicle } from "../types";
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
      const res = await api.post("/vehicle", data);
      return res.data;
    },
  });
};

export const useVehicleList = (
  page = 1,
  limit = 10,
  search?: string,
  rented?: string,
  status?: string
) => {
  return useQuery<VehiclePage>({
    queryKey: ["vehicleList", page, limit, search ?? "", rented ?? "", status ?? ""],
    queryFn: async () => {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (rented) params.rented = rented;
      if (status) params.status = status;
      const res = await api.get("/vehicle", { params });
      return res.data.data as VehiclePage;
    },
  });
};

export const useAllVehicles = (search?: string, rented?: string, options?: { enabled?: boolean; retry?: number; retryDelay?: number }) => {
  return useQuery({
    queryKey: ["allVehicles", search ?? "", rented ?? ""],
    queryFn: async () => {
      const params: any = {};
      if (search) params.search = search;
      if (rented) params.rented = rented;
      const res = await api.get("/vehicle/qr-generation", { params });
      return res.data.data as any[];
    },
    enabled: options?.enabled ?? true,
    retry: options?.retry ?? 2,
    retryDelay: options?.retryDelay ?? 1000,
  });
};

export const useUpdateVehicle = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/vehicle/${id}`, data);
      return res.data;
    },
  });
};

export const useAvailableVehicles = () => {
  return useQuery({
    queryKey: ["availableVehicles"],
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.GET_AVAILABLE_VEHICLES);

      console.log("Available Vehicles:", res.data);
      return res.data.data as Vehicle[];
    },
    enabled: false,
  });
};

export const useMaintenanceVehicles = (
  page = 1,
  limit = 10,
  search?: string
) => {
  return useQuery<VehiclePage>({
    queryKey: ["maintenanceVehicles", page, limit, search ?? ""],
    queryFn: async () => {
      const params: any = { page, limit };
      if (search) params.search = search;
      const res = await api.get("/vehicle/maintenance", { params });
      return res.data.data as VehiclePage;
    },
  });
};
