import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  GetScoresOnStudentBySubjectIdService,
  GetScoresOnSubjectBySubjectIdService,
  RequestGetScoresOnStudentBySubjectIdService,
} from "../services";
import { ScoreOnStudent, ScoreOnSubject } from "../interfaces";

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