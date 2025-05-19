import React, { useEffect } from "react";

import Image from "next/image";
import { ProgressSpinner } from "primereact/progressspinner";
import Swal from "sweetalert2";
import { defaultBlurHash } from "../../data";
import { ErrorMessages } from "../../interfaces";
import { useGetUser } from "../../react-query";
import {
  useCreateComment,
  useGetComments,
} from "../../react-query/commentOnAssignment";
import TextEditor from "../common/TextEditor";
import CommentList from "./CommentList";
type Props = {
  studentOnAssignmentId: string;
  schoolId: string;
};
function CommentSection({ studentOnAssignmentId, schoolId }: Props) {
  const comments = useGetComments({ studentOnAssignmentId });
  const user = useGetUser();
  const [comment, setComment] = React.useState("");
  const create = useCreateComment();
  const [loadingComments, setLoadingComments] = React.useState(false);
  const commentBodyRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    comments.refetch();
    commentBodyRef.current?.scrollTo(0, commentBodyRef.current.scrollHeight);
  }, [studentOnAssignmentId]);

  const handleCreateComment = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoadingComments(true);
      await create.mutateAsync({
        content: comment,
        studentOnAssignmentId: studentOnAssignmentId,
      });
      await comments.refetch();
      setComment("");
      commentBodyRef.current?.scrollTo(0, commentBodyRef.current.scrollHeight);
      setLoadingComments(false);
    } catch (error) {
      setLoadingComments(false);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <header className="h-10 border-b">
        <h1 className="text-lg font-semibold">Comments</h1>
      </header>
      <ul ref={commentBodyRef} className="h-max max-h-40 w-full overflow-auto">
        {comments.data?.map((comment, index) => (
          <CommentList
            studentOnAssignmentId={studentOnAssignmentId}
            comment={comment}
            index={index}
            key={index}
          />
        ))}
      </ul>
      <form className="flex w-full gap-2">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border">
          <Image
            src={user.data?.photo || "/avatar.png"}
            alt="avatar"
            fill
            placeholder="blur"
            sizes="(max-width: 768px) 100vw, 33vw"
            blurDataURL={
              user.data?.blurHash ? user.data?.blurHash : defaultBlurHash
            }
            className="object-cover"
          />
        </div>
        <div className="relative h-40 grow">
          <TextEditor
            schoolId={schoolId}
            menubar={false}
            toolbar={false}
            value={comment}
            onChange={(content) => setComment(content)}
          />
          <button
            type="button"
            onClick={handleCreateComment}
            disabled={loadingComments}
            className="main-button absolute bottom-8 right-2 flex w-24 items-center justify-center rounded bg-blue-500 px-2 py-1 text-white"
          >
            {loadingComments ? (
              <ProgressSpinner
                animationDuration="0.5s"
                style={{ width: "20px" }}
                className="h-5 w-5"
                strokeWidth="8"
              />
            ) : (
              "Comment"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CommentSection;
