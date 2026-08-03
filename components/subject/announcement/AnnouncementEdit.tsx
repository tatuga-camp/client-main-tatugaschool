import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { FiCheck, FiEdit2, FiPaperclip, FiTrash2, FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { announcementDataLanguage } from "../../../data/languages";
import { ErrorMessages } from "../../../interfaces";
import { useGetLanguage, useUpdateAnnouncement } from "../../../react-query";
import {
  Announcement,
  DeleteFileOnAnnouncementService,
  FileOnAnnouncement,
  UpdateFileOnAnnouncementService,
} from "../../../services";
import TextEditor from "../../common/TextEditor";

type Props = {
  announcement: Announcement;
  onClose: () => void;
};

function showError(error: unknown) {
  console.error(error);
  const result = error as ErrorMessages;
  Swal.fire({
    title: result?.error ? result.error : "Something Went Wrong",
    text: result?.message?.toString(),
    footer: result?.statusCode
      ? "Code Error: " + result.statusCode?.toString()
      : "",
    icon: "error",
  });
}

function AnnouncementEdit({ announcement, onClose }: Props) {
  const language = useGetLanguage();
  const queryClient = useQueryClient();
  const updateAnnouncement = useUpdateAnnouncement();
  const [title, setTitle] = React.useState(announcement.title);
  const [content, setContent] = React.useState(announcement.content);
  const [files, setFiles] = React.useState<FileOnAnnouncement[]>(
    announcement.files,
  );
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [fileBusyId, setFileBusyId] = React.useState<string | null>(null);

  const refreshFeed = () => {
    queryClient.invalidateQueries({
      queryKey: ["announcements-teacher", { subjectId: announcement.subjectId }],
    });
  };

  const handleRename = async (file: FileOnAnnouncement) => {
    const name = renameValue.trim();
    if (!name || name === file.name) {
      setRenamingId(null);
      return;
    }
    setFileBusyId(file.id);
    try {
      const updated = await UpdateFileOnAnnouncementService({
        query: { fileOnAnnouncementId: file.id },
        body: { name },
      });
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, name: updated.name } : f)),
      );
      setRenamingId(null);
      refreshFeed();
    } catch (error) {
      showError(error);
    } finally {
      setFileBusyId(null);
    }
  };

  const handleDeleteFile = async (file: FileOnAnnouncement) => {
    const confirm = await Swal.fire({
      title: announcementDataLanguage.deleteFileConfirm(language.data ?? "en"),
      text: file.name ?? file.url,
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    setFileBusyId(file.id);
    try {
      await DeleteFileOnAnnouncementService({ fileOnAnnouncementId: file.id });
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      refreshFeed();
    } catch (error) {
      showError(error);
    } finally {
      setFileBusyId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    try {
      await updateAnnouncement.mutateAsync({
        query: { announcementId: announcement.id },
        body: { title: title.trim(), content },
      });
      document.body.style.overflow = "auto";
      onClose();
    } catch (error) {
      showError(error);
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
            {announcementDataLanguage.editComposerTitle(language.data ?? "en")}
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
            schoolId={announcement.schoolId}
            value={content}
            onChange={setContent}
            menubar={false}
            toolbar="undo redo | bold italic | bullist numlist | link"
          />
        </div>
        {files.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
              <FiPaperclip />
              {announcementDataLanguage.attachments(language.data ?? "en")}
            </span>
            <ul className="flex flex-col gap-1">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-2 text-xs"
                >
                  {renamingId === file.id ? (
                    <>
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleRename(file);
                          }
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        className="flex-1 rounded border px-2 py-1 outline-none focus:border-primary-color"
                      />
                      <button
                        type="button"
                        disabled={fileBusyId === file.id}
                        onClick={() => handleRename(file)}
                        title={announcementDataLanguage.rename(
                          language.data ?? "en",
                        )}
                        className="shrink-0 text-success-color disabled:opacity-50"
                      >
                        <FiCheck />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="shrink-0 text-gray-400"
                      >
                        <FiX />
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 truncate text-primary-color hover:underline"
                      >
                        {file.name ?? file.url}
                      </a>
                      <button
                        type="button"
                        disabled={fileBusyId === file.id}
                        onClick={() => {
                          setRenamingId(file.id);
                          setRenameValue(file.name ?? "");
                        }}
                        title={announcementDataLanguage.rename(
                          language.data ?? "en",
                        )}
                        className="shrink-0 text-icon-color hover:text-primary-color disabled:opacity-50"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        disabled={fileBusyId === file.id}
                        onClick={() => handleDeleteFile(file)}
                        title={announcementDataLanguage.delete(
                          language.data ?? "en",
                        )}
                        className="shrink-0 text-icon-color hover:text-error-color disabled:opacity-50"
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          type="submit"
          disabled={
            updateAnnouncement.isPending || !title.trim() || !content.trim()
          }
          className="rounded-full bg-primary-color px-6 py-2 text-sm text-white hover:bg-primary-color-hover disabled:opacity-50"
        >
          {updateAnnouncement.isPending
            ? announcementDataLanguage.saving(language.data ?? "en")
            : announcementDataLanguage.saveChanges(language.data ?? "en")}
        </button>
      </form>
    </div>
  );
}

export default AnnouncementEdit;
