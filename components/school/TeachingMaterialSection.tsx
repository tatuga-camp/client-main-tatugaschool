import { filesize } from "filesize";
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import {
  MdAdd,
  MdAutoAwesome,
  MdOutlineDescription,
  MdOutlineUploadFile,
} from "react-icons/md";
import Swal from "sweetalert2";
import { teachingMaterialDataLanguage as L } from "../../data/languages/teaching-material";
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
  useGetLanguage,
  useGetSuggestionTeachingMaterial,
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
  "Thai Subject",
  "Classroom Decoration",
  "Elementary Student",
  "High School Student",
  "Worksheet",
];

const plans = ["FREE", "PREMIUM", "ENTERPRISE"] as const;

const fileNameFromUrl = (url: string): string => {
  try {
    const last = new URL(url).pathname.split("/").pop() ?? "";
    return decodeURIComponent(last) || url;
  } catch {
    return url.split("/").pop() || url;
  }
};

const labelClass = "text-sm text-gray-400";
const sectionTitleClass = "text-sm font-semibold text-gray-700";

type Props = {
  onClose: () => void;
  teachingMaterial?: TeachingMaterial & { files: FileOnTeachingMaterial[] };
};
function TeachingMaterialSection({ onClose, teachingMaterial }: Props) {
  const suggestion = useGetSuggestionTeachingMaterial();
  const languageQuery = useGetLanguage();
  const language = languageQuery.data === "th" ? "th" : "en";
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
    titleTH: string;
    description: string;
    creatorURL: string;
    canvaURL: string;
  }>({
    title: teachingMaterial?.title ?? "",
    titleTH: teachingMaterial?.titleTH ?? "",
    description: teachingMaterial?.description ?? "",
    creatorURL: teachingMaterial?.creatorURL ?? "",
    canvaURL: teachingMaterial?.canvaURL ?? "",
  });
  const [selectFiles, setSelectFles] = useState<{ file: File; url?: string }[]>(
    [],
  );
  const [tags, setTags] = useState<string[]>(teachingMaterial?.tags ?? []);
  const [loadingAi, setLoadingAi] = useState(false);
  const [customTag, setCustomTag] = useState<string | null>(null);
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

  // Uploads every picked file that has no URL yet and returns the full list
  // with URLs filled in. Already-uploaded files are left untouched, so calling
  // this twice never re-sends anything.
  const uploadPendingFiles = async () => {
    const uploaded = await Promise.all(
      selectFiles.map(async (file) => {
        if (file.url) return file;
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
        return { ...file, url: signURL.originalURL };
      }),
    );
    setSelectFles(uploaded);
    return uploaded as { file: File; url: string }[];
  };

  const handleAiDescription = async () => {
    try {
      setLoadingAi(true);
      if (selectFiles.length === 0) {
        throw new Error("Please Upload Files");
      }
      const updatedFiles = await uploadPendingFiles();

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
          title: data.title,
          titleTH: data.titleTH,
          description: data.description,
        };
      });
      setTags(data.keywords);

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
      setLoadingAi(true);
      const uploadedFiles = await uploadPendingFiles();

      const teachingMaterial = await create.mutateAsync({
        title: teachingMaterialData.title,
        titleTH: teachingMaterialData.titleTH,
        description: teachingMaterialData.description,
        tags: tags,
        creatorURL: teachingMaterialData.creatorURL,
        accessLevel: selectPlan,
        ...(teachingMaterialData.canvaURL !== "" && {
          canvaURL: teachingMaterialData.canvaURL,
        }),
      });

      if (uploadedFiles.length > 0) {
        await Promise.all(
          uploadedFiles.map((f) =>
            createFile.mutateAsync({
              url: f.url,
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
      if (!teachingMaterial) {
        return;
      }
      setLoadingAi(true);
      const uploadedFiles = await uploadPendingFiles();

      await update.mutateAsync({
        query: {
          id: teachingMaterial.id,
        },
        body: {
          title: teachingMaterialData.title,
          titleTH: teachingMaterialData.titleTH,
          description: teachingMaterialData.description,
          tags: tags,
          accessLevel: selectPlan,
          creatorURL: teachingMaterialData.creatorURL,
          ...(teachingMaterialData.canvaURL !== "" && {
            canvaURL: teachingMaterialData.canvaURL,
          }),
        },
      });

      if (uploadedFiles.length > 0) {
        await Promise.all(
          uploadedFiles.map((f) =>
            createFile.mutateAsync({
              url: f.url,
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

  const isEdit = Boolean(teachingMaterial);
  const busy = loadingAi;

  return (
    <form
      onSubmit={
        teachingMaterial
          ? handleUpdateTeachingMaterial
          : handleCreateTeachingMaterial
      }
      className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-white font-Anuphan md:h-[90%] md:w-11/12 md:max-w-3xl md:rounded-2xl"
    >
      <header className="flex w-full shrink-0 items-start gap-3 border-b p-3 md:p-5">
        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-color/10 text-2xl text-primary-color sm:flex">
          <MdOutlineUploadFile />
        </div>
        <div className="flex min-w-0 grow flex-col">
          <h1 className="text-base font-semibold text-gray-900 md:text-lg">
            {isEdit ? L.formEditTitle(language) : L.formCreateTitle(language)}
          </h1>
          <p className="text-xs text-gray-400 md:text-sm">
            {L.formSubtitle(language)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onClose()}
          aria-label={L.close(language)}
          title={L.close(language)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xl text-gray-600 hover:bg-gray-300/50"
        >
          <IoMdClose />
        </button>
      </header>

      <main className="flex w-full min-w-0 grow flex-col gap-5 overflow-y-auto overflow-x-hidden p-3 md:p-5">
        <section className="flex flex-col gap-2">
          <h2 className={sectionTitleClass}>{L.files(language)}</h2>
          <label
            htmlFor="dropzone-file"
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition hover:border-primary-color/60 hover:bg-primary-color/5"
          >
            <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-color/10 text-xl text-primary-color">
              <MdOutlineUploadFile />
            </span>
            <span className="text-sm font-medium text-gray-700">
              {L.dropTitle(language)}
            </span>
            <span className="max-w-md text-xs text-gray-400">
              {L.dropHint(language)}
            </span>
            <span className="second-button mt-2 border text-sm">
              {L.chooseFiles(language)}
            </span>
            <input
              onChange={handleFileChange}
              multiple
              id="dropzone-file"
              type="file"
              className="hidden"
            />
          </label>

          {(selectFiles.length > 0 || fileOnTeachingMaterials.length > 0) && (
            <ul className="flex flex-col gap-2">
              {selectFiles.map((item, index) => (
                <li
                  key={`new-${index}`}
                  className="flex min-w-0 items-center gap-3 rounded-2xl border bg-white px-3 py-2"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-icon-color">
                    <MdOutlineDescription />
                  </span>
                  <div className="flex min-w-0 grow flex-col">
                    <span
                      title={item.file.name}
                      className="truncate text-sm text-gray-900"
                    >
                      {item.file.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {filesize(item.file.size, { standard: "jedec" })}
                      {item.url && (
                        <span className="ml-2 text-success-color">
                          {L.uploaded(language)}
                        </span>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    type="button"
                    aria-label={L.remove(language)}
                    title={L.remove(language)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-base text-gray-500 hover:bg-gray-300/50"
                  >
                    <IoMdClose />
                  </button>
                </li>
              ))}
              {fileOnTeachingMaterials.map((file) => {
                const name = fileNameFromUrl(file.url);
                return (
                  <li
                    key={file.id}
                    className="flex min-w-0 items-center gap-3 rounded-2xl border bg-white px-3 py-2"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-icon-color">
                      <MdOutlineDescription />
                    </span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 grow flex-col hover:underline"
                    >
                      <span
                        title={name}
                        className="truncate text-sm text-gray-900"
                      >
                        {name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {filesize(file.size, { standard: "jedec" })}
                      </span>
                    </a>
                    <button
                      onClick={() =>
                        handleDeleteFileOnTeachingMaterial(file.id)
                      }
                      disabled={deleteFile.isPending}
                      type="button"
                      aria-label={L.remove(language)}
                      title={L.remove(language)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-base text-gray-500 hover:bg-gray-300/50 disabled:opacity-50"
                    >
                      <IoMdClose />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              disabled={busy || selectFiles.length === 0}
              onClick={() => handleAiDescription()}
              className="second-button flex h-9 w-full items-center justify-center gap-2 border py-0 text-sm text-primary-color disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {busy ? (
                <LoadingSpinner />
              ) : (
                <>
                  <MdAutoAwesome className="text-base" />
                  {L.suggestFromFiles(language)}
                </>
              )}
            </button>
            <span className="text-xs text-gray-400">
              {L.suggestHint(language)}
            </span>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col">
            <span className={labelClass}>{L.titleEn(language)}</span>
            <input
              required
              value={teachingMaterialData.title}
              onChange={(e) =>
                setTeachingMaterialData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="main-input w-full"
              placeholder={L.titleEnPlaceholder(language)}
            />
          </label>
          <label className="flex min-w-0 flex-col">
            <span className={labelClass}>{L.titleTh(language)}</span>
            <input
              required
              value={teachingMaterialData.titleTH}
              onChange={(e) =>
                setTeachingMaterialData((prev) => ({
                  ...prev,
                  titleTH: e.target.value,
                }))
              }
              className="main-input w-full"
              placeholder={L.titleThPlaceholder(language)}
            />
          </label>
          <label className="flex min-w-0 flex-col">
            <span className={labelClass}>{L.accessLevel(language)}</span>
            <select
              value={selectPlan}
              onChange={(e) => setSelectPlan(e.target.value as Plan)}
              className="main-select w-full border"
            >
              {plans.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col">
            <span className={labelClass}>{L.creatorUrl(language)}</span>
            <input
              type="url"
              required
              value={teachingMaterialData.creatorURL}
              onChange={(e) =>
                setTeachingMaterialData((prev) => ({
                  ...prev,
                  creatorURL: e.target.value,
                }))
              }
              className="main-input w-full"
              placeholder={L.urlPlaceholder(language)}
            />
          </label>
          <label className="flex min-w-0 flex-col sm:col-span-2">
            <span className={labelClass}>{L.canvaUrl(language)}</span>
            <input
              type="url"
              value={teachingMaterialData.canvaURL}
              onChange={(e) =>
                setTeachingMaterialData((prev) => ({
                  ...prev,
                  canvaURL: e.target.value,
                }))
              }
              className="main-input w-full"
              placeholder={L.urlPlaceholder(language)}
            />
          </label>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className={sectionTitleClass}>{L.tags(language)}</h2>
          <div className="flex w-full gap-2">
            <input
              value={customTag ?? ""}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (!customTag) return;
                handleAddTags(customTag);
                setCustomTag(null);
              }}
              className="main-input min-w-0 grow sm:max-w-xs"
              placeholder={L.tagPlaceholder(language)}
            />
            <button
              onClick={() => {
                if (!customTag) return;
                handleAddTags(customTag);
                setCustomTag(null);
              }}
              type="button"
              className="second-button flex shrink-0 items-center gap-1 border text-sm"
            >
              <MdAdd className="text-base" />
              {L.addTag(language)}
            </button>
          </div>
          <ul className="flex min-h-12 w-full flex-wrap items-center gap-1.5 rounded-2xl border bg-gray-50 p-2">
            {tags.length === 0 && (
              <li className="px-1 text-xs text-gray-400">
                {L.noTags(language)}
              </li>
            )}
            {tags.map((tag, index) => (
              <li
                key={index}
                className="flex max-w-full items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs text-gray-600 ring-1 ring-gray-200"
              >
                <span className="truncate">{tag}</span>
                <button
                  onClick={() => handleRemoveTag(index)}
                  type="button"
                  aria-label={L.remove(language)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sm text-gray-500 hover:bg-gray-200"
                >
                  <IoMdClose />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-gray-400">{L.suggestedTags(language)}</span>
            {suggestedTags.map((tag) => {
              const active = tags.includes(tag);
              return (
                <button
                  type="button"
                  onClick={() => handleAddTags(tag)}
                  key={tag}
                  disabled={active}
                  className={`rounded-full border px-3 py-1 transition ${
                    active
                      ? "border-primary-color/60 bg-primary-color/10 text-primary-color"
                      : "bg-white text-gray-600 hover:border-primary-color/60 hover:text-primary-color"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        <label className="flex flex-col">
          <span className={sectionTitleClass}>
            {L.descriptionLabel(language)}
          </span>
          <textarea
            value={teachingMaterialData.description}
            onChange={(e) =>
              setTeachingMaterialData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={6}
            className="main-input mt-2 min-h-32 w-full resize-y"
            placeholder={L.descriptionPlaceholder(language)}
          />
        </label>
      </main>

      <footer className="flex shrink-0 flex-col-reverse gap-2 border-t p-3 sm:flex-row sm:justify-end md:p-5">
        <button
          onClick={() => onClose()}
          type="button"
          className="second-button flex w-full items-center justify-center border sm:w-40"
        >
          {L.cancel(language)}
        </button>
        <button
          disabled={busy}
          type="submit"
          className="main-button flex w-full items-center justify-center gap-1 disabled:cursor-not-allowed disabled:opacity-60 sm:w-40"
        >
          {busy ? (
            <LoadingSpinner />
          ) : isEdit ? (
            L.saveUpdate(language)
          ) : (
            L.saveCreate(language)
          )}
        </button>
      </footer>
    </form>
  );
}

export default TeachingMaterialSection;
