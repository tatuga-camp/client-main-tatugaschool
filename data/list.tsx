import { ReactNode } from "react";
import { MemberRole } from "../interfaces";
import { LuSchool } from "react-icons/lu";
import { SiGoogleclassroom } from "react-icons/si";
import { MdAssignmentAdd } from "react-icons/md";
import { FaStarHalfStroke, FaUserGroup } from "react-icons/fa6";
import { CiSettings } from "react-icons/ci";
import { BsPeopleFill } from "react-icons/bs";
import { PiWechatLogoBold } from "react-icons/pi";
import { IoHome } from "react-icons/io5";

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

export type MenuSubject =
  | "School"
  | "Subject"
  | "Classwork"
  | "Attendance"
  | "Grade"
  | "Setting-Subject";

export const menuSubjectList = ({
  schoolId,
  subjectId,
}: {
  schoolId?: string;
  subjectId?: string;
}): {
  title: MenuSubject;
  icon: ReactNode;
  url?: string | undefined;
}[] => {
  return [
    {
      title: "School",
      icon: <LuSchool />,
      url: `/school/${schoolId}`,
    },
    {
      title: "Subject",
      icon: <SiGoogleclassroom />,
    },
    {
      title: "Classwork",
      icon: <MdAssignmentAdd />,
    },
    {
      title: "Attendance",
      icon: <FaUserGroup />,
    },
    {
      title: "Grade",
      icon: <FaStarHalfStroke />,
    },
    {
      title: "Setting-Subject",
      icon: <CiSettings />,
    },
  ];
};

export type MenuSchool =
  | "School"
  | "Classes"
  | "Teams"
  | "Homepage"
  | "Subjects";
export const menuSchoolList = ({
  schoolId,
  subjectId,
}: {
  schoolId?: string;
  subjectId?: string;
}): {
  title: MenuSchool;
  icon: ReactNode;
  url?: string | undefined;
}[] => {
  return [
    {
      title: "School",
      icon: <LuSchool />,
    },
    {
      title: "Classes",
      icon: <BsPeopleFill />,
    },
    {
      title: "Subjects",
      icon: <SiGoogleclassroom />,
    },
    {
      title: "Homepage",
      icon: <IoHome />,
      url: "/",
    },
  ];
};

export type MenuClassroom = "Classroom" | "Setting-Classroom" | "School";
export const menuClassroomList = ({
  schoolId,
}: {
  schoolId: string;
}): {
  title: MenuClassroom;
  icon: ReactNode;
  url?: string | undefined;
}[] => {
  return [
    {
      title: "Classroom",
      icon: <SiGoogleclassroom />,
    },
    {
      title: "Setting-Classroom",
      icon: <CiSettings />,
    },
    {
      title: "School",
      icon: <LuSchool />,
      url: `/school/${schoolId}?menu=Classes`,
    },
  ];
};

export const sortByOptions = [
  {
    title: "Default",
  },
  {
    title: "Newest",
  },
  {
    title: "Oldest",
  },
  {
    title: "A-Z",
  },
  {
    title: "Z-A",
  },
] as const;
export type SortByOption = (typeof sortByOptions)[number]["title"];
