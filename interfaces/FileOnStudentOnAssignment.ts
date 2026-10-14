export interface FileOnStudentOnAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  type: string;
  body: string;
  contentType: StudentAssignmentContentType;
  assignmentId: string;
  name: string | null;
  size: number;
  subjectId: string;
  schoolId: string;
  studentOnAssignmentId: string;
}

export type StudentAssignmentContentType = "FILE" | "TEXT" | "LINK";

// Links were stored as FILE + type "link-url" before contentType LINK existed.
export const isLinkFile = (
  file: Pick<FileOnStudentOnAssignment, "contentType" | "type">,
) => file.contentType === "LINK" || file.type === "link-url";
