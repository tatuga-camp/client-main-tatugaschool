import { GetServerSideProps } from "next";
import React from "react";
import { getRefetchtoken, timeAgo, validateMongodbId } from "../../utils";
import {
  GetClassByIdService,
  RefreshTokenService,
  ResponseGetClassByIdService,
} from "../../services";
import { useGetClassroom, useGetLanguage } from "../../react-query";
import Head from "next/head";
import ClassroomLayout from "../../components/layout/ClassroomLayout";
import { ProgressSpinner } from "primereact/progressspinner";
import { MenuClassroom } from "../../data";
import { useRouter } from "next/router";
import { FaUsers } from "react-icons/fa6";
import { CiCircleInfo } from "react-icons/ci";
import StudentSection from "../../components/classroom/StudentLists";
import ClassroomSetting from "../../components/classroom/ClassroomSetting";
import { Toast } from "primereact/toast";
import GradeSummaryReport from "../../components/classroom/GradeSummaryReport";
import { classroomDataLanguage } from "../../data/languages";

function Index({ classroomId }: { classroomId: string }) {
  const toast = React.useRef<Toast>(null);
  const language = useGetLanguage();
  const router = useRouter();
  const [selectMenu, setSelectMenu] =
    React.useState<MenuClassroom>("Classroom");

  const classroom = useGetClassroom({
    classId: classroomId,
  });
  React.useEffect(() => {
    if (router.isReady) {
      setSelectMenu((router.query.menu as MenuClassroom) ?? "Classroom");
    }
  }, [router.isReady]);
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
        selectMenu={selectMenu}
        setSelectMenu={
          setSelectMenu as React.Dispatch<React.SetStateAction<string>>
        }
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
                  setSelectMenu("SettingClassroom");
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
  try {
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
    const accessToken = await RefreshTokenService({
      refreshToken: refresh_token,
    });

    return {
      props: {
        classroomId: params.classroomId,
      },
    };
  } catch (error) {
    console.log("error", error);
    return {
      redirect: {
        destination: "/auth/sign-in",
        permanent: false,
      },
    };
  }
};
