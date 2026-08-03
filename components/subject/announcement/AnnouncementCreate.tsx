import { Toast } from "primereact/toast";
import React from "react";
import { FiCheck, FiPaperclip, FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { announcementDataLanguage } from "../../../data/languages";
import { ErrorMessages } from "../../../interfaces";
import { useCreateAnnouncement, useGetLanguage } from "../../../react-query";
import { Announcement, CreateFileOnAnnouncementService } from "../../../services";
import {
  getSignedURLTeacherService,
  UploadSignURLWithProgressService,
} from "../../../services/google-storage";
import TextEditor from "../../common/TextEditor";

type Props = {
  subjectId: string;
  schoolId: string;
  toast: React.RefObject<Toast>;
  onClose: () => void;
};

type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
};

function newItemId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function AnnouncementCreate({ subjectId, schoolId, toast, onClose }: Props) {
  const language = useGetLanguage();
  const createAnnouncement = useCreateAnnouncement();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  // Persists the announcement created by a previous (partially failed) submit
  // attempt so a retry resumes the remaining uploads instead of creating a
  // duplicate announcement.
  const createdRef = React.useRef<Announcement | null>(null);

  const patchItem = (id: string, patch: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const announcement =
        createdRef.current ??
        (await createAnnouncement.mutateAsync({
          title: title.trim(),
          content,
          subjectId,
        }));
      createdRef.current = announcement;

      for (const item of items) {
        if (item.status === "done") continue;
        try {
          patchItem(item.id, { status: "uploading", progress: 0 });
          const signed = await getSignedURLTeacherService({
            fileName: item.file.name,
            fileType: item.file.type,
            fileSize: item.file.size,
            schoolId,
          });
          await UploadSignURLWithProgressService({
            contentType: signed.contentType,
            file: item.file,
            signURL: signed.signURL,
            onProgress: (progress) =>
              patchItem(item.id, { progress: Math.round(progress) }),
          });
          await CreateFileOnAnnouncementService({
            announcementId: announcement.id,
            url: signed.originalURL,
            type: item.file.type,
            name: item.file.name,
            size: item.file.size,
          });
          patchItem(item.id, { status: "done", progress: 100 });
        } catch (error) {
          patchItem(item.id, { status: "error" });
          throw error;
        }
      }

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: announcementDataLanguage.posted(language.data ?? "en"),
        life: 3000,
      });
      createdRef.current = null;
      document.body.style.overflow = "auto";
      onClose();
    } catch (error) {
      console.error(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error ? result.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 font-Anuphan">
      <form
        onSubmit={handleSubmit}
        className="mx-4 flex max-h-[90dvh] w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-2xl bg-white p-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {announcementDataLanguage.composerTitle(language.data ?? "en")}
          </h2>
          <button
            type="button"
            onClick={() => {
              document.body.style.overflow = "auto";
              onClose();
            }}
            className="text-xl text-icon-color"
          >
            <FiX />
          </button>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={announcementDataLanguage.titlePlaceholder(
            language.data ?? "en",
          )}
          className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-primary-color"
        />
        <div className="h-52 w-full">
          <TextEditor
            schoolId={schoolId}
            value={content}
            onChange={setContent}
            menubar={false}
            toolbar="undo redo | bold italic | bullist numlist | link"
          />
        </div>
        <label className="flex w-max cursor-pointer items-center gap-2 text-sm text-primary-color">
          <FiPaperclip />
          {announcementDataLanguage.attachFiles(language.data ?? "en")}
          <input
            type="file"
            multiple
            hidden
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []).map((file) => ({
                id: newItemId(),
                file,
                progress: 0,
                status: "pending" as const,
              }));
              setItems((prev) => [...prev, ...picked]);
              e.target.value = "";
            }}
          />
        </label>
        {items.length > 0 && (
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li
                key={item.id}
                className={`flex flex-col gap-1 rounded-lg border p-2 text-xs ${
                  item.status === "error" ? "border-error-color" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{item.file.name}</span>
                  {item.status === "done" ? (
                    <FiCheck className="shrink-0 text-success-color" />
                  ) : item.status === "uploading" ? (
                    <span className="shrink-0 text-gray-500">
                      {item.progress}%
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setItems((prev) =>
                          prev.filter((f) => f.id !== item.id),
                        )
                      }
                    >
                      <FiX />
                    </button>
                  )}
                </div>
                {(item.status === "uploading" || item.status === "done") && (
                  <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.status === "done"
                          ? "bg-success-color"
                          : "bg-primary-color"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === "error" && (
                  <span className="text-[10px] text-error-color">
                    {announcementDataLanguage.uploadFailedRetry(
                      language.data ?? "en",
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="rounded-full bg-primary-color px-6 py-2 text-sm text-white hover:bg-primary-color-hover disabled:opacity-50"
        >
          {loading
            ? announcementDataLanguage.posting(language.data ?? "en")
            : announcementDataLanguage.post(language.data ?? "en")}
        </button>
      </form>
    </div>
  );
}

export default AnnouncementCreate;
