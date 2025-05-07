import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateScoreOnStudentService,
  CreateScoreOnSubjectService,
  DeleteScoreOnSubjectService,
  GetScoresOnStudentBySubjectIdService,
  GetScoresOnSubjectBySubjectIdService,
  RequestCreateScoreOnStudentService,
  RequestCreateScoreOnSubjectService,
  RequestDeleteScoreOnSubjectService,
  RequestGetScoresOnStudentBySubjectIdService,
  RequestUpdateScoreOnSubjectService,
  UpdateScoreOnSubjectService,
} from "../services";

import {
  ScoreOnStudent,
  ScoreOnSubject,
  StudentOnSubject,
} from "../interfaces";

export const scoretKey = {
  getScoreOnSubjectBySubjectId: (subjectId: string) => [
    "scoreOnSubjects",
    { subjectId: subjectId },
  ],
  getScoreOnStudentBySubjectId: (subjectId: string) => [
    "scoreOnStudents",
    { subjectId: subjectId },
  ],
} as const;

export function useGetScoreOnSubject({
  subjectId,
}: {
  subjectId: string;
}): UseQueryResult<ScoreOnSubject[], Error> {
  const scores = useQuery({
    queryKey: scoretKey.getScoreOnSubjectBySubjectId(subjectId),
    queryFn: () =>
      GetScoresOnSubjectBySubjectIdService({
        subjectId: subjectId,
      }),
  });
  return scores;
}

export function useCreateScoreOnSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["createScoreOnSubject"],
    mutationFn: (request: RequestCreateScoreOnSubjectService) =>
      CreateScoreOnSubjectService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["scoreOnSubjects", { subjectId: variables.subjectId }],
        (prev: ScoreOnSubject[]) => {
          return [...prev, data];
        }
      );
    },
  });
}

export function useUpdateScoreOnSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateScoreOnSubject"],
    mutationFn: (request: RequestUpdateScoreOnSubjectService) =>
      UpdateScoreOnSubjectService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        scoretKey.getScoreOnSubjectBySubjectId(data.subjectId),
        (prev: ScoreOnSubject[]) => {
          return prev.map((score) => {
            if (score.id === data.id) {
              return data;
            }
            return score;
          });
        }
      );
    },
  });
}

export function useGetScoreOnStudent(
  request: RequestGetScoresOnStudentBySubjectIdService
): UseQueryResult<ScoreOnStudent[], Error> {
  const scores = useQuery({
    queryKey: scoretKey.getScoreOnStudentBySubjectId(request.subjectId),
    queryFn: () => GetScoresOnStudentBySubjectIdService(request),
  });
  return scores;
}

export function useCreateScoreOnStudent() {
  const queryClient = useQueryClient();
  const createScoreOnStudent = useMutation({
    mutationKey: ["createScoreOnStudent"],
    mutationFn: (request: RequestCreateScoreOnStudentService) =>
      CreateScoreOnStudentService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        scoretKey.getScoreOnStudentBySubjectId(data.subjectId),
        (prev: ScoreOnStudent[]) => {
          return [...prev, data];
        }
      );
    },
  });

  return createScoreOnStudent;
}

export function useDeleteScoreOnSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-score-on-subject"],
    mutationFn: (request: RequestDeleteScoreOnSubjectService) =>
      DeleteScoreOnSubjectService(request),
    onSuccess(data, variables, context) {
      queryClient.setQueryData(
        ["scoreOnSubjects", { subjectId: data.subjectId }],
        (prev: ScoreOnSubject[]) => {
          return prev.filter((p) => p.id !== data.id);
        }
      );
      queryClient.refetchQueries({
        queryKey: scoretKey.getScoreOnStudentBySubjectId(data.subjectId),
      });
    },
  });
}
