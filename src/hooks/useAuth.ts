import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: { identifier: string; method: string }) => {
      const res = await api.post('/auth/register', data);
      return res.data;
    },
  });
};

export const useVerifyUser = () => {
  return useMutation({
    mutationFn: async (data: { identifier: string; method: string; otp: { code: string } }) => {
      const res = await api.post('/auth/verifyUser', data);
      return res.data;
    },
  });
};

export const useAdminLogin = () => {
  return useMutation({
    mutationFn: async (data: { identifier: string; otp: string }) => {
      const res = await api.post('/auth/login-admin', data);
      return res.data;
    },
  });
}; 