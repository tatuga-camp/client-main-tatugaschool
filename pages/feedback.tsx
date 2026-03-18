import axios, { AxiosError } from "axios";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import DefaultLayout from "../components/layout/DefaultLayout";
import { useDeleteFeedback, useGetFeedbacks } from "../react-query/feedback";
import { RefreshTokenService } from "../services";
import { getRefetchtoken } from "../utils";

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const refetch_token = getRefetchtoken(context);

  if (!refetch_token.refresh_token) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  try {
    const access_token = await RefreshTokenService({
      refreshToken: refetch_token.refresh_token,
    });
    const user = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/users/me`,
      {
        headers: {
          Authorization: `Bearer ${access_token.accessToken}`,
        },
      },
    );

    if (user.data.role !== "ADMIN") {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    return {
      props: {
        user: user.data,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

function AdminFeedback() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    data: feedbacks,
    isLoading,
    refetch,
  } = useGetFeedbacks({
    page,
    limit,
  });

  const { mutate: deleteFeedback, isPending: isDeleting } = useDeleteFeedback();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      deleteFeedback(
        { feedbackId: id },
        {
          onSuccess: () => {
            refetch();
          },
        },
      );
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Admin - Feedbacks</title>
      </Head>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-5">
        <h1 className="text-3xl font-bold text-gray-800">All Feedbacks</h1>

        {isLoading ? (
          <div className="flex w-full items-center justify-center p-10">
            <span className="text-xl text-gray-500">Loading...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {feedbacks?.items.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-10 text-center text-gray-500">
                No feedbacks found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {feedbacks?.items.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          feedback.tag === "BUG"
                            ? "bg-red-100 text-red-600"
                            : feedback.tag === "COMPLIMENT"
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {feedback.tag}
                      </span>
                      <button
                        onClick={() => handleDelete(feedback.id)}
                        disabled={isDeleting}
                        className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <AiOutlineDelete size={20} />
                      </button>
                    </div>

                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                      {feedback.body}
                    </p>

                    {feedback.fileOnFeedbacks &&
                      feedback.fileOnFeedbacks.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {feedback.fileOnFeedbacks.map((file) => (
                            <a
                              key={file.id}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs text-blue-500 hover:bg-blue-50"
                            >
                              <svg
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="0"
                                viewBox="0 0 16 16"
                                height="1em"
                                width="1em"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"></path>
                              </svg>
                              Attachment
                            </a>
                          ))}
                        </div>
                      )}

                    <div className="mt-auto flex flex-col gap-1 border-t pt-3 text-xs text-gray-500">
                      <div>
                        <span className="font-semibold">User ID:</span>{" "}
                        {feedback.userId ? feedback.userId : "Anonymous"}
                      </div>
                      <div>
                        <span className="font-semibold">Date:</span>{" "}
                        {new Date(feedback.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination controls */}
            {feedbacks && feedbacks.totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm font-medium">
                  Page {feedbacks.page} of {feedbacks.totalPages}
                </span>
                <button
                  disabled={page === feedbacks.totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(feedbacks.totalPages, p + 1))
                  }
                  className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}

export default AdminFeedback;
