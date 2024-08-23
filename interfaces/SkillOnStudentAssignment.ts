export interface SkillOnStudentAssignment {
  id: string;
  createAt: Date;
  updateAt: Date;
  weight: number;
  subjectId: string;

  skillId: string;

  studentOnAssignmentId: string;
}
