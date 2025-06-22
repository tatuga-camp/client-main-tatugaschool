import React, { useState } from "react";
import { FileOnTeachingMaterial, TeachingMaterial } from "../../interfaces";
import { IoMdClose } from "react-icons/io";
import { filesize } from "filesize";
import { FaFilePdf, FaImage } from "react-icons/fa6";
import { FaFileAlt } from "react-icons/fa";
import { BsEye } from "react-icons/bs";
import { MdDownload, MdEdit } from "react-icons/md";
import TeachingMaterialSection from "./TeachingMaterialSection";
import { useGetTeachingMaterial, useGetUser } from "../../react-query";
import LoadingBar from "../common/LoadingBar";
import LinkPreview from "../common/LinkPreview";

type Props = {
  id: string;
  onClose: () => void;
};
const getFileType = (fileName: string): string => {
  return fileName.split(".").pop()?.toUpperCase() || "UNKNOWN";
};
function TeachingMaterialShow({ id, onClose }: Props) {
  const teachingMaterial = useGetTeachingMaterial({ teachingMaterialId: id });
  const user = useGetUser();
  const [triggerEdit, setTriggerEdit] = useState(false);
  return (
    <>
      {triggerEdit ? (
        <TeachingMaterialSection
          onClose={onClose}
          teachingMaterial={teachingMaterial.data}
        />
      ) : (
        <div className="flex h-[90%] w-10/12 flex-col rounded-md bg-white font-Anuphan">
          {teachingMaterial.isLoading && <LoadingBar />}
          <header className="flex h-max w-full items-center justify-between border-b px-5 py-3">
            <section className="flex flex-col gap-3">
              <h1 className="text-lg font-semibold">Teaching Material</h1>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                {teachingMaterial.data?.title}{" "}
                <ul className="flex flex-wrap gap-2">
                  {teachingMaterial.data?.tags.map((tag, index) => {
                    return (
                      <li
                        className="flex w-max items-center rounded-md bg-blue-100 px-2 text-xs text-blue-700"
                        key={index}
                      >
                        #{tag}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
            {teachingMaterial.data && (
              <LinkPreview
                {...teachingMaterial.data?.createor}
                url={teachingMaterial.data?.creatorURL}
              />
            )}
            <div className="flex items-center justify-center gap-2">
              {user.data?.role === "ADMIN" && (
                <button
                  type="button"
                  onClick={() => setTriggerEdit(true)}
                  className="flex items-center justify-center rounded border px-5 text-lg hover:bg-gray-300/50"
                >
                  <MdEdit /> Edit
                </button>
              )}
              <button
                type="button"
                onClick={() => onClose()}
                className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
              >
                <IoMdClose />
              </button>
            </div>
          </header>

          <main className="flex grow flex-col gap-2 overflow-auto p-5">
            {teachingMaterial.data?.files.map((file) => {
              const fileExtension = getFileType(file.type);
              const isPDF = fileExtension === "APPLICATION/PDF";
              const isImage = fileExtension.includes("IMAGE");

              console.log(isImage);

              const fileName =
                file.url.split("/")[file.url.split("/").length - 1];
              return (
                <div
                  key={file.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isPDF && <FaFilePdf />}
                      {isImage && <FaImage />}
                      {!isPDF && !isImage && <FaFileAlt />}
                      <div>
                        <p className="text-lg font-medium">{fileName}</p>
                        <p className="text-sm text-gray-500">
                          {filesize(file.size, {
                            standard: "jedec",
                          })}{" "}
                          • {fileExtension}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {(isPDF || isImage) && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                        >
                          <BsEye />
                          <span>View</span>
                        </a>
                      )}
                      <a
                        href={file.url}
                        target="_blank"
                        download={fileName}
                        className="flex items-center space-x-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <MdDownload />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>

                  {!isPDF && !isImage && (
                    <div className="flex items-center space-x-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-yellow-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.487 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 11a1 1 0 100-2 1 1 0 000 2zm1-2a1 1 0 10-2 0v2a1 1 0 102 0V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        This file type cannot be previewed in the browser.
                        Please download to view.
                      </span>
                    </div>
                  )}

                  {/* PDF and Image preview (simplified for demonstration) */}
                  {(isPDF || isImage) && file.url && (
                    <div className="mt-4 grow overflow-auto rounded-md border border-gray-300 bg-gray-50 p-2">
                      <p className="mb-2 text-sm text-gray-600">
                        Example Preview:
                      </p>
                      {isPDF ? (
                        <div className="flex h-max items-center justify-center rounded-md bg-gray-100 text-gray-500">
                          <embed src={file.url} width="100%" height="364" />
                        </div>
                      ) : (
                        <div className="flex h-max items-center justify-center overflow-hidden">
                          <img
                            src={file.url}
                            alt={`review of ${fileName}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </main>
        </div>
      )}
    </>
  );
}

export default TeachingMaterialShow;
