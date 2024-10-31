import React, { useEffect } from "react";
import Switch from "../common/Switch";
import ListMembers from "../member/ListMembers";
import {
  getStudentOnSubject,
  useGetSubject,
  useGetTeacherOnSubject,
  useGetUser,
} from "../../react-query";
import { MemberRole } from "../../interfaces";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import Link from "next/link";

type Props = {
  subjectId: string;
};
function Setting({ subjectId }: Props) {
  const teacherOnSubjects = useGetTeacherOnSubject({
    subjectId: subjectId,
  });
  const user = useGetUser();
  const studentOnSubjects = getStudentOnSubject({
    subjectId: subjectId,
  });
  const subject = useGetSubject({
    subjectId: subjectId,
  });
  const [members, setMembers] = React.useState<
    {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      photo: string;
      isInvite: boolean;
      role: MemberRole;
      userId: string;
      isLoading: boolean;
    }[]
  >();

  useEffect(() => {
    if (teacherOnSubjects.data) {
      setMembers(
        teacherOnSubjects.data.map((teacher) => {
          return {
            id: teacher.id,
            email: teacher.email,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            photo: teacher.photo,
            isInvite: true,
            isLoading: false,
            role: teacher.role,
            userId: teacher.userId,
          };
        })
      );
    }
  }, [teacherOnSubjects.data]);

  return (
    <main className="flex flex-col items-center w-full gap-5">
      <section className="w-8/12">
        <h1 className="text-xl font-medium">General Settings</h1>
        <h4 className="text-sm text-gray-500">Manage your general settings</h4>

        <div className="flex flex-col p-4 min-h-80 bg-white rounded-md border gap-5 mt-5">
          <h2 className="border-b text-lg font-medium py-3">
            Subject Infomation
          </h2>
          <div className="grid grid-cols-1 w-full">
            <div className="grid grid-cols-1  bg-gray-200/20 gap-5  p-2 py-4">
              <label className="w-full grid grid-cols-2 gap-10">
                <span className="text-base text-black">Subject ID:</span>
                <Link
                  target="_blank"
                  href={`/subject/${subject.data?.id}`}
                  className="text-base font-semibold underline  text-blue-600"
                >
                  {subject.data?.id}
                </Link>
              </label>
            </div>
            <div className="grid grid-cols-1  gap-5  p-2 py-4">
              <label className="w-full grid grid-cols-2 gap-10">
                <span className="text-base text-black">
                  The Subject Connect To Class ID:
                </span>
                <Link
                  target="_blank"
                  href={`/class/${subject.data?.classId}`}
                  className="text-base font-semibold underline  text-blue-600"
                >
                  {subject.data?.classId}
                </Link>
              </label>
            </div>
            <div className="grid grid-cols-1  bg-gray-200/20 gap-5  p-2 py-4">
              <label className="w-full items-center grid grid-cols-2 gap-10">
                <span className="text-base text-black">Subject Name:</span>
                <input
                  type="text"
                  placeholder="Subject Name"
                  className="main-input"
                />
              </label>
            </div>
            <div className="grid grid-cols-1   gap-5  p-2 py-4">
              <label className="w-full items-center grid grid-cols-2 gap-10">
                <span className="text-base text-black">Description:</span>
                <input
                  type="text"
                  placeholder="Description"
                  className="main-input"
                />
              </label>
            </div>
            <div className="grid grid-cols-1  bg-gray-200/20 gap-5  p-2 py-4">
              <label className="w-full items-center grid grid-cols-2 gap-10">
                <span className="text-base text-black">Subject Code:</span>
                <input
                  type="text"
                  placeholder="Subject Code"
                  className="main-input"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-col p-4 min-h-80 bg-white rounded-md border gap-5 mt-5">
          <h2 className="border-b text-lg font-medium py-3">
            Subject Permission
          </h2>
          <div className="grid grid-cols-1 ">
            <div className="grid grid-cols-1 p-2 py-4">
              <label className="w-full grid grid-cols-2 gap-10">
                <span className="text-base text-black">
                  Allow Student To Delete Their Work:
                </span>
                <Switch checked setChecked={(data) => console.log(data)} />
              </label>
            </div>
            <div className="grid grid-cols-1 bg-gray-200/20 gap-5  p-2 py-4">
              <label className="w-full grid grid-cols-2 gap-10">
                <span className="text-base text-black">
                  Allow Student To View Overall Score:
                </span>
                <Switch checked setChecked={(data) => console.log(data)} />
              </label>
            </div>
            <div className="grid grid-cols-1  gap-5  p-2 py-4">
              <label className="w-full grid grid-cols-2 gap-10">
                <span className="text-base text-black">
                  Allow Student To View Grade:
                </span>
                <Switch checked setChecked={(data) => console.log(data)} />
              </label>
            </div>
            <div className="grid grid-cols-1 bg-gray-200/20 gap-5  p-2 py-4">
              <label className="w-full grid grid-cols-2 gap-10">
                <span className="text-base text-black">
                  Allow Student To View Attendance Record:
                </span>
                <Switch checked setChecked={(data) => console.log(data)} />
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-col p-4 min-h-80 bg-white rounded-md border gap-5 mt-5">
          <h2 className="border-b text-lg font-medium py-3">
            Manage Co-Teacher
          </h2>
          {members && teacherOnSubjects.data && user.data && (
            <ListMembers
              members={members}
              listMembers={teacherOnSubjects.data}
              user={user.data}
              allowRemove={true}
              onRoleChange={(data) => console.log(data)}
              handleSummit={(data) => console.log(data)}
            />
          )}
        </div>

        <h1 className="text-xl font-medium mt-10">Students Setting</h1>
        <h4 className="text-sm text-gray-500">
          Manage Students / Import Student Here
        </h4>

        <div className="flex flex-col p-4 min-h-80 bg-white rounded-md border gap-5 mt-5">
          <h2 className="border-b text-lg font-medium py-3">
            Student Lists On The Subject
          </h2>
          <h4 className="text-sm text-gray-500">
            You cannot add student from another class to this subject. Once you
            create subject and add a class to this subject, the student will be
            automatically added to this subject. You can only disable a student
            from this subject not delete them.
          </h4>
          <ul className="grid grid-cols-1">
            {studentOnSubjects.data
              ?.sort(
                (a, b) =>
                  a.number.localeCompare(a.number) -
                  b.number.localeCompare(b.number)
              )
              .map((student, index) => {
                const odd = index % 2 === 0;
                return (
                  <li
                    key={student.id}
                    className={`flex justify-between py-2  items-center ${
                      odd && "bg-gray-200/20"
                    } gap-2`}
                  >
                    <div className="flex gap-2">
                      <div className="w-10 h-10 relative rounded-md ring-1  overflow-hidden">
                        <Image
                          src="/favicon.ico"
                          alt={student.firstName}
                          fill
                          placeholder="blur"
                          blurDataURL={decodeBlurhashToCanvas(
                            student.blurHash ?? defaultBlurHash
                          )}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h1 className="text-sm font-semibold">
                          {student.firstName} {student.lastName}
                        </h1>
                        <p className="text-xs text-gray-500">
                          Number {student.number}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Switch checked setChecked={(e) => console.log(e)} />
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>

        <h1 className="text-xl font-medium mt-10">Danger zone</h1>
        <h4 className="text-sm text-gray-500">
          Irreversible and destructive actions
        </h4>
        <div className="flex flex-col items-start p-4  bg-white rounded-md border gap-5 mt-5">
          <h2 className="border-b text-lg font-medium py-3">
            Delete This Subject
          </h2>
          <h4 className="text-sm text-red-700">
            Once you delete this subject, all data will be lost and cannot be
            recovered. Please be careful.
          </h4>
          <button className="reject-button mt-5">Delete This Subject</button>
        </div>
      </section>
    </main>
  );
}

export default Setting;
