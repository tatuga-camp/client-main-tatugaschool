import { filesize } from "filesize";
import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import {
  MdAdd,
  MdAttachFile,
  MdCloudUpload,
  MdFileOpen,
  MdFolder,
  MdOutlineFormatAlignLeft,
  MdSubscriptions,
  MdTag,
  MdTitle,
} from "react-icons/md";
import { SiGooglegemini } from "react-icons/si";
import Swal from "sweetalert2";
import {
  ErrorMessages,
  FileOnTeachingMaterial,
  Plan,
  TeachingMaterial,
} from "../../interfaces";
import {
  useCreateFileTeachingMareial,
  useCreateTeachingMaterial,
  useDeleteFileTeachingMareial,
  useGetSuggestionTeachingMaterial,
  useGetUser,
  useUpdateTeachingMaterial,
  useUpdateThumnailTeachingMaterial,
} from "../../react-query";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services";
import LoadingSpinner from "../common/LoadingSpinner";

const suggestedTags = [
  "Math",
  "English",
  "Elementry Student",
  "High School Student",
  "Worksheet",
];
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

const plans = ["FREE", "PREMIUM", "ENTERPRISE"] as const;
const getRandomColorClass = () =>
  tagColorClasses[Math.floor(Math.random() * tagColorClasses.length)];

type Props = {
  onClose: () => void;
  teachingMaterial?: TeachingMaterial & { files: FileOnTeachingMaterial[] };
};
function TeachingMaterialSection({ onClose, teachingMaterial }: Props) {
  const user = useGetUser();
  const suggestion = useGetSuggestionTeachingMaterial();
  const create = useCreateTeachingMaterial();
  const update = useUpdateTeachingMaterial();
  const createFile = useCreateFileTeachingMareial();
  const deleteFile = useDeleteFileTeachingMareial();
  const updateThumnail = useUpdateThumnailTeachingMaterial();
  const [selectPlan, setSelectPlan] = useState<Plan>(
    teachingMaterial?.accessLevel ?? "PREMIUM",
  );

  const [fileOnTeachingMaterials, setFileOnTeachingMaterial] = useState(
    teachingMaterial?.files ?? [],
  );
  const [teachingMaterialData, setTeachingMaterialData] = useState<{
    title: string;
    description: string;
  }>({
    title: teachingMaterial?.title ?? "",
    description: teachingMaterial?.description ?? "",
  });
  const [selectFiles, setSelectFles] = useState<{ file: File; url?: string }[]>(
    [],
  );
  const [tags, setTags] = useState<string[]>(teachingMaterial?.tags ?? []);
  const [loadingAi, setLoadingAi] = useState(false);
  const [customTag, setCustomTag] = useState<string | null>(null);
  const [suggestedTagColors] = useState(() => {
    const colorMap: { [key: string]: string } = {};
    suggestedTags.forEach((tag) => {
      colorMap[tag] = getRandomColorClass();
    });
    return colorMap;
  });
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Convert the FileList to an array and append it to the existing state.
      // This ensures that new selections are added to the list, not replacing it.
      const newFilesArray = Array.from(files);

      // 2. Map each file to the new state structure { file: File }
      const formattedFiles = newFilesArray.map((f) => ({ file: f }));
      setSelectFles((prevFiles) => [...prevFiles, ...formattedFiles]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectFles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleDeleteFileOnTeachingMaterial = async (id: string) => {
    try {
      await deleteFile.mutateAsync({
        fileOnteachingMaterialId: id,
      });

      setFileOnTeachingMaterial((prev) => {
        return prev.filter((f) => f.id !== id);
      });
    } catch (error) {
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message?.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleAddTags = (tag: string) => {
    setTags((prev) => {
      if (prev.some((prevTag) => prevTag === tag)) {
        return prev;
      }
      return [...prev, tag];
    });
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleAiDescription = async () => {
    try {
      setLoadingAi(true);
      if (selectFiles.length === 0) {
        throw new Error("Please Upload Files");
      }
      const updatedFiles = await Promise.all(
        selectFiles.map(async (file, index) => {
          const signURL = await getSignedURLTeacherService({
            fileName: file.file.name,
            fileSize: file.file.size,
            fileType: file.file.type,
          });

          await UploadSignURLService({
            file: file.file,
            signURL: signURL.signURL,
            contentType: file.file.type,
          });

          return {
            ...file,
            url: signURL.originalURL,
          };
        }),
      );
      setSelectFles(updatedFiles);

      const data = await suggestion.mutateAsync({
        data: updatedFiles.map((f) => {
          return {
            url: f.url,
            type: f.file.type,
          };
        }),
      });
      setTeachingMaterialData((prev) => {
        return {
          ...prev,
          description: data.description,
        };
      });

      setLoadingAi(false);
    } catch (error) {
      setLoadingAi(false);

      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message?.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleCreateTeachingMaterial = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (selectFiles.some((f) => !f.url)) {
        throw new Error("Please press AI button on description");
      }
      setLoadingAi(true);

      const teachingMaterial = await create.mutateAsync({
        title: teachingMaterialData.title,
        description: teachingMaterialData.description,
        tags: tags,
        accessLevel: selectPlan,
      });

      if (selectFiles.length > 0) {
        await Promise.all(
          selectFiles.map((f) =>
            createFile.mutateAsync({
              url: f.url as string,
              type: f.file.type,
              size: f.file.size,
              teachingMaterialId: teachingMaterial.id,
            }),
          ),
        );
      }

      await updateThumnail.mutateAsync({
        teachingMaterialId: teachingMaterial.id,
      });

      Swal.fire({
        title: "Successfully",
        text: "Teaching Material Created",
        icon: "success",
      });
      setLoadingAi(false);
      onClose();
    } catch (error) {
      setLoadingAi(false);

      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message?.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleUpdateTeachingMaterial = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (selectFiles.some((f) => !f.url)) {
        throw new Error("Please press AI button on description");
      }
      if (!teachingMaterial) {
        return;
      }
      setLoadingAi(true);

      await update.mutateAsync({
        query: {
          id: teachingMaterial.id,
        },
        body: {
          title: teachingMaterialData.title,
          description: teachingMaterialData.description,
          tags: tags,
          accessLevel: selectPlan,
        },
      });

      if (selectFiles.length > 0) {
        await Promise.all(
          selectFiles.map((f) =>
            createFile.mutateAsync({
              url: f.url as string,
              type: f.file.type,
              size: f.file.size,
              teachingMaterialId: teachingMaterial.id,
            }),
          ),
        );
      }

      await updateThumnail.mutateAsync({
        teachingMaterialId: teachingMaterial.id,
      });
      Swal.fire({
        title: "Successfully",
        text: "Teaching Material Created",
        icon: "success",
      });
      setLoadingAi(false);
      onClose();
    } catch (error) {
      setLoadingAi(false);

      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message?.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <form
      onSubmit={
        teachingMaterial
          ? handleUpdateTeachingMaterial
          : handleCreateTeachingMaterial
      }
      className="flex h-[90%] w-7/12 flex-col rounded-lg bg-white"
    >
      <header className="flex w-full items-center justify-between border-b p-5">
        <section className="flex items-center justify-center gap-2">
          <div className="gradient-bg-success rounded-lg p-3 text-xl text-white">
            <MdCloudUpload />
          </div>
          <section className="flex flex-col">
            <h1 className="text-lg font-semibold">
              {teachingMaterial ? "Update" : "Create"} Teaching Material
            </h1>
            <span className="text-sm text-gray-600">
              Upload and organize your educational resources
            </span>
          </section>
        </section>
        <button
          type="button"
          onClick={() => onClose()}
          className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
        >
          <IoMdClose />
        </button>
      </header>
      <main className="flex w-full grow flex-col gap-5 overflow-auto p-5">
        <section className="w-full">
          <div className="flex w-max items-center justify-center gap-2 text-sm font-semibold">
            <MdAttachFile className="text-blue-700" />
            Upload Files
          </div>
          <label form="dropzone-file" className="mx-auto w-full cursor-pointer">
            {/* Dashed border container */}
            <div className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-8">
              {/* Icon container with gradient background */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                <MdCloudUpload className="text-blue-700" />
              </div>

              {/* Main text */}
              <p className="text-lg font-semibold text-gray-700">
                Drop files here or click to browse
              </p>

              {/* Sub text */}
              <p className="mt-1 text-sm text-gray-500">
                Support: PDF, DOC, PPT, XLS, Images, Videos (Max 100MB each)
              </p>

              {/* Button */}
              <div className="mt-6 flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-base font-medium text-white shadow-md transition-all duration-300 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
                <MdFolder />
                Choose Files
              </div>
              <input
                onChange={handleFileChange}
                multiple
                id="dropzone-file"
                type="file"
                className="hidden"
              />
            </div>
          </label>
        </section>
        <section className="w-full">
          <span>Selected Files:</span>
          <ul className="grid w-full gap-2">
            {[...selectFiles, ...fileOnTeachingMaterials].map((file, index) => {
              const fileToProcess = "file" in file ? file.file : file; // This line might be needed if item itself could be a File

              // Ensure fileToProcess is a File object before accessing name and size
              if (!(fileToProcess instanceof File)) {
                const name =
                  fileToProcess.url.split("/")[
                    fileToProcess.url.split("/").length - 1
                  ];
                return (
                  <li
                    key={index}
                    className="flex w-full items-center justify-between rounded-lg border bg-gray-100 p-1 px-3"
                  >
                    <a
                      href={fileToProcess.url}
                      target="_blank"
                      className="flex items-center justify-center gap-2 text-gray-500"
                    >
                      <MdFileOpen className="mr-3" />
                      <section className="flex flex-col gap-0">
                        <div className="max-w-96 truncate text-sm">
                          {name} {/* Access directly */}
                        </div>
                        <span className="text-xs">
                          {filesize(fileToProcess.size, {
                            standard: "jedec",
                          })}
                        </span>
                      </section>
                    </a>
                    <button
                      onClick={() =>
                        handleDeleteFileOnTeachingMaterial(fileToProcess.id)
                      }
                      disabled={deleteFile.isPending}
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded text-sm font-semibold hover:bg-gray-300/50"
                    >
                      <IoMdClose />
                    </button>
                  </li>
                );
              }
              return (
                <li
                  key={index}
                  className="flex w-full items-center justify-between rounded-lg border bg-gray-100 p-1 px-3"
                >
                  <section className="flex items-center justify-center gap-2 text-gray-500">
                    <MdFileOpen className="mr-3" />
                    <section className="flex flex-col gap-0">
                      <div className="max-w-96 truncate text-sm">
                        {fileToProcess.name} {/* Access directly */}
                      </div>
                      <span className="text-xs">
                        {filesize(fileToProcess.size, {
                          standard: "jedec",
                        })}
                      </span>
                    </section>
                  </section>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded text-sm font-semibold hover:bg-gray-300/50"
                  >
                    <IoMdClose />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="flex flex-col gap-2">
          <div className="flex w-max items-center justify-center gap-2 text-sm font-semibold">
            <MdSubscriptions className="text-blue-700" /> Access Level
          </div>
          <select
            value={selectPlan}
            onChange={(e) => {
              setSelectPlan(e.target.value as Plan);
            }}
            className="main-input"
          >
            {plans.map((plan) => {
              return (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              );
            })}
          </select>
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex w-max items-center justify-center gap-2 text-sm font-semibold">
            <MdTitle className="text-blue-700" /> Title
          </div>
          <input
            required
            value={teachingMaterialData.title}
            onChange={(e) =>
              setTeachingMaterialData((prev) => {
                return {
                  ...prev,
                  title: e.target.value,
                };
              })
            }
            className="main-input"
            placeholder="Enter a descriptive title for your teaching material"
          />
        </section>
        <section className="flex flex-col gap-2">
          <div className="flex w-max items-center justify-center gap-2 text-sm font-semibold">
            <MdTag className="text-orange-700" /> Tags
          </div>
          <div className="flex w-max items-center justify-center gap-2">
            <input
              value={customTag ?? ""}
              onChange={(e) => setCustomTag(e.target.value)}
              className="main-input w-40"
              placeholder="Enter tags name"
            />
            <button
              onClick={() => {
                if (!customTag) return;
                handleAddTags(customTag);
                setCustomTag(null);
              }}
              type="button"
              className="second-button h-10 border"
            >
              <MdAdd />
            </button>
          </div>
          <ul className="flex h-max min-h-10 w-full flex-wrap items-center justify-start gap-2 rounded-lg border bg-gray-100 p-3">
            {tags.map((tag, index) => {
              return (
                <li
                  key={index}
                  className={`flex items-center justify-center rounded-md bg-blue-200 py-1 pl-3 pr-1 text-xs font-medium text-blue-700`}
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(index)}
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded text-sm font-semibold hover:bg-gray-300/50"
                  >
                    <IoMdClose />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-start gap-2">
            <span>Suggested tags: </span>
            {suggestedTags.map((tag, index) => {
              return (
                <button
                  type="button"
                  onClick={() => handleAddTags(tag)}
                  key={index}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-transform hover:scale-105 ${suggestedTagColors[tag]}`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <div className="flex w-full justify-between">
            <div className="flex w-max items-center justify-center gap-2 text-sm font-semibold">
              <MdOutlineFormatAlignLeft className="text-blue-700" /> Description
            </div>
            <button
              type="button"
              disabled={loadingAi}
              onClick={() => handleAiDescription()}
              className="gradient-bg-success flex h-7 w-32 items-center justify-center rounded-lg border px-2 text-white hover:scale-105 active:scale-110"
            >
              {loadingAi ? (
                <LoadingSpinner />
              ) : (
                <>
                  <SiGooglegemini /> AI Generate
                </>
              )}
            </button>
          </div>
          <textarea
            value={teachingMaterialData.description}
            onChange={(e) => {
              setTeachingMaterialData((prev) => {
                return {
                  ...prev,
                  description: e.target.value,
                };
              });
            }}
            className="main-input h-96 resize-none"
          />
        </section>
      </main>
      <footer className="flex h-40 items-center justify-end gap-2 border-t p-5">
        <button
          onClick={() => onClose()}
          type="button"
          className="second-button flex w-40 items-center justify-center gap-1 border"
        >
          Cancel
        </button>
        <button
          disabled={loadingAi}
          type="submit"
          className="main-button flex w-40 items-center justify-center gap-1"
        >
          {loadingAi ? (
            <LoadingSpinner />
          ) : (
            <>
              <FiPlus /> {teachingMaterial ? "Update" : "Create"}
            </>
          )}
        </button>
      </footer>
    </form>
  );
}

export default TeachingMaterialSection;
