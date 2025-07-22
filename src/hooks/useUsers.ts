import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  profileCode: string;
  isActive: boolean;
  isVerified: boolean;
  profilePicture: string;
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
}

interface UsersResponse {
  riders: User[];
  supervisors: User[];
  total: {
    riders: number;
    supervisors: number;
  };
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