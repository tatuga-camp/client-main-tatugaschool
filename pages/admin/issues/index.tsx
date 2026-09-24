import { GetServerSideProps } from "next";
import Head from "next/head";
import AdminIssuesPage from "../../../components/admin/issues/AdminIssuesPage";
import DefaultLayout from "../../../components/layout/DefaultLayout";
import { requireAdmin } from "../../../utils/requireAdmin";

export const getServerSideProps: GetServerSideProps = (context) =>
  requireAdmin(context);

export default function AdminIssues() {
  return (
    <DefaultLayout>
      <Head>
        <title>Admin - Issues</title>
      </Head>
      <AdminIssuesPage />
    </DefaultLayout>
  );
}
