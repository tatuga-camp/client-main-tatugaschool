import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import React from "react";
import { CiCircleInfo } from "react-icons/ci";
import { FaUsers } from "react-icons/fa6";
import ClassroomSetting from "../../components/classroom/ClassroomSetting";
import GradeSummaryReport from "../../components/classroom/GradeSummaryReport";
import StudentSection from "../../components/classroom/StudentLists";
import ClassroomLayout from "../../components/layout/ClassroomLayout";
import { MenuClassroom } from "../../data";
import { classroomDataLanguage } from "../../data/languages";
import { useGetClassroom, useGetLanguage } from "../../react-query";
import { getRefetchtoken, timeAgo, validateMongodbId } from "../../utils";

function Index({ classroomId }: { classroomId: string }) {
  const toast = React.useRef<Toast>(null);
  const language = useGetLanguage();
  const router = useRouter();
  const selectMenu = (router.query.menu as MenuClassroom) || "Classroom";

  const classroom = useGetClassroom({
    classId: classroomId,
  });

  if (classroom.isLoading || !classroom.data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ProgressSpinner />
      </div>
    );
  }

  const dateMonth = new Date(classroom.data.createAt).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <>
      <Head>
        <title>Classroom</title>
      </Head>
      <Toast ref={toast} />

      <ClassroomLayout
        classroomId={classroomId}
        schoolId={classroom.data?.schoolId}
      >
        <header
          className={`flex flex-col p-12 pb-20 text-white ${
            classroom.data.isAchieved ? "gradient-bg-success" : "gradient-bg"
          } `}
        >
          {/* Top Section */}
          <div className="flex gap-2">
            <div className="mb-5 flex w-max items-center justify-center gap-1 rounded-full border border-white px-2 py-1 text-xs text-white">
              {classroomDataLanguage.title(language.data ?? "en")}
            </div>
            {classroom.data.isAchieved && (
              <div className="mb-5 flex w-max items-center justify-center gap-1 rounded-full border border-white px-2 py-1 text-xs text-white">
                {classroomDataLanguage.achieved(language.data ?? "en")}
              </div>
            )}
          </div>

          <div className="flex w-full items-start justify-between">
            <div className="w-max border-b border-b-white pb-2">
              <h1 className="max-w-[60rem] break-words text-4xl font-bold">
                ชั้นเรียน - {classroom.data.title}{" "}
              </h1>
              <p className="text-xl">{classroom.data.level}</p>
              <p className="max-w-[60rem] break-words text-gray-300">
                {classroom.data.description}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  router.replace({
                    query: {
                      ...router.query,
                      menu: "SettingClassroom",
                    },
                  });
                }}
                className="flex w-max items-center justify-center gap-1 rounded-2xl bg-white px-2 py-1 text-primary-color hover:bg-primary-color hover:text-white active:scale-110"
              >
                <CiCircleInfo />
                {classroomDataLanguage.info(language.data ?? "en")}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-5">
            <div className="flex w-max items-center justify-center gap-1 rounded-full border bg-white px-2 py-1 text-black">
              <FaUsers />
              <span className="text-xs">
                {classroom.data.students.length}{" "}
                {classroomDataLanguage.student(language.data ?? "en")}
              </span>
            </div>
            <div className="flex w-max items-center justify-center gap-1 rounded-full border bg-white px-2 py-1 text-xs text-black">
              {classroomDataLanguage.createAt(language.data ?? "en")}:{" "}
              {dateMonth}
            </div>
            <div className="flex w-max items-center justify-center gap-1 rounded-full border bg-white px-2 py-1 text-xs text-black">
              {classroomDataLanguage.updateAt(language.data ?? "en")}:{" "}
              {timeAgo({
                pastTime: new Date(classroom.data.updateAt).toISOString(),
              })}{" "}
              ago
            </div>
          </div>
        </header>

        <main className="flex w-full flex-col items-center pb-20 pt-20">
          {selectMenu === "Classroom" && (
            <StudentSection
              students={classroom.data.students}
              classroom={classroom.data}
            />
          )}
          {selectMenu === "SettingClassroom" && (
            <ClassroomSetting classroom={classroom.data} toast={toast} />
          )}
          {selectMenu === "GradesSummary" && (
            <GradeSummaryReport
              students={classroom.data.students}
              classroom={classroom.data}
            />
          )}
        </main>
      </ClassroomLayout>
    </>
  );
}

export default Index;
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const params = ctx.params;

  if (!params?.classroomId) {
    return {
      notFound: true,
    };
  }
  if (!validateMongodbId(params.classroomId as string)) {
    return {
      notFound: true,
    };
  }
  const { refresh_token } = getRefetchtoken(ctx);
  if (!refresh_token) {
    throw new Error("Token not found");
  }

  return {
    props: {
      classroomId: params.classroomId,
    },
  };
};
