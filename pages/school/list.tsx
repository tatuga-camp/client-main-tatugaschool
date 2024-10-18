import React from "react";

import ListsSchoolComponent from "@/components/school/ListsSchoolComponent";
import DefaultLayout from "@/components/layout/DefaultLayout";
const DashboardPage = () => {
  return (
    <DefaultLayout>
      <ListsSchoolComponent />
    </DefaultLayout>
  );
};

export default DashboardPage;
