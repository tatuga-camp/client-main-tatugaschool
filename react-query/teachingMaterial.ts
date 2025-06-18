import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  CreateTeachingMaterialService,
  GetDescriptionSuggestionTeachingMaterialService,
  GetTeachingMaterialByAiService,
  RequestCreateTeachingMaterialService,
  RequestGetDescriptionSuggestionTeachingMaterialService,
  RequestGetTeachingMaterialByAiService,
  RequestUpdateTeachingMaterialService,
  UpdateTeachingMaterialService,
} from "../services";
import {
  CreateFileOnTeachingMaterialService,
  DeleteFileOnTeachingMaterialService,
  RequestCreateFileOnTeachingMaterialService,
  RequestDeleteFileOnTeachingMaterialService,
} from "../services/file-on-teaching-material";

export const keyTeachingMaterial = {
  get: ["teaching-materials"],
  getByAI: (request: { search?: string }) => [
    keyTeachingMaterial.get[0],
    { ...request },
  ],
  suggestion: ["get-suggestion"],
  create: ["create-teaching-material"],
  update: ["update-teaching-material"],
} as const;

export function useGetTeachingMaterialCursor(
  request: RequestGetTeachingMaterialByAiService,
) {
  return useQuery({
    queryKey: keyTeachingMaterial.getByAI(request),
    queryFn: () => GetTeachingMaterialByAiService(request),
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
