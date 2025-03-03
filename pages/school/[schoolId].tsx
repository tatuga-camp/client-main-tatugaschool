import Dashboard from "@/components/school/Dashboard";
import { useGetSchool, useGetUser } from "@/react-query";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { ProgressSpinner } from "primereact/progressspinner";
import SchoolLayout from "../../components/layout/SchoolLayout";
import React, { useEffect } from "react";
import { MenuSchool } from "../../data";
import Classes from "../../components/school/Classrooms";
import { validateMongodbId } from "../../utils";
import Subjects from "../../components/school/Subjects";
import DefaultLayout from "../../components/layout/DefaultLayout";
import Head from "next/head";

const SchoolPage = ({ schoolId }: { schoolId: string }) => {
  const router = useRouter();
  const school = useGetSchool({
    schoolId: schoolId,
  });
  const [selectMenu, setSelectMenu] = React.useState<MenuSchool>("School");

  useEffect(() => {
    if (router.isReady) {
      setSelectMenu((router.query.menu as MenuSchool) ?? "School");
    }
  }, [router.isReady]);

  if (school.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  if (school.error) {
    return (
      <DefaultLayout>
        <div className="flex justify-center gap-3 flex-col items-center h-screen">
          <h1 className="text-4xl text-red-500">
            {school.error.message || "Something went wrong"}
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-primary-color w-40 text-white px-4 py-2 rounded-md"
          >
            Back
          </button>
        </div>
      </DefaultLayout>
    );
  }

  if (!school.data) {
    return (
      <DefaultLayout>
        <div className="flex justify-center gap-3 flex-col items-center h-screen">
          <h1 className="text-4xl text-red-500">No School Found</h1>
          <button
            onClick={() => router.back()}
            className="bg-primary-color w-40 text-white px-4 py-2 rounded-md"
          >
            Back
          </button>
        </div>
      </DefaultLayout>
    );
  }
  const title = `${school.data.title} - Tatuga School`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <SchoolLayout
        setSelectMenu={
          setSelectMenu as React.Dispatch<React.SetStateAction<string>>
        }
        selectMenu={selectMenu}
        schoolId={schoolId}
      >
        {selectMenu === "School" && <Dashboard school={school.data} />}
        {selectMenu === "Classes" && <Classes schoolId={schoolId} />}
        {selectMenu === "Subjects" && <Subjects schoolId={schoolId} />}
      </SchoolLayout>
    </>
  );
};

export default SchoolPage;
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const params = ctx.params;

  if (!params?.schoolId) {
    return {
      notFound: true,
    };
  }

  if (!validateMongodbId(params.schoolId as string)) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      schoolId: params.schoolId,
    },
  };
};
