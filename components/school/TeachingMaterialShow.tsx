import { filesize } from "filesize";
import { useState } from "react";
import { BsEye } from "react-icons/bs";
import { FaFileAlt } from "react-icons/fa";
import { FaFilePdf, FaImage } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { IoBookSharp } from "react-icons/io5";
import { MdDownload, MdEdit } from "react-icons/md";
import { SiCanva } from "react-icons/si";
import { useGetTeachingMaterial, useGetUser } from "../../react-query";
import LinkPreview from "../common/LinkPreview";
import LoadingBar from "../common/LoadingBar";
import TeachingMaterialSection from "./TeachingMaterialSection";

type Props = {
  id: string;
  onClose: () => void;
};
const getFileType = (fileName: string): string => {
  return fileName.split(".").pop()?.toUpperCase() || "UNKNOWN";
};
const tagColorClasses = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
  "bg-yellow-100 text-yellow-800",
  "bg-red-100 text-red-800",
  "bg-indigo-100 text-indigo-800",
  "bg-gray-100 text-gray-800",
];
const getRandomColorClass = () =>
  tagColorClasses[Math.floor(Math.random() * tagColorClasses.length)];
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
        <div className="gradient-bg relative flex h-full w-full flex-col overflow-hidden font-Anuphan">
          {teachingMaterial.isLoading && <LoadingBar />}
          <header className="flex h-max w-full items-center justify-between px-5 py-5">
            <section className="flex flex-col gap-1">
              <h1 className="flex items-center justify-center gap-3 border-b pb-2 text-lg font-semibold text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/50 text-2xl text-white">
                  <IoBookSharp />
                </div>
                Teaching Material
                <div className="flex h-10 w-max items-center justify-center rounded-2xl bg-white/50 px-2 text-lg font-medium text-white">
                  {teachingMaterial.data?.accessLevel}
                </div>
                {teachingMaterial.data?.canvaURL && (
                  <a
                    href={teachingMaterial.data.canvaURL}
                    target="_blank"
                    className="flex flex-col gap-2 text-4xl font-bold text-white"
                  >
                    <SiCanva />
                  </a>
                )}
              </h1>
              <span className="text-base font-medium text-white">
                {teachingMaterial.data?.title}
              </span>
            </section>

            <div className="flex items-center justify-center gap-2">
              {user.data?.role === "ADMIN" && (
                <button
                  type="button"
                  onClick={() => setTriggerEdit(true)}
                  className="flex h-8 w-20 items-center justify-center rounded-2xl bg-white/50 text-lg text-white hover:bg-white hover:text-black"
                >
                  <MdEdit /> Edit
                </button>
              )}
              <button
                type="button"
                onClick={() => onClose()}
                className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/50 text-2xl font-semibold text-white hover:bg-white hover:text-black"
              >
                <IoMdClose />
              </button>
            </div>
          </header>

          <main className="absolute -right-3 bottom-0 flex h-5/6 w-full gap-2 overflow-auto rounded-tl-3xl bg-gray-50 p-5 pr-10">
            <div className="flex h-max w-full flex-col gap-5">
              <section className="w-max rounded-2xl bg-white p-3 shadow-sm">
                {teachingMaterial.data && (
                  <LinkPreview
                    {...teachingMaterial.data?.createor}
                    url={teachingMaterial.data?.creatorURL}
                  />
                )}
              </section>
              <ul className="flex flex-wrap gap-2">
                {teachingMaterial.data?.tags.map((tag, index) => {
                  const color = getRandomColorClass();
                  return (
                    <li
                      className={`flex w-max items-center rounded-2xl px-2 text-xs ${color}`}
                      key={index}
                    >
                      #{tag}
                    </li>
                  );
                })}
              </ul>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {teachingMaterial.data?.files.map((file) => {
                  const fileExtension = getFileType(file.type);
                  const isPDF = fileExtension === "APPLICATION/PDF";
                  const isImage = fileExtension.includes("IMAGE");

                  const fileName =
                    file.url.split("/")[file.url.split("/").length - 1];
                  return (
                    <div
                      key={file.id}
                      className={`flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-lg transition-all hover:shadow-xl ${
                        isPDF
                          ? "col-span-1 md:col-span-2 lg:col-span-3"
                          : "col-span-1 md:col-span-2 lg:col-span-3"
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between">
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
                              className="flex items-center space-x-1 rounded-2xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                            >
                              <BsEye />
                              <span>View</span>
                            </a>
                          )}
                          <a
                            href={file.url}
                            target="_blank"
                            download={fileName}
                            className="flex items-center space-x-1 rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            <MdDownload />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>

                      {!isPDF && !isImage && (
                        <div className="mt-auto flex items-center space-x-2 rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
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

                      {/* PDF and Image preview */}
                      {(isPDF || isImage) && file.url && (
                        <div className="mt-2 flex grow flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                          {isPDF ? (
                            <div className="flex h-[70vh] w-full flex-col">
                              <iframe
                                src={`${file.url}#toolbar=0`}
                                className="h-full w-full rounded-2xl"
                                title={fileName}
                              />
                            </div>
                          ) : (
                            <div className="flex h-96 items-center justify-center overflow-hidden p-2">
                              <img
                                src={file.url}
                                alt={`preview of ${fileName}`}
                                className="h-full w-full rounded-xl object-contain"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}

export default TeachingMaterialShow;
