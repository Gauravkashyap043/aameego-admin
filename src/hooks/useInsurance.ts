import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

export const useAddInsurance = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/insurance/with-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
}; 