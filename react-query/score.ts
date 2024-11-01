import {
  QueryClient,
  useMutation,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateScoreOnStudentService,
  GetScoresOnStudentBySubjectIdService,
  GetScoresOnSubjectBySubjectIdService,
  RequestCreateScoreOnStudentService,
  RequestGetScoresOnStudentBySubjectIdService,
} from "../services";

import {
  ScoreOnStudent,
  ScoreOnSubject,
  StudentOnSubject,
} from "../interfaces";
export function useGetScoreOnSubject({
  subjectId,
}: {
  subjectId: string;
}): UseQueryResult<ScoreOnSubject[], Error> {
  const scores = useQuery({
    queryKey: ["scoreOnSubject", { subjectId }],
    queryFn: () =>
      GetScoresOnSubjectBySubjectIdService({
        subjectId: subjectId,
      }),
  });
  return scores;
}

export function useGetScoreOnStudent(
  request: RequestGetScoresOnStudentBySubjectIdService
): UseQueryResult<ScoreOnStudent[], Error> {
  const scores = useQuery({
    queryKey: [
      "scoreOnStudents",
      {
        subjectId: request.subjectId,
      },
    ],
    queryFn: () => GetScoresOnStudentBySubjectIdService(request),
  });
  return scores;
}

export function useCreateScoreOnStudent() {
  const createScoreOnStudent = useMutation({
    mutationKey: ["createScoreOnStudent"],
    mutationFn: (request: {
      request: RequestCreateScoreOnStudentService;
      studentOnSubject: StudentOnSubject;
      totalScore: number;
      queryClient: QueryClient;
    }) => CreateScoreOnStudentService(request.request),
    onSuccess(data, variables, context) {
      const newScore: StudentOnSubject = {
        ...variables.studentOnSubject,
        totalSpeicalScore: variables.totalScore + data.score,
      };

      variables.queryClient.setQueryData(
        [
          "scoreOnStudents",
          { subjectId: variables.studentOnSubject.subjectId },
        ],
        (prev: ScoreOnStudent[]) => {
          return [...prev, data];
        }
      );

      variables.queryClient.setQueryData(
        [
          "studentOnSubjects",
          { subjectId: variables.studentOnSubject.subjectId },
        ],
        (
          prev: (StudentOnSubject & {
            scores: ScoreOnStudent[];
            totalScore: number;
          })[]
        ) => {
          const newData = prev?.map((student) => {
            if (student.id === newScore.id) {
              return newScore;
            }
            return student;
          });
          return newData;
        }
      );
    },
  });

  return createScoreOnStudent;
}
