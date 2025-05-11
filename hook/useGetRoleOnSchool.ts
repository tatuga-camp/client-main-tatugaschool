import { useEffect, useState } from "react";
import { MemberRole } from "../interfaces";
import { useGetMemberOnSchoolBySchool, useGetUser } from "../react-query";

export default function useGetRoleOnSchool(data: {
  schoolId: string;
}): MemberRole {
  const [role, setRole] = useState<MemberRole>("TEACHER");
  const user = useGetUser();
  const memberOnSchools = useGetMemberOnSchoolBySchool({
    schoolId: data.schoolId,
  });

  useEffect(() => {
    if (memberOnSchools.data && user.data) {
      const member = memberOnSchools.data.find(
        (m) => m.userId === user.data.id
      );

      if (!member) {
        return;
      }

      if (member) {
        setRole(member.role);
      }
    }
  }, [memberOnSchools.data, user.data]);

  return role;
}
