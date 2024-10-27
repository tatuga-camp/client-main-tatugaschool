import Dashboard from "@/components/school/Dashboard";
import { useGetMemberBySchool, useGetSchool, useGetUser } from "@/react-query";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { ProgressSpinner } from "primereact/progressspinner";
import SchoolLayout from "../../components/layout/SchoolLayout";
import React from "react";
import { MenuSchool } from "../../data";

const SchoolPage = ({ schoolId }: { schoolId: string }) => {
  const { data: school, isLoading: isSchoolLoading } = useGetSchool({
    schoolId: schoolId,
  });
  const { data: members, isLoading: isMembersLoading } = useGetMemberBySchool({
    schoolId: schoolId,
  });
  const [selectMenu, setSelectMenu] = React.useState<MenuSchool>("School");
  const { data: user, isLoading: isUserLoading } = useGetUser();

  return (
    <>
      <SchoolLayout
        setSelectMenu={
          setSelectMenu as React.Dispatch<React.SetStateAction<string>>
        }
        selectMenu={selectMenu}
        schoolId={schoolId}
      >
        {user &&
        school &&
        members &&
        !isSchoolLoading &&
        !isMembersLoading &&
        !isUserLoading ? (
          <Dashboard user={user} school={school} members={members ?? []} />
        ) : (
          <div className="flex justify-center items-center h-screen">
            <ProgressSpinner
              animationDuration="0.5s"
              style={{ width: "50px" }}
              strokeWidth="8"
            />
          </div>
        )}
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
