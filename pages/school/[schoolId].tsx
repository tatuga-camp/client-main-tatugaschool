import Dashboard from "@/components/school/Dashboard";
import { useGetMemberBySchool, useGetSchool, useGetUser } from "@/react-query";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { ProgressSpinner } from "primereact/progressspinner";
import SchoolLayout from "../../components/layout/SchoolLayout";
import React, { useEffect } from "react";
import { MenuSchool } from "../../data";
import Classes from "../../components/school/Classrooms";
import { validateMongodbId } from "../../utils";
import Subjects from "../../components/school/Subjects";

const SchoolPage = ({ schoolId }: { schoolId: string }) => {
  const router = useRouter();
  const { data: school, isLoading: isSchoolLoading } = useGetSchool({
    schoolId: schoolId,
  });
  const [selectMenu, setSelectMenu] = React.useState<MenuSchool>("School");

  useEffect(() => {
    if (router.isReady) {
      setSelectMenu((router.query.menu as MenuSchool) ?? "School");
    }
  }, [router.isReady]);

  if (isSchoolLoading || !school) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <>
      <SchoolLayout
        setSelectMenu={
          setSelectMenu as React.Dispatch<React.SetStateAction<string>>
        }
        selectMenu={selectMenu}
        schoolId={schoolId}
      >
        {selectMenu === "School" && <Dashboard school={school} />}
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
