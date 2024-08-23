export interface MemberOnTeam {
  id: string;
  createAt: Date;
  updateAt: Date;

  firstName: string;
  lastName: string;
  email: string;
  photo: string;
  phone: string;
  userId: string;
  memberOnSchoolId: string;
  teamId: string;
  schoolId: string;
}
