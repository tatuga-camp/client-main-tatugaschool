export interface CommentOnAssignmentTeacher {
  id: string;
  createAt: Date;
  updateAt: Date;
  content: string;

  firstName: string;
  lastName: string;
  email: string;
  photo: string;
  phone: string;
  subjectId: string;
  userId: string;
  schoolId: string;
  studentOnAssignmentId: string;
}
