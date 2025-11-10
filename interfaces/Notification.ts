export type Notification = {
  id: string;
  createAt: Date;
  schoolId: string;
  subjectId: string;
  userId: string;
  link: string;
  type: "STUDENT_SUBMISSION";
  actorName: string;
  actorId: string;
  actorImage: string;
  message: string;
  isRead: boolean;
};
