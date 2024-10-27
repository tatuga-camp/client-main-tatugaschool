import { MemberRole } from "../interfaces";

export const ListRoles: { title: MemberRole; describe: string }[] = [
  {
    title: "ADMIN",
    describe: "Full access to all features",
  },
  {
    title: "TEACHER",
    describe: "Can view and manage students, but cannot delete the subject",
  },
];
