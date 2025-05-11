import { useEffect, useState } from "react";
import { MemberRole } from "../interfaces";
import { useGetTeacherOnSubject, useGetUser } from "../react-query";

export default function useGetRoleOnSubject(data: {
  subjectId: string;
}): MemberRole {
  const [role, setRole] = useState<MemberRole>("TEACHER");
  const user = useGetUser();
  const teacherOnSubjects = useGetTeacherOnSubject({
    subjectId: data.subjectId,
  });

  useEffect(() => {
    if (teacherOnSubjects.data && user.data) {
      const member = teacherOnSubjects.data.find(
        (m) => m.userId === user.data.id
      );

      if (!member) {
        return;
      }

      if (member) {
        setRole(member.role);
      }
    }
  }, [teacherOnSubjects.data, user.data]);

  return role;
}
