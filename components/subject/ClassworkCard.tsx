import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { CSSProperties } from "react";
import { BiBook } from "react-icons/bi";
import { FaRegFile, FaRegFileImage } from "react-icons/fa6";
import { FiCalendar, FiChevronDown, FiPaperclip } from "react-icons/fi";
import {
  MdAssignment,
  MdChecklist,
  MdDragIndicator,
  MdLink,
  MdOndemandVideo,
} from "react-icons/md";
import {
  classworkCardDataLanguage as t,
  rubricLanguage,
} from "../../data/languages";
import { Assignment, FileOnAssignment, Language } from "../../interfaces";
import { useGetLanguage, useUpdateAssignment } from "../../react-query";
import TextEditor from "../common/TextEditor";
import AssignmentTagEditor from "./AssignmentTagEditor";

type Classwork = Assignment & {
  files: FileOnAssignment[];
  studentAssign: number;
  reviewNumber: number;
  summitNumber: number;
  penddingNumber: number;
};

type PropsClassworkCard = {
  classwork: Classwork;
  /** Import dialog: no navigation, no drag, no details; the wrapper selects. */
  disabled?: boolean;
  /** False hides the drag handle (e.g. while the list is searched/filtered). */
  reorderable?: boolean;
  selectClasswork: Assignment | null;
  subjectId: string;
  uniqueTags: string[];
  onSelect: (classwork: Assignment) => void;
};

// Static class maps: Tailwind only generates classes it can see literally.
const TYPE_TILE: Record<Assignment["type"], string> = {
  Assignment: "bg-primary-color/10 text-primary-color",
  VideoQuiz: "bg-rose-50 text-rose-500",
  Material: "bg-success-color/10 text-success-color",
};

function TypeIcon({ type }: { type: Assignment["type"] }) {
  if (type === "Material") return <BiBook />;
  if (type === "VideoQuiz") return <MdOndemandVideo />;
  return <MdAssignment />;
}

function typeLabel(type: Assignment["type"], language: Language) {
  if (type === "Material") return t.typeMaterial(language);
  if (type === "VideoQuiz") return t.typeVideoQuiz(language);
  return t.typeAssignment(language);
}

function formatDate(value: string | Date, withTime: boolean) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function hasText(html: string | null | undefined) {
  if (!html) return false;
  if (/<(img|iframe|video|table)\b/i.test(html)) return true;
  return (
    html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim() !== ""
  );
}

function fileLabel(file: FileOnAssignment) {
  if (file.type === "LINK") return file.url;
  if (file.name) return file.name;
  const last = file.url.split("/").pop() || file.url;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

function ClassworkCard({
  classwork,
  disabled = false,
  reorderable = true,
  selectClasswork,
  subjectId,
  uniqueTags,
  onSelect,
}: PropsClassworkCard) {
  const canDrag = !disabled && reorderable;
  const sortable = useSortable({ id: classwork.id, disabled: !canDrag });
  const language = useGetLanguage();
  const lang: Language = language.data ?? "en";
  const updateAssignment = useUpdateAssignment();

  const style: CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition || undefined,
    opacity: sortable.isDragging ? 0.5 : 1,
  };
  const open =
    !disabled && selectClasswork?.id === classwork.id && !sortable.isDragging;
  const isMaterial = classwork.type === "Material";
  const isDraft = classwork.status === "Draft";
  const pastDue =
    !!classwork.dueDate && new Date(classwork.dueDate).getTime() < Date.now();
  const files = classwork.files ?? [];
  const panelId = `classwork-details-${classwork.id}`;

  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      className={`relative flex w-full flex-col rounded-2xl border bg-white text-left font-Anuphan shadow-sm transition focus-within:z-20 ${
        open
          ? "border-primary-color/40 shadow-md"
          : "border-gray-200 hover:border-primary-color/40 hover:shadow-md"
      }`}
    >
      {/* Stretched link: the whole card opens the classwork. Controls that
          must keep working on their own sit above it with relative z-10. */}
      {!disabled && (
        <Link
          href={`/subject/${subjectId}/assignment/${classwork.id}`}
          aria-label={`${t.openClasswork(lang)} ${classwork.title}`}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color"
        />
      )}

      <div className="flex w-full">
        {canDrag && (
          <button
            type="button"
            ref={sortable.setActivatorNodeRef}
            {...sortable.listeners}
            {...sortable.attributes}
            aria-label={t.dragToReorder(lang)}
            title={t.dragToReorder(lang)}
            style={{ cursor: sortable.isDragging ? "grabbing" : "grab" }}
            className="relative z-10 flex w-7 shrink-0 touch-none items-center justify-center rounded-l-2xl text-lg text-gray-300 transition hover:bg-gray-50 hover:text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-color"
          >
            <MdDragIndicator />
          </button>
        )}

        <div
          className={`min-w-0 flex-1 py-4 pr-4 sm:py-5 sm:pr-5 ${canDrag ? "pl-1" : "pl-4 sm:pl-5"}`}
        >
          <header className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
                isDraft
                  ? "bg-gray-100 text-gray-400"
                  : TYPE_TILE[classwork.type]
              }`}
            >
              <TypeIcon type={classwork.type} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 break-words text-base font-semibold leading-snug text-icon-color sm:text-lg">
                {classwork.title}
              </h3>
              <p className="mt-0.5 text-xs text-gray-400">
                <span>{typeLabel(classwork.type, lang)}</span>
                <span aria-hidden> · </span>
                <span>
                  {t.postedAt(lang)} {formatDate(classwork.beginDate, true)}
                </span>
              </p>
            </div>
            <span
              className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                isDraft
                  ? "bg-gray-100 text-gray-600"
                  : "bg-success-color/10 text-success-color"
              }`}
            >
              {isDraft ? t.Draft(lang) : t.Published(lang)}
            </span>
          </header>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
            {classwork.dueDate && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                  pastDue
                    ? "bg-error-color/10 text-error-color"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <FiCalendar aria-hidden className="shrink-0" />
                <span>{t.Deadline(lang)}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(classwork.dueDate, true)}</span>
              </span>
            )}
            {!isMaterial && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                <span>{(classwork.maxScore ?? 0).toLocaleString()}</span>{" "}
                <span>{t.pointsShort(lang)}</span>
              </span>
            )}
            {!isMaterial && classwork.weight !== null && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                <span>{classwork.weight}%</span> <span>{t.weight(lang)}</span>
              </span>
            )}
            {classwork.rubricId && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary-color/40 bg-primary-color/10 px-2.5 py-1 text-primary-color">
                <MdChecklist aria-hidden className="text-sm" />
                <span>{rubricLanguage.rubricBadge(lang)}</span>
              </span>
            )}
          </div>

          <div
            className="relative z-10 mt-3 w-max max-w-full"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
          >
            <AssignmentTagEditor
              value={classwork.tags ?? []}
              suggestions={uniqueTags}
              size="sm"
              onChange={(next) =>
                updateAssignment.mutate({
                  query: { assignmentId: classwork.id },
                  data: { tags: next },
                })
              }
            />
          </div>

          <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            {isMaterial ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                <FiPaperclip aria-hidden />
                <span>
                  {files.length} {t.files(lang)}
                </span>
              </span>
            ) : (
              <ul className="flex flex-wrap items-center gap-2 text-xs font-medium">
                <li className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                  <span className="font-semibold">
                    {classwork.penddingNumber ?? 0}
                  </span>{" "}
                  <span>{t.NoWork(lang)}</span>
                </li>
                <li className="rounded-full bg-warning-color/20 px-2.5 py-1 text-amber-800">
                  <span className="font-semibold">
                    {classwork.summitNumber ?? 0}
                  </span>{" "}
                  <span>{t.WaitReview(lang)}</span>
                </li>
                <li className="rounded-full bg-success-color/10 px-2.5 py-1 text-success-color">
                  <span className="font-semibold">
                    {classwork.reviewNumber ?? 0}
                  </span>{" "}
                  <span>{t.Reviewed(lang)}</span>
                </li>
              </ul>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={() => onSelect(classwork)}
                aria-expanded={open}
                aria-controls={panelId}
                className="relative z-10 ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-primary-color transition hover:bg-primary-color/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-color"
              >
                <span>{open ? t.hideDetails(lang) : t.details(lang)}</span>
                <FiChevronDown
                  aria-hidden
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </footer>
        </div>
      </div>

      {open && (
        <section
          id={panelId}
          className="relative z-10 flex flex-col gap-4 rounded-b-2xl border-t border-gray-100 bg-background-color p-4 sm:p-5"
        >
          {hasText(classwork.description) ? (
            <div className="h-72 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <TextEditor
                schoolId={classwork.schoolId}
                disabled={true}
                toolbar={false}
                menubar={false}
                onChange={() => {}}
                value={classwork.description}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t.noDescription(lang)}</p>
          )}

          {classwork.type !== "VideoQuiz" && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {t.attachments(lang)}
              </h4>
              {files.length === 0 ? (
                <p className="text-sm text-gray-400">{t.noAttachments(lang)}</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {files.map((file) => {
                    const isImage = file.type.includes("image");
                    const isLink = file.type === "LINK";
                    return (
                      <li key={file.id} className="min-w-0">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:border-primary-color/40 hover:text-primary-color"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-color/10 text-primary-color">
                            {isLink ? (
                              <MdLink />
                            ) : isImage ? (
                              <FaRegFileImage />
                            ) : (
                              <FaRegFile />
                            )}
                          </span>
                          <span className="truncate">{fileLabel(file)}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </section>
      )}
    </article>
  );
}

export default ClassworkCard;
