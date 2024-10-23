import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  ScoreOnStudent,
  StudentOnSubject,
  Subject,
  TeacherOnSubject,
} from "../interfaces";
import {
  GetScoresByStudentOnSubjectIdService,
  GetStudentOnSubjectBySubjectService,
  GetSubjectByIdService,
  GetTeacherOnSubjectBySubjectService,
} from "../services";

export function getSubject({
  subjectId,
}: {
  subjectId: string;
}): UseQueryResult<Subject, Error> {
  const schools = useQuery({
    queryKey: ["subject", { id: subjectId }],
    queryFn: () =>
      GetSubjectByIdService({
        subjectId: subjectId,
      }),
  });
  return schools;
}

export function getTeacherOnSubject({
  subjectId,
}: {
  subjectId: string;
}): UseQueryResult<TeacherOnSubject[], Error> {
  const teachers = useQuery({
    queryKey: ["teacherOnSubject", { subjectId: subjectId }],
    queryFn: () =>
      GetTeacherOnSubjectBySubjectService({
        subjectId: subjectId,
      }),
  });
  return teachers;
}

export function getStudentOnSubject({
  subjectId,
}: {
  subjectId: string;
}): UseQueryResult<
  (StudentOnSubject & {
    scores: ScoreOnStudent[];
    totalScore: number;
  })[],
  Error
> {
  const students = useQuery({
    queryKey: ["studentOnSubject", { subjectId: subjectId }],
    queryFn: () =>
      GetStudentOnSubjectBySubjectService({
        subjectId: subjectId,
      }),
  });
  return students;
}
