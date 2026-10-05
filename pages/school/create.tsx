import Head from "next/head";
import CreateSchoolComponent from "@/components/school/CreateSchoolComponent";
import DefaultLayout from "../../components/layout/DefaultLayout";

const CreateSchoolPage = () => {
  return (
    <DefaultLayout>
      <Head>
        <title>Set Up Your School - Tatuga School</title>
      </Head>
      <CreateSchoolComponent />
    </DefaultLayout>
  );
};

export default CreateSchoolPage;
