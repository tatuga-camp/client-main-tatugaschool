import React, { ReactNode, useRef, useState } from "react";
import {
  BsLayoutSidebarInset,
  BsLayoutSidebarInsetReverse,
} from "react-icons/bs";
import { FaRegFile, FaRegFileImage, FaRegFileVideo } from "react-icons/fa6";
import {
  MdAssignment,
  MdDelete,
  MdEdit,
  MdLink,
  MdOutlineFileUpload,
  MdSettings,
  MdVideoLibrary,
} from "react-icons/md";
import { SiGooglegemini } from "react-icons/si";
import {
  classworkViewDataLanguage,
  tagsDataLanguage,
} from "../../data/languages";
import {
  Assignment,
  AssignmentType,
  FileOnAssignment,
  Skill,
} from "../../interfaces";
import {
  useGetLanguage,
  useGetSubject,
  useUpdateFileOnAssignment,
  useUpdateSkillToAssignment,
} from "../../react-query";
import Dropdown from "../common/Dropdown";
import FileVideoConfigurator from "../common/FileVideoConfigurator";
import InputNumber from "../common/InputNumber";
import LoadingSpinner from "../common/LoadingSpinner";
import Switch from "../common/Switch";
import TextEditor from "../common/TextEditor";
import VideoConfigurator from "../common/VideoConfigurator";
import AssignmentTagEditor from "./AssignmentTagEditor";
import RubricPicker from "./rubric/RubricPicker";
export const classworkLists = [
  {
    title: "Assignment",
    value: "Assignment",
    icon: <MdAssignment />,
  },
  {
    title: "Material",
    value: "Material",
    icon: <FaRegFile />,
  },
  {
    title: "Video Quiz",
    value: "VideoQuiz",
    icon: <MdVideoLibrary />,
  },
] as const;

type ClassworkList = (typeof classworkLists)[number]["value"];

export type FileClasswork = {
  file: File | null;
  data: FileOnAssignment | null;
  type: string;
  name: string;
  url: string;
  fileOnAssignment: FileOnAssignment | null;
};

function RailGroup({
  label,
  children,
  first = false,
}: {
  label: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 ${first ? "" : "border-t border-gray-100 pt-4"}`}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      {children}
    </div>
  );
}

function CardHeading({ title, helper }: { title: string; helper?: string }) {
  return (
    <div className="mb-3 flex flex-col">
      <h2 className="text-base font-semibold text-icon-color">{title}</h2>
      {helper && <span className="text-xs text-gray-400">{helper}</span>}
    </div>
  );
}

const outlineButton =
  "flex items-center justify-center gap-1.5 rounded-xl border border-primary-color/30 px-4 py-2 text-sm font-medium text-primary-color transition hover:bg-primary-color/5 active:scale-[0.98]";

type Props = {
  classwork?: (Assignment & { allowWeight?: boolean }) | undefined;
  files: FileClasswork[];
  skills?: Omit<Skill, "vector">[];
  uniqueTags?: string[];
  onChange: (data: {
    title?: string;
    description?: string;
    beginDate?: string;
    dueDate?: string;
    allowWeight?: boolean;
    weight?: number | null;
    maxScore?: number;
    type?: AssignmentType;
    tags?: string[];
    rubricId?: string | null;
    allowStudentViewScore?: boolean;
  }) => void;
  onDeleteFile: (file: FileClasswork) => void;
  onUploadFile: (file: FileClasswork[]) => void;
  onUpdateFile?: (file: FileClasswork) => void;
  subjectId: string;
  schoolId: string;
};
function ClassworkView({
  classwork,
  skills,
  onChange,
  files,
  onDeleteFile,
  onUploadFile,
  onUpdateFile,
  subjectId,
  schoolId,
  uniqueTags = [],
}: Props) {
  const refetchSkill = useUpdateSkillToAssignment();
  const language = useGetLanguage();
  const updateFile = useUpdateFileOnAssignment();
  const subject = useGetSubject({ subjectId });
  const hideScore = classwork?.allowStudentViewScore === false;
  const subjectHidesScores =
    subject.data?.allowStudentViewScoreOnAssignment === false;
  const [triggerLink, setTriggerLink] = React.useState(false);
  const [linkValue, setLinkValue] = React.useState("");
  const [allowWeight, setAllowWeight] = React.useState(
    classwork?.allowWeight || false,
  );
  const [configuringVideo, setConfiguringVideo] =
    React.useState<FileClasswork | null>(null);
  const [description, setDescription] = useState<string>(
    classwork?.description ?? "",
  );
  const [assignmentType, setAssignmentType] = useState<ClassworkList>(
    classworkLists.find((c) => c.value === classwork?.type)?.value ||
      classworkLists[0].value,
  );
  const [rubricId, setRubricId] = useState<string | null>(
    classwork?.rubricId ?? null,
  );
  const [triggerSildeOption, setTriggerSildeOption] = useState<boolean>(false);
  const [editingFileUrl, setEditingFileUrl] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const cancelRenameRef = useRef(false);

  const handleStartRename = (file: FileClasswork) => {
    cancelRenameRef.current = false;
    setEditingFileUrl(file.url);
    setEditingName(file.name);
  };

  const handleCommitRename = async (file: FileClasswork) => {
    if (editingFileUrl === null) return;
    setEditingFileUrl(null);
    if (cancelRenameRef.current) {
      cancelRenameRef.current = false;
      return;
    }
    const nextName = editingName.trim();
    if (!nextName || nextName === file.name) return;
    try {
      if (file.fileOnAssignment?.id) {
        await updateFile.mutateAsync({
          id: file.fileOnAssignment.id,
          name: nextName,
        });
      }
      onUpdateFile?.({ ...file, name: nextName });
    } catch {
      setEditingFileUrl(file.url);
      setEditingName(nextName);
    }
  };

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 md:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      {configuringVideo && (
        <FileVideoConfigurator
          fileUrl={configuringVideo.url}
          initialConfig={{
            preventFastForward:
              configuringVideo.fileOnAssignment?.preventFastForward ?? false,
            questions: [],
          }}
          onClose={() => setConfiguringVideo(null)}
          onSave={async (config) => {
            if (configuringVideo.fileOnAssignment?.id)
              await updateFile.mutateAsync({
                id: configuringVideo.fileOnAssignment.id,
                preventFastForward: config.preventFastForward,
              });
          }}
        />
      )}
      {triggerLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex w-full max-w-96 flex-col gap-5 rounded-2xl bg-white p-5">
            <h1 className="text-xl font-semibold">Add Link</h1>
            <input
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="Enter link URL"
              className="main-input"
              type="url"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setTriggerLink(false);
                  setLinkValue("");
                }}
                type="button"
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!linkValue) return;
                  onUploadFile([
                    {
                      file: null,
                      data: null,
                      type: "LINK",
                      name: linkValue,
                      url: linkValue,
                      fileOnAssignment: null,
                    },
                  ]);
                  setTriggerLink(false);
                  setLinkValue("");
                }}
                type="button"
                className="rounded-xl bg-primary-color px-4 py-2 text-sm font-semibold text-white hover:bg-primary-color-hover"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left column */}
      <section className="flex min-w-0 flex-col gap-5 pb-24">
        {assignmentType === "VideoQuiz" && classwork && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <VideoConfigurator
              assignment={classwork}
              onClose={() => setConfiguringVideo(null)}
            />
          </div>
        )}

        {assignmentType !== "VideoQuiz" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <CardHeading
              title={classworkViewDataLanguage.description(
                language.data ?? "en",
              )}
            />
            <div className="h-96 w-full pb-5">
              <TextEditor
                schoolId={schoolId}
                value={description}
                onChange={(v) => {
                  onChange({
                    description: v,
                  });
                  setDescription(v);
                }}
              />
            </div>
            {classwork && (
              <section className="mt-6 flex flex-col gap-1">
                <span className="text-sm font-medium text-icon-color">
                  {tagsDataLanguage.sectionTitle(language.data ?? "en")}
                </span>
                <AssignmentTagEditor
                  value={classwork?.tags ?? []}
                  suggestions={uniqueTags}
                  size="md"
                  onChange={(next) => onChange({ tags: next })}
                />
              </section>
            )}
          </div>
        )}

        {assignmentType !== "VideoQuiz" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <CardHeading
              title={classworkViewDataLanguage.fileTilte(language.data ?? "en")}
            />
            {files && files.length > 0 && (
              <ul className="mb-4 grid gap-2 xl:grid-cols-2">
                {files.map((file, index) => {
                  const isImage = file.type.includes("image");
                  const isLink = file.type === "LINK" || file.type === "url";
                  const isVideo = file.type.includes("video");
                  return (
                    <li
                      key={index}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-color/10 text-lg text-primary-color">
                        {isLink ? (
                          <MdLink />
                        ) : isImage ? (
                          <FaRegFileImage />
                        ) : isVideo ? (
                          <FaRegFileVideo />
                        ) : (
                          <FaRegFile />
                        )}
                      </div>
                      {editingFileUrl === file.url ? (
                        <input
                          autoFocus
                          aria-label="File name"
                          maxLength={255}
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => handleCommitRename(file)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                            if (e.key === "Escape") {
                              cancelRenameRef.current = true;
                              e.currentTarget.blur();
                            }
                          }}
                          className="main-input min-w-0 flex-1 py-1 text-sm"
                        />
                      ) : (
                        <a
                          href={file.url}
                          target="_blank"
                          className="min-w-0 flex-1 truncate text-sm font-medium text-icon-color hover:text-primary-color"
                        >
                          {file.name}
                        </a>
                      )}
                      <div className="flex shrink-0 items-center">
                        {isVideo && (
                          <button
                            type="button"
                            aria-label="Video settings"
                            onClick={() => setConfiguringVideo(file)}
                            className="rounded-full p-2 text-lg text-gray-400 transition hover:bg-gray-100 hover:text-icon-color"
                          >
                            <MdSettings />
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label="Rename"
                          onClick={() => handleStartRename(file)}
                          className="rounded-full p-2 text-lg text-gray-400 transition hover:bg-gray-100 hover:text-icon-color"
                        >
                          <MdEdit />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={() => {
                            if (confirm("Do you want to delete?"))
                              onDeleteFile(file);
                          }}
                          className="rounded-full p-2 text-lg text-gray-400 transition hover:bg-error-color/10 hover:text-error-color"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-6">
              <span className="text-sm text-gray-400">
                {classworkViewDataLanguage.fileDescription(
                  language.data ?? "en",
                )}
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                <label htmlFor="upload" className={`${outlineButton} cursor-pointer`}>
                  <MdOutlineFileUpload className="text-lg" />
                  {classworkViewDataLanguage.uploadButton(language.data ?? "en")}
                  <input
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      const filesArray = Array.from(files).map((file) => {
                        return {
                          file,
                          data: null,
                          id: null,
                          fileOnAssignment: null,
                          type: file.type,
                          name: file.name,
                          url: URL.createObjectURL(file),
                        };
                      });
                      onUploadFile(filesArray);
                    }}
                    id="upload"
                    type="file"
                    multiple
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setTriggerLink(true)}
                  type="button"
                  className={outlineButton}
                >
                  <MdLink className="text-lg" /> Link
                </button>
              </div>
            </div>
          </div>
        )}

        {assignmentType === "Assignment" && classwork && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <h2 className="flex items-center gap-2 text-base font-semibold text-icon-color">
                  <SiGooglegemini className="text-primary-color" />
                  Suggest Skills for Classwork by AI
                </h2>
                <span className="text-xs text-gray-400">
                  Suggest the skill that related to your classwork for evaluation
                </span>
              </div>
              <button
                onClick={async () => {
                  await refetchSkill.mutateAsync({
                    assignmentId: classwork.id,
                  });
                }}
                disabled={refetchSkill.isPending}
                type="button"
                className={`${outlineButton} shrink-0 disabled:opacity-60`}
              >
                {refetchSkill.isPending ? <LoadingSpinner /> : "Update skill"}
              </button>
            </div>
            {skills && skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <li
                    key={index}
                    className="rounded-full bg-primary-color/10 px-3 py-1 text-sm text-primary-color"
                  >
                    #{skill.title}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-sm text-gray-400">No skill found</span>
            )}
          </div>
        )}
      </section>

      {/* Settings rail */}
      <aside
        className={`rounded-2xl border border-gray-100 bg-white shadow-sm lg:sticky lg:top-6 ${
          triggerSildeOption ? "p-2 lg:w-14" : "p-5"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          {!triggerSildeOption && (
            <div className="flex min-w-0 flex-col">
              <h2 className="text-base font-semibold text-icon-color">
                {classworkViewDataLanguage.settingTitle(language.data ?? "en")}
              </h2>
              <span className="text-xs text-gray-400">
                {classworkViewDataLanguage.settingDescription(
                  language.data ?? "en",
                )}
              </span>
            </div>
          )}
          <button
            type="button"
            aria-label={triggerSildeOption ? "Expand settings" : "Collapse settings"}
            onClick={() => setTriggerSildeOption((prev) => !prev)}
            className="hidden shrink-0 rounded-full p-2 text-xl text-gray-400 transition hover:bg-gray-100 hover:text-icon-color lg:block"
          >
            {triggerSildeOption ? (
              <BsLayoutSidebarInsetReverse />
            ) : (
              <BsLayoutSidebarInset />
            )}
          </button>
        </div>

        {!triggerSildeOption && (
          <div className="mt-4 flex flex-col gap-4">
            <div>
              {classwork?.status === "Draft" && (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {classworkViewDataLanguage.draft(language.data ?? "en")}
                </span>
              )}
              {classwork?.status === "Published" && (
                <span className="rounded-full bg-success-color/10 px-2.5 py-0.5 text-xs font-medium text-success-color">
                  {classworkViewDataLanguage.published(language.data ?? "en")}
                </span>
              )}
            </div>

            <RailGroup
              first
              label={classworkViewDataLanguage.groupType(language.data ?? "en")}
            >
              <Dropdown<{ title: string; value: string; icon: ReactNode }>
                value={assignmentType}
                disabled={!!classwork?.id}
                itemTemplate={(item) => {
                  return (
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  );
                }}
                placeholder="Choose Type of Classwork"
                onChange={(e) => {
                  onChange({
                    type: e.value,
                  });
                  setAssignmentType(e.value);
                }}
                options={classworkLists as any}
                optionLabel="title"
              />
            </RailGroup>

            <RailGroup
              label={classworkViewDataLanguage.groupSchedule(
                language.data ?? "en",
              )}
            >
              <label className="flex w-full flex-col gap-1">
                <span className="text-sm font-medium text-icon-color">
                  {classworkViewDataLanguage.assignAt(language.data ?? "en")}
                </span>
                <input
                  required
                  value={classwork?.beginDate}
                  onChange={(e) =>
                    onChange({
                      beginDate: e.target.value,
                    })
                  }
                  type="datetime-local"
                  className="main-input text-sm"
                />
              </label>
              {assignmentType === "Assignment" && (
                <label className="flex w-full flex-col gap-1">
                  <span className="text-sm font-medium text-icon-color">
                    {classworkViewDataLanguage.deadLine(language.data ?? "en")}
                  </span>
                  <input
                    value={classwork?.dueDate}
                    onChange={(e) =>
                      onChange({
                        dueDate: e.target.value,
                      })
                    }
                    type="datetime-local"
                    className="main-input text-sm"
                  />
                </label>
              )}
            </RailGroup>

            {assignmentType !== "Material" && (
              <RailGroup
                label={classworkViewDataLanguage.groupGrading(
                  language.data ?? "en",
                )}
              >
                <label className="flex w-full flex-col gap-1">
                  <span className="text-sm font-medium text-icon-color">
                    {classworkViewDataLanguage.maxScore(language.data ?? "en")}
                  </span>
                  <InputNumber
                    required={true}
                    value={classwork?.maxScore}
                    max={1000}
                    min={0}
                    onValueChange={(e) => {}}
                    onChange={(e) => {
                      onChange({
                        maxScore: e,
                      });
                    }}
                  />
                </label>
                <label className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium text-icon-color">
                    {classworkViewDataLanguage.allowWeight(
                      language.data ?? "en",
                    )}
                  </span>
                  <Switch
                    checked={allowWeight}
                    setChecked={(e) => {
                      let weight = classwork?.weight;
                      if (weight === null) {
                        weight = 0;
                      }
                      setAllowWeight(e);
                      onChange({
                        allowWeight: e,
                        weight: e ? weight : null,
                      });
                    }}
                  />
                </label>
                {allowWeight && (
                  <label className="flex w-full flex-col gap-1">
                    <span className="text-sm font-medium text-icon-color">
                      {classworkViewDataLanguage.weight(language.data ?? "en")}
                    </span>
                    <InputNumber
                      value={classwork?.weight || 0}
                      max={100}
                      suffix="%"
                      min={0}
                      placeholder="percentage of classwork"
                      onValueChange={(e) => {}}
                      onChange={(e) =>
                        onChange({
                          weight: e,
                        })
                      }
                    />
                  </label>
                )}
                {assignmentType === "Assignment" && (
                  <div className="flex w-full flex-col">
                    <RubricPicker
                      subjectId={subjectId}
                      value={rubricId}
                      onChange={(next) => {
                        setRubricId(next);
                        onChange({ rubricId: next });
                      }}
                    />
                  </div>
                )}
              </RailGroup>
            )}

            {assignmentType !== "Material" && (
              <RailGroup
                label={classworkViewDataLanguage.groupVisibility(
                  language.data ?? "en",
                )}
              >
                <label className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium text-icon-color">
                    {classworkViewDataLanguage.hideScore(language.data ?? "en")}
                  </span>
                  <Switch
                    checked={hideScore}
                    setChecked={(next) =>
                      onChange({ allowStudentViewScore: !next })
                    }
                  />
                </label>
                <span className="text-xs text-gray-400">
                  {classworkViewDataLanguage.hideScoreDescription(
                    language.data ?? "en",
                  )}
                </span>
                {subjectHidesScores && (
                  <span className="rounded-lg bg-warning-color/15 px-2.5 py-1.5 text-xs text-icon-color">
                    {classworkViewDataLanguage.hideScoreSubjectNote(
                      language.data ?? "en",
                    )}
                  </span>
                )}
              </RailGroup>
            )}
          </div>
        )}
      </aside>
    </main>
  );
}

export default ClassworkView;
