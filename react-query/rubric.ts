import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateRubricService,
  DeleteRubricService,
  GenerateRubricDraftService,
  GetRubricBreakdownService,
  GetRubricByIdService,
  GetRubricsBySubjectService,
  GradeRubricService,
  RequestCreateRubricService,
  RequestDeleteRubricService,
  RequestGenerateRubricDraftService,
  RequestGradeRubricService,
  RequestUpdateRubricService,
  UpdateRubricService,
} from "../services";

export function useGetRubricsBySubject({ subjectId }: { subjectId: string }) {
  return useQuery({
    queryKey: ["rubrics", { subjectId }],
    queryFn: () => GetRubricsBySubjectService({ subjectId }),
    enabled: !!subjectId,
  });
}

export function useGetRubricById({ rubricId }: { rubricId: string }) {
  return useQuery({
    queryKey: ["rubric", { rubricId }],
    queryFn: () => GetRubricByIdService({ rubricId }),
    enabled: !!rubricId,
  });
}

export function useCreateRubric() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["create-rubric"],
    mutationFn: (req: RequestCreateRubricService) => CreateRubricService(req),
    onSuccess(data) {
      qc.invalidateQueries({
        queryKey: ["rubrics", { subjectId: data.subjectId }],
      });
    },
  });
}

export function useUpdateRubric() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["update-rubric"],
    mutationFn: (req: RequestUpdateRubricService) => UpdateRubricService(req),
    onSuccess(data) {
      qc.invalidateQueries({
        queryKey: ["rubrics", { subjectId: data.subjectId }],
      });
      qc.invalidateQueries({ queryKey: ["rubric", { rubricId: data.id }] });
    },
  });
}

export function useDeleteRubric() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["delete-rubric"],
    mutationFn: (req: RequestDeleteRubricService) => DeleteRubricService(req),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["rubrics"] });
    },
  });
}

export function useGradeRubric() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["grade-rubric"],
    mutationFn: (req: RequestGradeRubricService) => GradeRubricService(req),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["student-assignments"] });
      qc.invalidateQueries({ queryKey: ["rubric-breakdown"] });
    },
  });
}

export function useGetRubricBreakdown({
  studentOnAssignmentId,
}: {
  studentOnAssignmentId: string;
}) {
  return useQuery({
    queryKey: ["rubric-breakdown", { studentOnAssignmentId }],
    queryFn: () => GetRubricBreakdownService({ studentOnAssignmentId }),
    enabled: !!studentOnAssignmentId,
  });
}

export function useGenerateRubricDraft() {
  return useMutation({
    mutationKey: ["generate-rubric-draft"],
    mutationFn: (req: RequestGenerateRubricDraftService) =>
      GenerateRubricDraftService(req),
  });
}
