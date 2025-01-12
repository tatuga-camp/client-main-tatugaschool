import React from "react";
import { CommentOnAssignment, ErrorMessages } from "../../interfaces";
import { ProgressSpinner } from "primereact/progressspinner";
import { MdDelete } from "react-icons/md";
import Image from "next/image";
import parse from "html-react-parser";
import Swal from "sweetalert2";
import {
  useDeleteComment,
  useGetComments,
} from "../../react-query/commentOnAssignment";
import { timeAgo } from "../../utils";
type Props = {
  comment: CommentOnAssignment;
  index: number;
  studentOnAssignmentId: string;
};
function CommentList({ comment, index, studentOnAssignmentId }: Props) {
  const [isDelete, setIsDelete] = React.useState(false);
  const comments = useGetComments({ studentOnAssignmentId });
  const deleteComment = useDeleteComment();

  const handleDeleteComment = async (commentId: string) => {
    try {
      setIsDelete(true);
      await deleteComment.mutateAsync({ commentAssignmentId: commentId });
      await comments.refetch();
      setIsDelete(false);
    } catch (error) {
      setIsDelete(false);
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
    <li
      className={`flex group relative gap-2 p-2 ${
        index % 2 === 0 ? "bg-gray-50" : ""
      }`}
    >
      {isDelete ? (
        <div className="absolute  top-2 right-2">
          {" "}
          <ProgressSpinner
            animationDuration="0.5s"
            style={{ width: "20px" }}
            className="w-5 h-5  "
            strokeWidth="8"
          />
        </div>
      ) : (
        <button
          disabled={isDelete}
          onClick={() => handleDeleteComment(comment.id)}
          className="absolute hidden group-hover:block
     hover:bg-red-200 rounded-full p-1 transition active:scale-105
   top-2 right-2 text-red-500"
        >
          <MdDelete />
        </button>
      )}
      <div className="w-10 border h-10 rounded-full overflow-hidden relative">
        <Image
          src={comment.photo || "/avatar.png"}
          alt="avatar"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="w-full">
        <div className="w-full gap-2 flex items-end">
          <h1 className="font-semibold">
            {comment.firstName} {comment.lastName}
          </h1>
          <span className="font-normal text-gray-400 text-sm">
            {timeAgo({ pastTime: comment.createAt })}
          </span>
        </div>
        <p>{parse(comment.content)}</p>
      </div>
    </li>
  );
}

export default CommentList;
