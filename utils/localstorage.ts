import { FilterTitle } from "../components/common/Filter";
import { EducationYear } from "../interfaces";

export const localStorageGetRemoveRandomStudents = ({
  subjectId,
}: {
  subjectId: string;
}): { id: string }[] | null => {
  const studentIds: { id: string }[] | null = JSON.parse(
    localStorage.getItem(`remove-random:${subjectId}:students`) ?? "null",
  );

  return studentIds ?? [];
};

export const localStorageSetRemoveRandomStudents = ({
  studentIds,
  subjectId,
}: {
  studentIds: { id: string }[];
  subjectId: string;
}): void => {
  localStorage.setItem(
    `remove-random:${subjectId}:students`,
    JSON.stringify(studentIds),
  );
};

export const setSortStudentLocaStorage = (input: {
  subjectId: string;
  sort: {
    title: FilterTitle;
    orderBy: "asc" | "desc";
  };
}) => {
  localStorage.setItem(`sort_${input.subjectId}`, JSON.stringify(input.sort));
};

export const getSortStudentLocaStorage = (input: {
  subjectId: string;
}):
  | {
      title: FilterTitle;
      orderBy: "asc" | "desc";
    }
  | { title: "default" } => {
  const string = localStorage.getItem(`sort_${input.subjectId}`);

  if (string) {
    const response = JSON.parse(string);
    return response;
  }

  return { title: "default" };
};

export const removeSortStudentLocalStorage = (input: { subjectId: string }) => {
  localStorage.removeItem(`sort_${input.subjectId}`);
};

export function setDefaultSubjectFilter(input: {
  educationYear: EducationYear;
  userId: string;
  schoolId: string;
}) {
  localStorage.setItem(
    `defult_filter_subjects:${input.schoolId}`,
    JSON.stringify(input),
  );
}
export function getDefaultSubjectFilter(input: { schoolId: string }): {
  educationYear: EducationYear;
  userId: string;
  schoolId: string;
} | null {
  const rawData = localStorage.getItem(
    `defult_filter_subjects:${input.schoolId}`,
  );
  if (!rawData) return null;
  const data = JSON.parse(rawData) as {
    educationYear: EducationYear;
    userId: string;
    schoolId: string;
  };
  return data;
}

export type LocalStorageKeys = "language";

export function setLocalStorage(key: LocalStorageKeys, value: string) {
  localStorage.setItem(key, value);
}

export function getLocalStorage(key: LocalStorageKeys) {
  return localStorage.getItem(key);
}

export function removeLocalStorage(key: LocalStorageKeys) {
  localStorage.removeItem(key);
}
