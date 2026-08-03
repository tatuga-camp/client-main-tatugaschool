import { Toast } from "primereact/toast";
import React from "react";
import { FiPaperclip, FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { announcementDataLanguage } from "../../../data/languages";
import { ErrorMessages } from "../../../interfaces";
import { useCreateAnnouncement, useGetLanguage } from "../../../react-query";
import { Announcement, CreateFileOnAnnouncementService } from "../../../services";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../../services/google-storage";
import TextEditor from "../../common/TextEditor";

type Props = {
  subjectId: string;
  schoolId: string;
  toast: React.RefObject<Toast>;
  onClose: () => void;
};

function AnnouncementCreate({ subjectId, schoolId, toast, onClose }: Props) {
  const language = useGetLanguage();
  const createAnnouncement = useCreateAnnouncement();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);
  // Persists the announcement created by a previous (partially failed) submit
  // attempt so a retry resumes the remaining uploads instead of creating a
  // duplicate announcement.
  const createdRef = React.useRef<Announcement | null>(null);

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

      for (const file of files) {
        const signed = await getSignedURLTeacherService({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          schoolId,
        });
        await UploadSignURLService({
          contentType: signed.contentType,
          file,
          signURL: signed.signURL,
        });
        await CreateFileOnAnnouncementService({
          announcementId: announcement.id,
          url: signed.originalURL,
          type: file.type,
          name: file.name,
          size: file.size,
        });
        setFiles((prev) => prev.filter((f) => f !== file));
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
            onChange={(e) =>
              setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])
            }
          />
        </label>
        {files.length > 0 && (
          <ul className="flex flex-col gap-1">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg border p-2 text-xs"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <FiX />
                </button>
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
