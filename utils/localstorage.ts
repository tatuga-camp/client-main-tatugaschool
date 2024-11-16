export const localStorageGetRemoveRandomStudents = ({
  subjectId,
}: {
  subjectId: string;
}): { id: string }[] | null => {
  const studentIds: { id: string }[] | null = JSON.parse(
    localStorage.getItem(`remove-random:${subjectId}:students`) ?? "null"
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
    JSON.stringify(studentIds)
  );
};
