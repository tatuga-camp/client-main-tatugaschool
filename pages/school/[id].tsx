import Dashboard from "@/components/school/Dashboard";
import { useGetMemberBySchool, useGetSchool, useGetUser } from "@/react-query";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { ProgressSpinner } from "primereact/progressspinner";
import SchoolLayout from "../../components/layout/SchoolLayout";
import React from "react";
import { MenuSchool } from "../../data";
import Classes from "../../components/school/Classes";

const SchoolPage = ({ schoolId }: { schoolId: string }) => {
  const { data: school, isLoading: isSchoolLoading } = useGetSchool({
    schoolId: schoolId,
  });

  const [selectMenu, setSelectMenu] = React.useState<MenuSchool>("School");

  if (isSchoolLoading || !school) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  console.log("selectMenu", selectMenu);
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
      </SchoolLayout>
    </>
  );
};

export default SchoolPage;
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const params = ctx.params;

  if (!params?.id) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      schoolId: params.id,
    },
  };
};
