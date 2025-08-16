import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface BusinessPartner {
  _id: string;
  name: string;
  type: 'blinkit' | 'zomato' | 'swiggy' | 'independent';
  code: string;
  description?: string;
  isActive: boolean;
  commissionRate: number;
}

interface BusinessPartnersResponse {
  success: boolean;
  data: BusinessPartner[];
}

export function useFetchBusinessPartners() {
  return useQuery<BusinessPartnersResponse>({
    queryKey: ['business-partners'],
    queryFn: async () => {
      const response = await api.get('/business-partner');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
