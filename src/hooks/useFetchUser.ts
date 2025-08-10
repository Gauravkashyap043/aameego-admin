import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useFetchUser(userId?: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await api.get(`/user/${userId}`);
      return res.data.data;
    },
    enabled: !!userId,
  });
}
