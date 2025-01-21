import React, { useEffect } from "react";

import Image from "next/image";
import { defaultBlurHash } from "../../data";
import TextEditor from "../common/TextEditor";
import { ErrorMessages } from "../../interfaces";
import Swal from "sweetalert2";
import { ProgressSpinner } from "primereact/progressspinner";
import parse from "html-react-parser";
import { FiDelete } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import CommentList from "./CommentList";
import {
  useCreateComment,
  useGetComments,
} from "../../react-query/commentOnAssignment";
import { useGetUser } from "../../react-query";
type Props = {
  studentOnAssignmentId: string;
};
function CommentSection({ studentOnAssignmentId }: Props) {
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
    <div className="w-full flex flex-col gap-2">
      <header className="h-10 border-b">
        <h1 className="text-lg font-semibold">Comments</h1>
      </header>
      <ul
        ref={commentBodyRef}
        className="w-full   h-max max-h-40 overflow-auto"
      >
        {comments.data?.map((comment, index) => (
          <CommentList
            studentOnAssignmentId={studentOnAssignmentId}
            comment={comment}
            index={index}
            key={index}
          />
        ))}
      </ul>
      <form className="w-full flex gap-2">
        <div className="w-10 border h-10 rounded-full overflow-hidden relative">
          <Image
            src={user.data?.photo || "/avatar.png"}
            alt="avatar"
            fill
            placeholder="blur"
            blurDataURL={
              user.data?.blurHash ? user.data?.blurHash : defaultBlurHash
            }
            className="object-cover"
          />
        </div>
        <div className="grow h-40 relative ">
          <TextEditor
            menubar={false}
            toolbar={false}
            value={comment}
            onChange={(content) => setComment(content)}
          />
          <button
            type="button"
            onClick={handleCreateComment}
            disabled={loadingComments}
            className="absolute flex w-24 items-center justify-center main-button bottom-8 right-2 bg-blue-500 text-white px-2 py-1 rounded"
          >
            {loadingComments ? (
              <ProgressSpinner
                animationDuration="0.5s"
                style={{ width: "20px" }}
                className="w-5 h-5  "
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
