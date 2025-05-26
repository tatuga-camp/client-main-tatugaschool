import { ReactNode } from "react";
import { BsPeopleFill } from "react-icons/bs";
import { CiSettings } from "react-icons/ci";
import { FaStarHalfStroke, FaUserGroup } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";
import { LuSchool } from "react-icons/lu";
import {
  MdAssignmentAdd,
  MdGridView,
  MdSettings,
  MdSubscriptions,
} from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import { TbReportAnalytics } from "react-icons/tb";
import { MemberRole } from "../interfaces";

export const ListSubjectRoles: { title: MemberRole; describe: string }[] = [
  {
    title: "ADMIN",
    describe: "Full access to all features",
  },
  {
    title: "TEACHER",
    describe: "Can view and manage students, but cannot delete the subject",
  },
];

export const ListSchoolRoles: { title: MemberRole; describe: string }[] = [
  {
    title: "ADMIN",
    describe: "Full access to all features",
  },
  {
    title: "TEACHER",
    describe: "Can view and manage students, but cannot delete the school",
  },
];

export type MenuSubject =
  | "School"
  | "Subject"
  | "Classwork"
  | "Attendance"
  | "Grade"
  | "SettingSubject"
  | "Subjects";

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
      title: "SettingSubject",
      icon: <CiSettings />,
    },
    {
      title: "Subjects",
      icon: <MdGridView />,
      url: `/school/${schoolId}?menu=Subjects`,
    },
    {
      title: "School",
      icon: <LuSchool />,
      url: `/school/${schoolId}?menu=School`,
    },
  ];
};

export type MenuSchool =
  | "School"
  | "Classes"
  | "Teams"
  | "Homepage"
  | "Subjects"
  | "Setting"
  | "Subscription";
export const menuSchoolList = (): {
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
      title: "Setting",
      icon: <MdSettings />,
    },
    {
      title: "Subscription",
      icon: <MdSubscriptions />,
    },
    {
      title: "Homepage",
      icon: <IoHome />,
      url: "/",
    },
  ];
};

export type MenuClassroom =
  | "Classroom"
  | "SettingClassroom"
  | "GradesSummary"
  | "OverViewClassroom"
  | "School"
  | "Subjects";
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
      title: "GradesSummary",
      icon: <TbReportAnalytics />,
    },
    {
      title: "SettingClassroom",
      icon: <CiSettings />,
    },
    {
      title: "Subjects",
      icon: <MdGridView />,
      url: `/school/${schoolId}?menu=Classes`,
    },
    {
      title: "School",
      icon: <LuSchool />,
      url: `/school/${schoolId}?menu=School`,
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
    title: "AZ",
  },
  {
    title: "ZA",
  },
] as const;
export type SortByOption = (typeof sortByOptions)[number]["title"];
