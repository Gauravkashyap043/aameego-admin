import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../services/api";
import type { CreateDocRemarkPayload } from "../types";

export const useCreateOrUpdateDocRemark = () => {
  return useMutation({
    mutationFn: async (data: CreateDocRemarkPayload) => {
      const res = await api.post("/doc-remark/createOrUpdate", data);
      return res.data;
    },
  });
};

export const useGetDocumentRemarks = () => {
  return useQuery({
    queryKey: ["documentRemarks"],
    queryFn: async () => {
      const res = await api.get("/document-remarks");
      return res.data;
    },
  });
};

export const useGetDocumentRemarkById = (id: string) => {
  return useQuery({
    queryKey: ["documentRemark", id],
    queryFn: async () => {
      const res = await api.get(`/document-remarks/${id}`);
      return res.data;
    },
    enabled: !!id, // only run if ID exists
  });
};

export const useUpdateDocumentRemark = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const res = await api.put(`/document-remarks/${id}`, data);
      return res.data;
    },
  });
};

export const useDeleteDocumentRemark = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/document-remarks/${id}`);
      return res.data;
    },
  });
};
