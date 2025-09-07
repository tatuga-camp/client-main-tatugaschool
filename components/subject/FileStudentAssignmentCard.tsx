import React from "react";
import { ErrorMessages, FileOnStudentOnAssignment } from "../../interfaces";
import { FiFile } from "react-icons/fi";
import { FaRegFile, FaRegFileImage } from "react-icons/fa";
import {
  MdDelete,
  MdNoteAlt,
  MdOutlineImageNotSupported,
} from "react-icons/md";
import Swal from "sweetalert2";
import { ProgressSpinner } from "primereact/progressspinner";
import { LuLink } from "react-icons/lu";
import { useDeleteFileStudentOnAssignment } from "../../react-query";
import Image from "next/image";
import { defaultBlurHash } from "../../data";

type Props = {
  file: FileOnStudentOnAssignment;
  onShowText?: (file: FileOnStudentOnAssignment) => void;
  onEditImage?: (file: FileOnStudentOnAssignment) => void;
};
function FileStudentAssignmentCard({ file, onShowText, onEditImage }: Props) {
  if (file.contentType === "FILE") {
    return <FileCard file={file} onEditImage={onEditImage} />;
  }
  if (file.contentType === "TEXT") {
    return <TextCard file={file} onShowText={onShowText} />;
  }
}

function TextCard({ file, onShowText }: Props) {
  const deleteFile = useDeleteFileStudentOnAssignment();

  const handleDeleteFile = async () => {
    try {
      await deleteFile.mutateAsync({ fileOnStudentAssignmentId: file.id });
    } catch (error) {
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
    <li className="group flex h-14 w-full items-center justify-between overflow-hidden rounded-md border bg-white">
      <div className="flex h-full w-full items-center justify-start gap-2">
        <button
          onClick={() => onShowText?.(file)}
          type="button"
          className="flex h-full w-16 items-center justify-center border-r bg-gradient-to-r from-green-200 to-green-600 text-lg text-white"
        >
          <MdNoteAlt />
        </button>
        <button
          type="button"
          onClick={() => onShowText?.(file)}
          className="flex max-w-40 items-center gap-2 truncate"
        >
          <span>{file.name}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={handleDeleteFile}
        disabled={deleteFile.isPending}
        className="hidden items-center justify-center rounded-full p-2 text-xl text-red-500 hover:bg-red-300/50 active:scale-105 group-hover:flex"
      >
        {deleteFile.isPending ? (
          <ProgressSpinner
            animationDuration="1s"
            style={{ width: "20px" }}
            className="h-5 w-5"
            strokeWidth="8"
          />
        ) : (
          <MdDelete />
        )}
      </button>
    </li>
  );
}

function FileCard({ file, onEditImage }: Props) {
  let fileType: "pdf" | "image" | "unsupported" = "unsupported";

  if (file.type.includes("image")) {
    fileType = "image";
  } else if (file.type === "application/pdf") {
    fileType = "pdf";
  } else {
    fileType = "unsupported";
  }

  const fileName =
    file.type === "link-url" ? file.body : file.body.split("/").pop();

  const deleteFile = useDeleteFileStudentOnAssignment();

  const handleDeleteFile = async () => {
    try {
      await deleteFile.mutateAsync({ fileOnStudentAssignmentId: file.id });
    } catch (error) {
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
    <li className="h-max overflow-hidden rounded-md border bg-white">
      <section className="group flex h-14 w-full items-center justify-between">
        <div className="flex h-14 w-full items-center justify-start gap-2">
          <button
            type="button"
            onClick={() => window.open(file.body, "_blank")}
            className="gradient-bg flex h-14 w-16 items-center justify-center border-r text-lg text-white"
          >
            {fileType === "image" ? (
              <FaRegFileImage />
            ) : file.type === "link-url" ? (
              <LuLink />
            ) : (
              <FaRegFile />
            )}
          </button>
          <button
            type="button"
            onClick={() => window.open(file.body, "_blank")}
            className="flex w-60 items-center gap-2"
          >
            <div className="max-w-52 overflow-x-auto text-sm">
              <span className="w-max text-nowrap">{fileName}</span>
            </div>
          </button>
        </div>
        <div className="flex items-center justify-center gap-1">
          {fileType === "image" && (
            <button
              onClick={() => onEditImage?.(file)}
              type="button"
              className="w-6 hover:underline"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
              }).then((result) => {
                if (result.isConfirmed) {
                  handleDeleteFile();
                }
              });
            }}
            disabled={deleteFile.isPending}
            className="flex w-10 items-center justify-center rounded-full p-2 text-xl text-red-500 hover:bg-red-300/50 active:scale-105"
          >
            {deleteFile.isPending ? (
              <ProgressSpinner
                animationDuration="1s"
                style={{ width: "20px" }}
                className="h-5 w-5"
                strokeWidth="8"
              />
            ) : (
              <MdDelete />
            )}
          </button>
        </div>
      </section>
      {fileType === "image" && (
        <div className="relative h-96 w-full">
          <Image
            blurDataURL={defaultBlurHash}
            placeholder="blur"
            src={file.body}
            className="object-contain"
            fill
            alt={fileName ?? "Image"}
          />
        </div>
      )}

      {fileType === "pdf" && (
        <div className="relative h-96 w-full">
          <embed width="100%" height="100%" src={file.body} />
        </div>
      )}
      {fileType === "unsupported" && (
        <div className="relative flex h-96 w-full flex-col items-center justify-center gap-2 bg-gray-400 text-xl text-white">
          <MdOutlineImageNotSupported />
          <span>Not Support</span>
        </div>
      )}
    </li>
  );
}

export default FileStudentAssignmentCard;
