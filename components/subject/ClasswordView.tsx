import React, { ReactNode } from "react";
import {
  Assignment,
  AssignmentType,
  FileOnAssignment,
  Skill,
} from "../../interfaces";
import TextEditor from "../common/TextEditor";
import { FaRegFile, FaRegFileImage } from "react-icons/fa6";
import { MdDelete, MdOutlineFileUpload } from "react-icons/md";
import Dropdown from "../common/Dropdown";
import { classworkLists } from "./ClassworkCreate";
import InputNumber from "../common/InputNumber";
import Switch from "../common/Switch";
import { SiGooglegemini } from "react-icons/si";
import { CgInfo } from "react-icons/cg";
import { useGetLanguage, useUpdateSkillToAssignment } from "../../react-query";
import LoadingSpinner from "../common/LoadingSpinner";
import { classworkViewDataLanguage } from "../../data/languages";

export type FileClasswork = {
  file: File | null;
  data: FileOnAssignment | null;
  type: string;
  name: string;
  url: string;
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
};
function ClasswordView({
  classwork,
  skills,
  onChange,
  files,
  onDeleteFile,
  onUploadFile,
}: Props) {
  const refetchSkill = useUpdateSkillToAssignment();
  const language = useGetLanguage();
  return (
    <main className="flex h-max w-full">
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

          <ul className="flex h-max w-full flex-col gap-2">
            {files?.map((file, index) => {
              const isImage = file.type.includes("image");
              return (
                <li
                  key={index}
                  className="flex h-20 w-full items-center justify-between overflow-hidden rounded-2xl border bg-white"
                >
                  <div className="flex h-full w-full items-center justify-start gap-2">
                    <div className="gradient-bg flex h-full w-16 items-center justify-center border-r text-lg text-white">
                      {isImage ? <FaRegFileImage /> : <FaRegFile />}
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      className="flex items-center gap-2"
                    >
                      <span>{file.name}</span>
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteFile(file)}
                    className="mr-5 rounded-full p-2 text-xl text-red-500 hover:bg-red-300/50 active:scale-105"
                  >
                    <MdDelete />
                  </button>
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
          <div className="flex h-20 w-full items-center justify-center">
            <label
              htmlFor="upload"
              className="gradient-bg flex items-center justify-center gap-1 rounded-2xl px-3 py-1 text-lg text-white transition active:scale-105"
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
          <label className="flex w-full flex-col bg-gray-50">
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

export default ClasswordView;
