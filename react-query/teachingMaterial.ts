import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateTeachingMaterialService,
  GetDescriptionSuggestionTeachingMaterialService,
  GetTeachingMaterialByAiService,
  GetTeachingMaterialService,
  RequestCreateTeachingMaterialService,
  RequestGetDescriptionSuggestionTeachingMaterialService,
  RequestGetTeachingMaterialByAiService,
  RequestGetTeachingMaterialService,
  RequestUpdateTeachingMaterialService,
  RequestUpdateThumnailTeachingMaterialService,
  UpdateTeachingMaterialService,
  UpdateThumnailTeachingMaterialService,
} from "../services";
import {
  CreateFileOnTeachingMaterialService,
  DeleteFileOnTeachingMaterialService,
  RequestCreateFileOnTeachingMaterialService,
  RequestDeleteFileOnTeachingMaterialService,
} from "../services/file-on-teaching-material";

export const keyTeachingMaterial = {
  get: ["teaching-materials"],
  getById: (request: { id: string }) => [
    keyTeachingMaterial.get,
    { id: request.id },
  ],
  getByAI: (request: { search?: string }) => [
    keyTeachingMaterial.get[0],
    { ...request },
  ],
  thumnail: ["update-thumnail-teaching-material"],
  suggestion: ["get-suggestion"],
  create: ["create-teaching-material"],
  update: ["update-teaching-material"],
} as const;

export function useGetTeachingMaterialByAI(
  request: RequestGetTeachingMaterialByAiService,
) {
  return useQuery({
    queryKey: keyTeachingMaterial.getByAI(request),
    queryFn: () => GetTeachingMaterialByAiService(request),
  });
}

export function useGetTeachingMaterial(
  request: RequestGetTeachingMaterialService,
) {
  return useQuery({
    queryKey: keyTeachingMaterial.getById({ id: request.teachingMaterialId }),
    queryFn: () => GetTeachingMaterialService(request),
  });
}

export function useGetSuggestionTeachingMaterial() {
  return useMutation({
    mutationKey: keyTeachingMaterial.suggestion,
    mutationFn: (
      request: RequestGetDescriptionSuggestionTeachingMaterialService,
    ) => GetDescriptionSuggestionTeachingMaterialService(request),
  });
}

export function useUpdateThumnailTeachingMaterial() {
  return useMutation({
    mutationKey: keyTeachingMaterial.thumnail,
    mutationFn: (request: RequestUpdateThumnailTeachingMaterialService) =>
      UpdateThumnailTeachingMaterialService(request),
  });
}

export function useCreateTeachingMaterial() {
  return useMutation({
    mutationKey: keyTeachingMaterial.create,
    mutationFn: (request: RequestCreateTeachingMaterialService) =>
      CreateTeachingMaterialService(request),
  });
}

export function useUpdateTeachingMaterial() {
  return useMutation({
    mutationKey: keyTeachingMaterial.update,
    mutationFn: (request: RequestUpdateTeachingMaterialService) =>
      UpdateTeachingMaterialService(request),
  });
}

export const keyFileOnTeachingMaterial = {
  create: ["create-fileOnTeachingMaterial"],
  delete: ["delete-fileOnTeachingMaterial"],
} as const;

export function useCreateFileTeachingMareial() {
  return useMutation({
    mutationKey: keyFileOnTeachingMaterial.create,
    mutationFn: (request: RequestCreateFileOnTeachingMaterialService) =>
      CreateFileOnTeachingMaterialService(request),
  });
}

export function useDeleteFileTeachingMareial() {
  return useMutation({
    mutationKey: keyFileOnTeachingMaterial.create,
    mutationFn: (request: RequestDeleteFileOnTeachingMaterialService) =>
      DeleteFileOnTeachingMaterialService(request),
  });
}
