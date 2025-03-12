import { GetServerSideProps } from "next";
import React from "react";
import { getRefetchtoken, timeAgo, validateMongodbId } from "../../utils";
import {
  GetClassByIdService,
  RefreshTokenService,
  ResponseGetClassByIdService,
} from "../../services";
import { useGetClassroom } from "../../react-query";
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

function Index({ classroomId }: { classroomId: string }) {
  const toast = React.useRef<Toast>(null);
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
      <div className="flex justify-center items-center h-screen">
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
    }
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
          className={`p-12 pb-20 flex flex-col text-white ${
            classroom.data.isAchieved ? "gradient-bg-success" : "gradient-bg"
          } `}
        >
          {/* Top Section */}
          <div className="flex gap-2">
            <div
              className="flex w-max text-xs  
             items-center mb-5  text-white  border-white gap-1 border rounded-full px-2 py-1 justify-center"
            >
              CLASSROOM
            </div>
            {classroom.data.isAchieved && (
              <div
                className="flex w-max text-xs  
             items-center mb-5  text-white  border-white gap-1 border rounded-full px-2 py-1 justify-center"
              >
                ACHIEVED
              </div>
            )}
          </div>

          <div className="flex justify-between items-start w-full">
            <div className="w-max border-b border-b-white pb-2">
              <h1 className="text-4xl font-bold max-w-[60rem] break-words">
                ชั้นเรียน - {classroom.data.title}{" "}
              </h1>
              <p className="text-xl">{classroom.data.level}</p>
              <p className="text-gray-300  max-w-[60rem] break-words ">
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
                className="flex items-center active:scale-110 justify-center gap-1
                 hover:bg-primary-color hover:text-white
                  text-primary-color bg-white w-max px-2 py-1 rounded-md"
              >
                <CiCircleInfo />
                More Info & Edit
              </button>
            </div>
          </div>
          <div className="flex pt-5 gap-3">
            <div className="flex w-max  bg-white items-center text-black gap-1 border rounded-full px-2 py-1 justify-center">
              <FaUsers />
              <span className=" text-xs">
                {classroom.data.students.length} Students
              </span>
            </div>
            <div
              className="flex w-max text-xs  
            bg-white items-center text-black gap-1 border rounded-full px-2 py-1 justify-center"
            >
              Create At: {dateMonth}
            </div>
            <div
              className="flex w-max text-xs  
            bg-white items-center text-black gap-1 border rounded-full px-2 py-1 justify-center"
            >
              Last Update:{" "}
              {timeAgo({
                pastTime: new Date(classroom.data.updateAt).toISOString(),
              })}{" "}
              ago
            </div>
          </div>
        </header>

        <main className="w-full flex flex-col pb-20 pt-20 items-center">
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
