export interface FileOnAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  type: string;
  url: string;
  name: string | null;
  size: number;
  subjectId: string;
  schoolId: string;
  blurHash?: string | null | undefined;
  assignmentId: string;
  preventFastForward?: boolean;
}
