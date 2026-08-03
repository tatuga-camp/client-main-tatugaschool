import Image from "next/image";
import parse from "html-react-parser";
import React from "react";
import { FiPaperclip, FiTrash2 } from "react-icons/fi";
import { IoChatbubbleOutline, IoMegaphoneOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import { announcementDataLanguage } from "../../../data/languages";
import { ErrorMessages } from "../../../interfaces";
import {
  useCreateAnnouncementCommentTeacher,
  useDeleteAnnouncement,
  useDeleteAnnouncementCommentTeacher,
  useGetAnnouncementCommentsTeacher,
  useGetLanguage,
  useToggleAnnouncementReactionTeacher,
} from "../../../react-query";
import { Announcement } from "../../../services";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "🎉"];

type Props = {
  announcement: Announcement;
  subjectId: string;
  userId: string;
};

function AnnouncementCard({ announcement, subjectId, userId }: Props) {
  const language = useGetLanguage();
  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const deleteAnnouncement = useDeleteAnnouncement();
  const toggleReaction = useToggleAnnouncementReactionTeacher({ subjectId });
  const comments = useGetAnnouncementCommentsTeacher({
    announcementId: announcement.id,
  });
  const createComment = useCreateAnnouncementCommentTeacher();
  const deleteComment = useDeleteAnnouncementCommentTeacher();

  const myReaction = announcement.reactions.find((r) => r.userId === userId);
  const reactionCounts = announcement.reactions.reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const showError = (error: unknown) => {
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
  };

  const handleDelete = async () => {
    const { isConfirmed } = await Swal.fire({
      title: announcementDataLanguage.deleteAnnouncementConfirm(
        language.data ?? "en",
      ),
      icon: "warning",
      showCancelButton: true,
    });
    if (!isConfirmed) return;
    try {
      await deleteAnnouncement.mutateAsync({ announcementId: announcement.id });
    } catch (error) {
      showError(error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await createComment.mutateAsync({
        announcementId: announcement.id,
        content: commentText.trim(),
      });
      setCommentText("");
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteComment = async (commentOnAnnouncementId: string) => {
    try {
      await deleteComment.mutateAsync({ commentOnAnnouncementId });
    } catch (error) {
      showError(error);
    }
  };

  return (
    <li className="w-full rounded-2xl border border-primary-color/20 bg-white p-4 font-Anuphan shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-color/10 text-primary-color">
            {announcement.photo ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  fill
                  sizes="40px"
                  src={announcement.photo}
                  alt={announcement.firstName}
                  className="object-cover"
                />
              </div>
            ) : (
              <IoMegaphoneOutline />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {announcement.firstName} {announcement.lastName}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(announcement.createAt).toLocaleString()}
            </span>
          </div>
        </div>
        <button
          disabled={deleteAnnouncement.isPending}
          onClick={handleDelete}
          className="text-icon-color hover:text-error-color disabled:opacity-50"
          title={announcementDataLanguage.delete(language.data ?? "en")}
        >
          <FiTrash2 />
        </button>
      </div>

      <h3 className="mt-3 text-base font-semibold">{announcement.title}</h3>
      <div className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
        {parse(announcement.content)}
      </div>

      {announcement.files.length > 0 && (
        <div className="mt-3 flex flex-col gap-1">
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
            <FiPaperclip />
            {announcementDataLanguage.attachments(language.data ?? "en")}
          </span>
          {announcement.files.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate rounded-lg border p-2 text-xs text-primary-color hover:bg-primary-color/5"
            >
              {file.name ?? file.url}
            </a>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {REACTION_EMOJIS.map((emoji) => {
            const count = reactionCounts[emoji] ?? 0;
            const isMine = myReaction?.emoji === emoji;
            return (
              <button
                key={emoji}
                disabled={toggleReaction.isPending}
                onClick={() =>
                  toggleReaction.mutate({
                    announcementId: announcement.id,
                    emoji,
                  })
                }
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-sm transition ${
                  isMine
                    ? "bg-primary-color/15 ring-1 ring-primary-color"
                    : "hover:bg-gray-100"
                }`}
              >
                <span>{emoji}</span>
                {count > 0 && (
                  <span className="text-xs text-gray-600">{count}</span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-color"
        >
          <IoChatbubbleOutline />
          {announcement._count.comments}{" "}
          {announcementDataLanguage.comments(language.data ?? "en")}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 border-t pt-3">
          <ul className="flex flex-col gap-2">
            {comments.data?.map((comment) => (
              <li key={comment.id} className="flex items-start gap-2 text-sm">
                <div className="flex-1 rounded-xl bg-gray-50 p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">
                      {comment.firstName} {comment.lastName}
                      {comment.userId && (
                        <span className="ml-1 rounded bg-primary-color/10 px-1 text-[10px] text-primary-color">
                          {comment.title}
                        </span>
                      )}
                    </span>
                    <button
                      disabled={deleteComment.isPending}
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-[10px] text-error-color underline disabled:opacity-50"
                    >
                      {announcementDataLanguage.delete(language.data ?? "en")}
                    </button>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">
                    {comment.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <form onSubmit={handleComment} className="mt-2 flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={announcementDataLanguage.replyAsTeacher(
                language.data ?? "en",
              )}
              className="flex-1 rounded-full border px-3 py-1.5 text-sm outline-none focus:border-primary-color"
            />
            <button
              type="submit"
              disabled={createComment.isPending || !commentText.trim()}
              className="rounded-full bg-primary-color px-4 py-1.5 text-sm text-white hover:bg-primary-color-hover disabled:opacity-50"
            >
              {announcementDataLanguage.send(language.data ?? "en")}
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

export default AnnouncementCard;
