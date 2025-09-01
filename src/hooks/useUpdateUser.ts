import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Types for personal details update
interface UpdateUserPersonalDetailsData {
  fullName?: string;
  dob?: string;
  gender?: string;
  fatherName?: string;
  businessPartnerRef?: string;
  address?: {
    address: string;
    cityDistrict: string;
    pinCode: string;
    state?: string;
  };
}

// Types for document update
interface UpdateDocumentVariables {
  userId: string;
  formData: FormData;
}

// Types for status update
type UserStatus = 'pending' | 'verified' | 'deactived' | 'rejected';

interface UpdateUserStatusData {
  status: UserStatus;
}

// Hook for updating user personal details
export function useUpdateUserPersonalDetails() {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { userId: string; data: UpdateUserPersonalDetailsData }
  >({
    mutationFn: async ({ userId, data }) => {
      const response = await api.put(`/user/${userId}/updatePersonalDeatils`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook for updating documents
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UpdateDocumentVariables>({
    mutationFn: async ({ userId, formData }) => {
      const response = await api.put(`/document/user/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook for updating user status
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { userId: string; data: UpdateUserStatusData }
  >({
    mutationFn: async ({ userId, data }) => {
      const response = await api.put(`/user/${userId}/status`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook for updating profile picture
export function useUpdateProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { userId: string; profilePictureUrl: string }
  >({
    mutationFn: async ({ userId, profilePictureUrl }) => {
      const response = await api.put(`/user/${userId}/profile-picture`, {
        profilePictureUrl,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook for uploading profile picture
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { userId: string; file: File }
  >({
    mutationFn: async ({ userId, file }) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await api.put(`/user/${userId}/upload-profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
} 