import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  profileCode: string;
  isActive: boolean;
  isVerified: boolean;
  profilePicture: string;
  status: string;
  role: {
    _id: string;
    roleName: string;
    permissions: string[];
  };
  authRef: {
    identifier: string;
    status: string;
    lastLoginAt: string;
  };
  assignedSupervisor?: {
    _id: string;
    name: string;
    profileCode: string;
    authRef: {
      identifier: string;
    };
    assignedAt: string;
  } | null;
  // Document fields for riders
  document?: {
    aadhaar?: {
      ocrFront?: {
        aadhaarNumber?: string;
      };
    };
    drivingLicense?: {
      ocrFront?: {
        drivingLicenseNumber?: string;
      };
    };
  };
  addressRef?: {
    address?: string;
    cityDistrict?: string;
    state?: string;
    pinCode?: string;
  };
  dob?: string;
  createdAt?: string;
}

interface UsersResponse {
  riders: User[];
  supervisors: User[];
  total: {
    riders: number;
    supervisors: number;
  };
}

interface PaginatedUsersResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  role: string;
}

interface UseUsersByRoleParams {
  role: 'rider' | 'supervisor';
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const useRidersAndSupervisors = () => {
  return useQuery<UsersResponse>({
    queryKey: ['users', 'riders-supervisors'],
    queryFn: async () => {
      const response = await api.get('/user/riders-supervisors');
      return response.data.data;
    },
  });
};

export const useUsersByRole = ({ role, page = 1, limit = 10, search = '', status }: UseUsersByRoleParams) => {
  return useQuery<PaginatedUsersResponse>({
    queryKey: ['users', 'by-role', role, page, limit, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        role,
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }

      if (status && status !== 'All') {
        params.append('status', status);
      }

      const response = await api.get(`/user/users?${params.toString()}`);
      return response.data.data;
    },
    staleTime: 30000,
  });
}; 