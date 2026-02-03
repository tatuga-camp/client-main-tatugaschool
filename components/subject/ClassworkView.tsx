import React, { ReactNode } from "react";
import {
  Assignment,
  AssignmentType,
  FileOnAssignment,
  Skill,
} from "../../interfaces";
import TextEditor from "../common/TextEditor";
import { FaRegFile, FaRegFileImage, FaRegFileVideo } from "react-icons/fa6";
import {
  MdDelete,
  MdLink,
  MdOutlineFileUpload,
  MdSettings,
} from "react-icons/md";
import Dropdown from "../common/Dropdown";
import VideoConfigurator from "../common/VideoConfigurator";
import { VideoConfig } from "../../interfaces/VideoConfig";
import { classworkLists } from "./ClassworkCreate";
import InputNumber from "../common/InputNumber";
import Switch from "../common/Switch";
import { SiGooglegemini } from "react-icons/si";
import { CgInfo } from "react-icons/cg";
import {
  useGetLanguage,
  useUpdateFileOnAssignment,
  useUpdateSkillToAssignment,
} from "../../react-query";
import LoadingSpinner from "../common/LoadingSpinner";
import { classworkViewDataLanguage } from "../../data/languages";

export type FileClasswork = {
  file: File | null;
  data: FileOnAssignment | null;
  type: string;
  name: string;
  url: string;
  fileOnAssignment: FileOnAssignment | null;
  videoConfig?: VideoConfig;
};

type Props = {
  classwork: (Assignment & { allowWeight?: boolean }) | undefined;
  files: FileClasswork[];
  skills?: Omit<Skill, "vector">[];
  onChange: (data: {
    title?: string;
    description?: string;
    beginDate?: string;
    dueDate?: string;
    allowWeight?: boolean;
    weight?: number | null;
    maxScore?: number;
    type?: AssignmentType;
  }) => void;
  onDeleteFile: (file: FileClasswork) => void;
  onUploadFile: (file: FileClasswork[]) => void;
  onUpdateFile?: (file: FileClasswork) => void;
};
function ClassworkView({
  classwork,
  skills,
  onChange,
  files,
  onDeleteFile,
  onUploadFile,
  onUpdateFile,
}: Props) {
  const refetchSkill = useUpdateSkillToAssignment();
  const language = useGetLanguage();
  const [triggerLink, setTriggerLink] = React.useState(false);
  const [linkValue, setLinkValue] = React.useState("");
  const [configuringVideo, setConfiguringVideo] =
    React.useState<FileClasswork | null>(null);
  const updateFile = useUpdateFileOnAssignment();
  return (
    <main className="flex h-max w-full">
      {configuringVideo && (
        <VideoConfigurator
          fileUrl={configuringVideo.url}
          initialConfig={{
            preventFastForward:
              configuringVideo.fileOnAssignment?.preventFastForward ?? false,
            questions: [],
          }}
          onClose={() => setConfiguringVideo(null)}
          onSave={async (config) => {
            console.log(config);
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
          <div className="flex w-96 flex-col gap-5 rounded-2xl bg-white p-5">
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
                className="rounded-2xl border px-4 py-1 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log(linkValue);
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
                className="gradient-bg rounded-2xl px-4 py-1 text-white"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
      <section className="mb-40 flex h-max w-full flex-col items-center justify-start gap-5">
        <div className="mt-10 flex h-max max-h-max w-11/12 flex-col gap-2 rounded-2xl border bg-white p-5">
          <label className="flex flex-col">
            <span className="text-base font-medium">
              {classworkViewDataLanguage.title(language.data ?? "en")}
            </span>
            <input
              value={classwork?.title}
              onChange={(e) => onChange({ title: e.target.value })}
              required
              maxLength={999}
              className="main-input"
              placeholder={classworkViewDataLanguage.title(
                language.data ?? "en",
              )}
            />
          </label>
          {classwork && (
            <div className="h-96 w-full pb-5">
              <span className="text-base font-medium">
                {classworkViewDataLanguage.description(language.data ?? "en")}
              </span>
              <TextEditor
                schoolId={classwork?.schoolId}
                value={classwork?.description || ""}
                onChange={(v) =>
                  onChange({
                    description: v,
                  })
                }
              />
            </div>
          )}

          <ul className="mt-10 flex h-max w-full flex-col gap-2">
            {files?.map((file, index) => {
              const isImage = file.type.includes("image");
              const isLink = file.type === "LINK" || file.type === "url";
              const isVideo = file.type.includes("video");
              return (
                <li
                  key={index}
                  className="flex h-20 w-full items-center justify-between overflow-hidden rounded-2xl border bg-white"
                >
                  <div className="flex h-full w-full items-center justify-start gap-2">
                    <div className="gradient-bg flex h-full w-16 items-center justify-center border-r text-lg text-white">
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
                    <a
                      href={file.url}
                      target="_blank"
                      className="flex w-10/12 items-center gap-2 truncate"
                    >
                      <span className="truncate">
                        {file.type === "LINK" ? file.url : file.name}
                      </span>
                    </a>
                  </div>
                  <div className="mr-5 flex items-center">
                    {isVideo && (
                      <button
                        type="button"
                        onClick={() => setConfiguringVideo(file)}
                        className="rounded-full p-2 text-xl text-gray-500 hover:bg-gray-200 active:scale-105"
                      >
                        <MdSettings />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Do you want to delete?"))
                          onDeleteFile(file);
                      }}
                      className="rounded-full p-2 text-xl text-red-500 hover:bg-red-300/50 active:scale-105"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="h-max w-11/12 rounded-2xl border bg-white p-5">
          <h1>{classworkViewDataLanguage.fileTilte(language.data ?? "en")}</h1>
          <span className="text-xs text-gray-400">
            {classworkViewDataLanguage.fileDescription(language.data ?? "en")}
          </span>
          <div className="flex h-20 w-full items-center justify-center gap-3">
            <label
              htmlFor="upload"
              className="gradient-bg flex w-40 items-center justify-center gap-1 rounded-2xl px-3 py-1 text-lg text-white transition active:scale-105"
            >
              <MdOutlineFileUpload />
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
              className="gradient-bg flex w-40 items-center justify-center gap-1 rounded-2xl px-3 py-1 text-lg text-white transition active:scale-105"
            >
              <MdLink /> Link
            </button>
          </div>
        </div>

        {classwork?.id && classwork.type === "Assignment" && (
          <div className="gradient-bg h-max w-11/12 rounded-2xl border p-5 text-white">
            <div className="flex w-full justify-between">
              <h1 className="flex items-center gap-2">
                <SiGooglegemini />
                Suggest Skills for Classwork by AI
              </h1>
              <a
                href="#"
                className="second-button flex items-center gap-2 border"
              >
                <CgInfo />
                Learn more
              </a>
            </div>

            <span className="text-xs text-gray-50">
              Suggest the skill that related to your classwork for evaluation
            </span>

            <ul className="mt-2 flex flex-wrap gap-2">
              {skills?.map((skill, index) => (
                <li
                  key={index}
                  className="rounded-2xl bg-white p-2 text-sm text-black"
                >
                  #{skill.title}
                </li>
              ))}
            </ul>
            {(skills?.length === 0 || !skills) && (
              <div className="flex flex-col">
                <h1>No skill found</h1>
              </div>
            )}
            <button
              onClick={async () => {
                await refetchSkill.mutateAsync({
                  assignmentId: classwork.id,
                });
              }}
              disabled={refetchSkill.isPending}
              type="button"
              className="second-button mt-5 flex w-40 items-center justify-center border"
            >
              {refetchSkill.isPending ? <LoadingSpinner /> : "Update skill"}
            </button>
          </div>
        )}
      </section>
      <section className="flex h-full max-h-max min-h-screen w-4/12 flex-col gap-2 bg-white">
        <div className="flex w-full flex-col items-start border-b px-5 py-5">
          <h1 className="text-lg font-medium">
            {classworkViewDataLanguage.settingTitle(language.data ?? "en")}
          </h1>
          <span className="text-xs text-gray-400">
            {classworkViewDataLanguage.settingDescription(
              language.data ?? "en",
            )}
          </span>
          {classwork?.status === "Draft" && (
            <div className="mt-5 rounded-2xl bg-gray-500 px-5 py-1 text-white">
              {classworkViewDataLanguage.draft(language.data ?? "en")}
            </div>
          )}
          {classwork?.status === "Published" && (
            <div className="gradient-bg mt-5 rounded-2xl px-5 py-1 text-white">
              {classworkViewDataLanguage.published(language.data ?? "en")}
            </div>
          )}
        </div>

        <section className="mt-5 flex w-10/12 flex-col gap-3 px-5">
          <label className="flex w-full flex-col border-b pb-2">
            <span className="text-base font-medium">
              {classworkViewDataLanguage.type(language.data ?? "en")}
            </span>
            <Dropdown<{ title: string; icon: ReactNode }>
              value={
                classworkLists.find((c) => c.title === classwork?.type) ||
                classworkLists[0]
              }
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
                  type: e.value.title as AssignmentType,
                });
              }}
              options={classworkLists}
              optionLabel="title"
            />
          </label>
          <label className="flex w-full flex-col">
            <span className="text-base font-medium">
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
              className="main-input"
            />
          </label>
          {classwork?.type === "Assignment" && (
            <label className="flex w-full flex-col border-b pb-2">
              <span className="text-base font-medium">
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
                className="main-input"
              />
            </label>
          )}

          {classwork?.type === "Assignment" && (
            <label className="flex w-full flex-col border-b pb-2">
              <span className="text-base font-medium">
                {classworkViewDataLanguage.maxScore(language.data ?? "en")}
              </span>
              <InputNumber
                required={classwork?.type === "Assignment"}
                value={classwork?.maxScore}
                max={1000}
                min={0}
                onValueChange={(e) =>
                  onChange({
                    maxScore: e,
                  })
                }
              />
            </label>
          )}
          {classwork?.type === "Assignment" && (
            <label className="flex w-full items-center justify-between gap-2">
              <span className="text-base font-medium">
                {classworkViewDataLanguage.allowWeight(language.data ?? "en")}
              </span>
              <Switch
                checked={classwork?.allowWeight}
                setChecked={(e) => {
                  let weight = classwork.weight;
                  if (weight === null) {
                    weight = 0;
                  }

                  onChange({
                    allowWeight: e,
                    weight: e ? weight : null,
                  });
                }}
              />
            </label>
          )}
          {classwork?.allowWeight && classwork.type === "Assignment" && (
            <label className="flex w-full flex-col">
              <span className="text-base font-medium">
                {classworkViewDataLanguage.weight(language.data ?? "en")}
              </span>
              <InputNumber
                value={classwork?.weight || 0}
                max={100}
                suffix="%"
                min={0}
                placeholder="percentage of classwork"
                onValueChange={(e) =>
                  onChange({
                    weight: e,
                  })
                }
              />
            </label>
          )}
        </section>
      </section>
    </main>
  );
}

export default ClassworkView;
