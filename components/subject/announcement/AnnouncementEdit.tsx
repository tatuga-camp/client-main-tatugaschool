import React from "react";
import { FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { announcementDataLanguage } from "../../../data/languages";
import { ErrorMessages } from "../../../interfaces";
import { useGetLanguage, useUpdateAnnouncement } from "../../../react-query";
import { Announcement } from "../../../services";
import TextEditor from "../../common/TextEditor";

type Props = {
  announcement: Announcement;
  onClose: () => void;
};

// Edits title/content only. Attachments are not editable here — deleting an
// attachment goes through DeleteFileOnAnnouncementService, unused by this
// composer for now.
function AnnouncementEdit({ announcement, onClose }: Props) {
  const language = useGetLanguage();
  const updateAnnouncement = useUpdateAnnouncement();
  const [title, setTitle] = React.useState(announcement.title);
  const [content, setContent] = React.useState(announcement.content);

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
