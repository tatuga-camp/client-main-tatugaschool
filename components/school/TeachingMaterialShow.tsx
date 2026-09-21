import { filesize } from "filesize";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import {
  MdDownload,
  MdEdit,
  MdOutlineDescription,
  MdOutlineImage,
  MdOutlineInsertDriveFile,
  MdOutlineMenuBook,
  MdOutlineOpenInNew,
  MdOutlinePictureAsPdf,
} from "react-icons/md";
import { SiCanva } from "react-icons/si";
import { TbAlertCircle } from "react-icons/tb";
import { teachingMaterialDataLanguage as L } from "../../data/languages/teaching-material";
import {
  useGetLanguage,
  useGetTeachingMaterial,
  useGetUser,
} from "../../react-query";
import LinkPreview from "../common/LinkPreview";
import LoadingBar from "../common/LoadingBar";
import TeachingMaterialSection from "./TeachingMaterialSection";

type Props = {
  id: string;
  onClose: () => void;
};

// `type` is a MIME type ("application/pdf", "image/png"); the display
// extension comes from the file name in the URL.
const fileKind = (mime: string): "pdf" | "image" | "other" => {
  const lower = (mime ?? "").toLowerCase();
  if (lower.includes("pdf")) return "pdf";
  if (lower.startsWith("image/")) return "image";
  return "other";
};
const fileNameFromUrl = (url: string): string => {
  try {
    const last = new URL(url).pathname.split("/").pop() ?? "";
    return decodeURIComponent(last) || url;
  } catch {
    return url.split("/").pop() || url;
  }
};
const extensionOf = (fileName: string): string => {
  const ext = fileName.includes(".") ? fileName.split(".").pop() : "";
  return (ext ?? "").toUpperCase();
};

function TeachingMaterialShow({ id, onClose }: Props) {
  const teachingMaterial = useGetTeachingMaterial({ teachingMaterialId: id });
  const user = useGetUser();
  const languageQuery = useGetLanguage();
  const language = languageQuery.data === "th" ? "th" : "en";
  const [triggerEdit, setTriggerEdit] = useState(false);

  const data = teachingMaterial.data;
  const title =
    (language === "th" ? data?.titleTH : data?.title) ||
    data?.title ||
    data?.titleTH ||
    "";
  const showCreator = Boolean(data?.creatorURL);

  if (triggerEdit) {
    return (
      <TeachingMaterialSection onClose={onClose} teachingMaterial={data} />
    );
  }

  return (
    <div className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-white font-Anuphan md:h-[90%] md:w-11/12 md:max-w-5xl md:rounded-2xl">
      {teachingMaterial.isLoading && <LoadingBar />}

      <header className="flex w-full shrink-0 items-start gap-3 border-b p-3 md:p-5">
        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-color/10 text-2xl text-primary-color sm:flex">
          <MdOutlineMenuBook />
        </div>
        <div className="flex min-w-0 grow flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
            <span>{L.detailLabel(language)}</span>
            {data?.accessLevel && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
                {data.accessLevel}
              </span>
            )}
          </div>
          <h1 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900 md:text-lg">
            {title || (teachingMaterial.isLoading ? " " : "")}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {user.data?.role === "ADMIN" && data && (
            <button
              type="button"
              onClick={() => setTriggerEdit(true)}
              className="second-button flex h-9 items-center gap-1 border px-3 py-0 text-sm"
            >
              <MdEdit className="text-base" />
              <span className="hidden sm:inline">{L.edit(language)}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onClose()}
            aria-label={L.close(language)}
            title={L.close(language)}
            className="flex h-9 w-9 items-center justify-center rounded-2xl text-xl text-gray-600 hover:bg-gray-300/50"
          >
            <IoMdClose />
          </button>
        </div>
      </header>

      <main className="flex w-full min-w-0 grow flex-col gap-5 overflow-y-auto overflow-x-hidden p-3 md:p-5">
        {teachingMaterial.error && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-error-color/40 bg-white p-6 text-center text-sm text-error-color">
            <TbAlertCircle className="shrink-0 text-lg" />
            <span>{L.detailError(language)}</span>
          </div>
        )}

        {data && (
          <>
            {(showCreator || data.canvaURL) && (
              <section className="flex flex-col gap-2">
                <h2 className="text-sm text-gray-400">{L.creator(language)}</h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {showCreator && (
                    <LinkPreview
                      title={data.createor?.title}
                      description={data.createor?.description}
                      image={data.createor?.image}
                      url={data.creatorURL}
                    />
                  )}
                  {data.canvaURL && (
                    <a
                      href={data.canvaURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="second-button flex h-9 w-full shrink-0 items-center justify-center gap-2 border py-0 text-sm sm:w-auto"
                    >
                      <SiCanva className="text-base text-icon-color" />
                      {L.openInCanva(language)}
                    </a>
                  )}
                </div>
              </section>
            )}

            {data.tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {data.tags.map((tag, index) => (
                  <li
                    key={index}
                    className="max-w-full truncate rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            <section className="flex flex-col gap-3">
              <h2 className="text-sm text-gray-400">
                {L.files(language)}
                {data.files.length > 0 && (
                  <span className="ml-1 text-gray-400">
                    ({data.files.length})
                  </span>
                )}
              </h2>

              {data.files.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border bg-white px-4 py-8 text-center">
                  <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-color/10">
                    <MdOutlineInsertDriveFile className="text-xl text-primary-color" />
                  </span>
                  <p className="text-sm font-medium text-gray-700">
                    {L.noFiles(language)}
                  </p>
                </div>
              )}

              {data.files.map((file) => {
                const kind = fileKind(file.type);
                const fileName = fileNameFromUrl(file.url);
                const extension = extensionOf(fileName);
                const Icon =
                  kind === "pdf"
                    ? MdOutlinePictureAsPdf
                    : kind === "image"
                      ? MdOutlineImage
                      : MdOutlineDescription;
                return (
                  <article
                    key={file.id}
                    className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-white p-3 md:p-4"
                  >
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 grow items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl text-icon-color">
                          <Icon />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <p
                            title={fileName}
                            className="truncate text-sm font-medium text-gray-900 md:text-base"
                          >
                            {fileName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {filesize(file.size, { standard: "jedec" })}
                            {extension && <span> {extension}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                        {kind !== "other" && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="main-button flex h-9 items-center justify-center gap-1 py-0 text-sm"
                          >
                            <MdOutlineOpenInNew className="text-base" />
                            {L.view(language)}
                          </a>
                        )}
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={fileName}
                          className={`second-button flex h-9 items-center justify-center gap-1 border py-0 text-sm ${
                            kind === "other" ? "col-span-2" : ""
                          }`}
                        >
                          <MdDownload className="text-base" />
                          {L.download(language)}
                        </a>
                      </div>
                    </div>

                    {kind === "other" && (
                      <p className="rounded-2xl bg-gray-50 px-3 py-2 text-xs text-gray-500">
                        {L.cannotPreview(language)}
                      </p>
                    )}

                    {kind === "pdf" && (
                      <div className="w-full max-w-full overflow-hidden rounded-2xl border bg-gray-50">
                        <iframe
                          src={`${file.url}#toolbar=0`}
                          title={fileName}
                          className="block h-[60vh] w-full max-w-full md:h-[70vh]"
                        />
                      </div>
                    )}

                    {kind === "image" && (
                      <div className="flex w-full max-w-full items-center justify-center overflow-hidden rounded-2xl border bg-gray-50 p-2">
                        <img
                          src={file.url}
                          alt={fileName}
                          loading="lazy"
                          className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain md:max-h-[70vh]"
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default TeachingMaterialShow;
