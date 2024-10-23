import React from "react";
import Layout from "../../../components/layout/SubjectLayout";
import Head from "next/head";
import { getSubject, getTeacherOnSubject } from "../../../react-query";
import { GetServerSideProps } from "next";
import { MenuSubject } from "../../../components/subject/SubjectSidebar";
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

type Props = {
  subjectId: string;
};
function Index({ subjectId }: Props) {
  const router = useRouter();
  const subject = getSubject({
    subjectId: subjectId,
  });
  const teacherOnSubjects = getTeacherOnSubject({
    subjectId: subjectId,
  });
  const [selectMenu, setSelectMenu] = React.useState<MenuSubject>("Subject");
  const [selectFooter, setSelectFooter] =
    React.useState<ListMenuFooter>("EMTY");

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
        setSelectMenu={setSelectMenu}
        selectMenu={selectMenu}
      >
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
                <ListMemberCircle teacherOnSubjects={teacherOnSubjects.data} />
              ) : (
                "Loading..."
              )}
            </div>
          </section>
        </header>
        <main className="w-full h-full flex justify-center">
          {selectMenu === "Subject" && <Subject subjectId={subjectId} />}{" "}
          {selectMenu === "Assignment" && <Assignment />}
          {selectMenu === "Grade" && <Grade />}
          {selectMenu === "Attendance" && <Attendance />}
          {selectMenu === "Setting Subject" && <Setting />}
        </main>
        <footer className="h-96"></footer>
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
