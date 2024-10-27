import React from "react";
import Layout from "../../../components/layout/SubjectLayout";
import Head from "next/head";
import { useGetSubject, useGetTeacherOnSubject } from "../../../react-query";
import { GetServerSideProps } from "next";
import Subject from "../../../components/subject/Subject";
import Assignment from "../../../components/subject/Assignment";
import Grade from "../../../components/subject/Grade";
import Attendance from "../../../components/subject/Attendance";
import { Skeleton } from "primereact/skeleton";
import { CiCircleInfo } from "react-icons/ci";
import ListMemberCircle from "../../../components/member/ListMemberCircle";
import { ListMenuFooter } from "../../../components/subject/FooterSubject";
import Setting from "../../../components/subject/Setting";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { notFound } from "next/navigation";
import PopUpStudent from "../../../components/subject/PopUpStudent";
import { ScoreOnStudent, StudentOnSubject } from "../../../interfaces";
import useClickOutside from "../../../hook/useClickOutside";
import InviteTeacher from "../../../components/subject/InviteTeacher";
import { MenuSubject } from "../../../data";

type Props = {
  subjectId: string;
};

function Index({ subjectId }: Props) {
  const router = useRouter();
  const subject = useGetSubject({
    subjectId: subjectId,
  });
  const divRef = React.useRef<HTMLDivElement>(null);
  const inviteTeacherRef = React.useRef<HTMLDivElement>(null);
  const teacherOnSubjects = useGetTeacherOnSubject({
    subjectId: subjectId,
  });
  const [selectMenu, setSelectMenu] = React.useState<MenuSubject>("Subject");
  const [selectFooter, setSelectFooter] =
    React.useState<ListMenuFooter>("EMTY");
  const [selectStudent, setSelectStudent] = React.useState<StudentOnSubject>();
  const [triggerInviteTeacher, setTriggerInviteTeacher] = React.useState(false);

  useClickOutside(divRef, () => {
    setSelectStudent(() => undefined);
  });

  useClickOutside(inviteTeacherRef, () => {
    setTriggerInviteTeacher(() => false);
  });

  if (subject.isError) {
    Swal.fire({
      title: "Error",
      text: "Subject not found",
      icon: "error",
    });
    router.push("/404");
  }

  return (
    <>
      <Head>
        <title>Subject: {subject.data?.title}</title>
      </Head>
      <Layout
        setSelectFooter={setSelectFooter}
        selectFooter={selectFooter}
        subject={subject}
        setSelectMenu={
          setSelectMenu as React.Dispatch<React.SetStateAction<string>>
        }
        selectMenu={selectMenu}
      >
        {triggerInviteTeacher && (
          <div
            className="w-screen z-40 h-screen flex items-center 
        justify-center fixed top-0 right-0 left-0 bottom-0 m-auto"
          >
            <div className="  border rounded-md" ref={inviteTeacherRef}>
              <InviteTeacher
                setTrigger={setTriggerInviteTeacher}
                subjectId={subjectId}
              />
            </div>
            <div className="w-screen -z-10 h-screen bg-white/50 backdrop-blur  fixed top-0 right-0 left-0 bottom-0 m-auto"></div>
          </div>
        )}
        {selectStudent && (
          <div
            className="fixed top-0 z-40 right-0 left-0 bottom-0 m-auto
         w-screen h-screen flex items-center justify-center"
          >
            <div className="" ref={divRef}>
              <PopUpStudent student={selectStudent} />
            </div>
            <div
              className="w-screen h-screen fixed top-0 bg-white/20 backdrop-blur
           -z-10 right-0 left-0 bottom-0 m-auto "
            ></div>
          </div>
        )}
        <header className="w-full p-10 flex items-center justify-center">
          <section className="w-8/12 h-60 flex justify-between p-5 shadow-inner gradient-bg  rounded-md">
            <div className="flex h-full justify-end flex-col gap-1">
              <h1 className="text-lg font-semibold w-8/12 min-w-96 line-clamp-2 text-white">
                {subject.data ? subject.data?.title : "Loading..."}
              </h1>
              <p className="text-lg text-white">
                {subject.data ? subject.data?.description : "Loading..."}
              </p>
              <div className="bg-white w-max px-2 py-1 rounded-md">
                <h2 className="text-xs text-primary-color">
                  Academic year:{" "}
                  {subject.data
                    ? new Date(subject.data?.educationYear).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                        }
                      )
                    : "Loading..."}
                </h2>
              </div>
            </div>
            <div className="h-full flex flex-col justify-between">
              <button
                onClick={() => setSelectMenu("Setting Subject")}
                className="flex items-center active:scale-110 justify-center gap-1 hover:bg-primary-color hover:text-white
               text-primary-color bg-white w-max px-2 py-1 rounded-md"
              >
                <CiCircleInfo />
                More Info & Edit
              </button>
              {teacherOnSubjects.data ? (
                <ListMemberCircle
                  setTrigger={setTriggerInviteTeacher}
                  members={teacherOnSubjects.data}
                />
              ) : (
                "Loading..."
              )}
            </div>
          </section>
        </header>
        <main className="">
          {selectMenu === "Subject" && (
            <Subject
              setSelectStudent={setSelectStudent}
              subjectId={subjectId}
            />
          )}{" "}
          {selectMenu === "Assignment" && <Assignment />}
          {selectMenu === "Grade" && <Grade />}
          {selectMenu === "Attendance" && <Attendance />}
          {selectMenu === "Setting Subject" && <Setting />}
        </main>
        <footer
          className="h-96
        "
        ></footer>
      </Layout>
    </>
  );
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const params = ctx.params;

  if (!params?.subjectId) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      subjectId: params.subjectId,
    },
  };
};
