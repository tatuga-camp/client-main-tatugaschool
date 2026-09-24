import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import IssueDetailPage from "../../../components/admin/issues/IssueDetailPage";
import DefaultLayout from "../../../components/layout/DefaultLayout";
import { requireAdmin } from "../../../utils/requireAdmin";

export const getServerSideProps: GetServerSideProps = (context) =>
  requireAdmin(context);

export default function AdminIssueDetail() {
  const router = useRouter();
  const groupId =
    typeof router.query.groupId === "string" ? router.query.groupId : "";
  return (
    <DefaultLayout>
      <Head>
        <title>Admin - Issue</title>
      </Head>
      {groupId && <IssueDetailPage groupId={groupId} />}
    </DefaultLayout>
  );
}
