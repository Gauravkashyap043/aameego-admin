import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useFetchList<T = any>(endpoint: string, queryKey?: string) {
  return useQuery<T[], Error>({
    queryKey: [queryKey || endpoint],
    queryFn: async () => {
      const res = await api.get(endpoint);
      return res.data.data;
    },
  });
} 