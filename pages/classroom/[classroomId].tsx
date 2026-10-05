import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Toast } from "primereact/toast";
import React from "react";
import ClassroomHeader from "../../components/classroom/ClassroomHeader";
import ClassroomSetting from "../../components/classroom/ClassroomSetting";
import ClassroomSubjects from "../../components/classroom/ClassroomSubjects";
import GradeSummaryReport from "../../components/classroom/GradeSummaryReport";
import StudentSection from "../../components/classroom/StudentLists";
import ClassroomLayout from "../../components/layout/ClassroomLayout";
import DefaultLayout from "../../components/layout/DefaultLayout";
import { MenuClassroom } from "../../data";
import { classroomUiLanguage } from "../../data/languages";
import { useGetClassroom, useGetLanguage } from "../../react-query";
import { validateMongodbId } from "../../utils";

function Index({ classroomId }: { classroomId: string }) {
  const toast = React.useRef<Toast>(null);
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const router = useRouter();
  const selectMenu = (router.query.menu as MenuClassroom) || "Classroom";
  const classroom = useGetClassroom({ classId: classroomId });

  const selectTab = (menu: MenuClassroom) => {
    router.replace({ query: { ...router.query, menu } }, undefined, {
      shallow: true,
    });
  };

  if (classroom.isLoading) {
    return (
      <div className="min-h-screen bg-background-color font-Anuphan">
        <div className="border-b border-icon-color/10 bg-white">
          <div className="mx-auto flex max-w-5xl animate-pulse items-start gap-4 px-4 py-8 sm:px-6">
            <div className="h-16 w-16 rounded-2xl bg-background-color" />
            <div className="flex-1 space-y-3">
              <div className="h-7 w-1/2 rounded bg-background-color" />
              <div className="h-4 w-1/3 rounded bg-background-color" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (classroom.error || !classroom.data) {
    return (
      <DefaultLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-2xl font-bold text-icon-color">
            {classroom.error
              ? classroomUiLanguage.loadError(lang)
              : classroomUiLanguage.classroomNotFound(lang)}
          </h1>
          <p className="text-icon-color/70">
            {classroom.error?.message ||
              classroomUiLanguage.classroomNotFoundBody(lang)}
          </p>
          <div className="mt-2 flex gap-2">
            {classroom.error && (
              <button
                type="button"
                onClick={() => classroom.refetch()}
                className="h-11 rounded-xl bg-primary-color px-5 font-semibold text-white transition-colors hover:bg-primary-color-hover"
              >
                {classroomUiLanguage.tryAgain(lang)}
              </button>
            )}
            <Link
              href="/"
              className="flex h-11 items-center rounded-xl border border-icon-color/15 px-5 font-semibold text-icon-color transition-colors hover:bg-white"
            >
              {classroomUiLanguage.backHome(lang)}
            </Link>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{`${classroom.data.title} - Tatuga School`}</title>
      </Head>
      <Toast ref={toast} />
      <ClassroomLayout classroomId={classroomId} schoolId={classroom.data.schoolId}>
        <ClassroomHeader
          classroom={classroom.data}
          selectMenu={selectMenu}
          onSelectMenu={selectTab}
        />
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
          {selectMenu === "Classroom" && (
            <StudentSection
              students={classroom.data.students}
              classroom={classroom.data}
            />
          )}
          {selectMenu === "SubjectsClassroom" && (
            <ClassroomSubjects classroom={classroom.data} />
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

  return {
    props: {
      classroomId: params.classroomId,
    },
  };
};
