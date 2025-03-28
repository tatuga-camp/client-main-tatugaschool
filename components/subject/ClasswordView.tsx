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
    <main className="w-full h-max flex">
      <section className="w-full flex-col h-max flex mb-40 items-center justify-start gap-5">
        <div className="w-11/12  h-max max-h-max mt-10 p-5 bg-white flex flex-col gap-2 rounded-md border">
          <label className="flex flex-col ">
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
                language.data ?? "en"
              )}
            />
          </label>
          {classwork && (
            <div className="w-full h-96 pb-5 ">
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

          <ul className="w-full h-max flex flex-col gap-2">
            {files?.map((file, index) => {
              const isImage = file.type.includes("image");
              return (
                <li
                  key={index}
                  className="w-full h-20 flex overflow-hidden rounded-md items-center justify-between  bg-white border"
                >
                  <div className="w-full h-full flex items-center justify-start gap-2">
                    <div
                      className="w-16 gradient-bg text-white text-lg flex items-center justify-center
               border-r h-full"
                    >
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
                    className="text-xl mr-5 hover:bg-red-300/50 p-2 rounded-full active:scale-105 text-red-500"
                  >
                    <MdDelete />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="w-11/12 h-max p-5 rounded-md bg-white border">
          <h1>{classworkViewDataLanguage.fileTilte(language.data ?? "en")}</h1>
          <span className="text-xs text-gray-400">
            {classworkViewDataLanguage.fileDescription(language.data ?? "en")}
          </span>
          <div className="w-full  flex items-center justify-center h-20">
            <label
              htmlFor="upload"
              className="text-white flex active:scale-105 transition
           items-center justify-center gap-1
         gradient-bg px-3 py-1 text-lg rounded-md"
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
          <div className="w-11/12 h-max p-5 rounded-md  text-white gradient-bg border">
            <div className="w-full flex justify-between">
              <h1 className="flex gap-2 items-center">
                <SiGooglegemini />
                Suggest Skills for Classwork by AI
              </h1>
              <a
                href="#"
                className="flex gap-2 second-button border items-center"
              >
                <CgInfo />
                Learn more
              </a>
            </div>

            <span className="text-xs text-gray-50">
              Suggest the skill that related to your classwork for evaluation
            </span>

            <ul className="flex mt-2 flex-wrap gap-2">
              {skills?.map((skill, index) => (
                <li
                  key={index}
                  className="bg-white text-black p-2 text-sm rounded-md"
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
              className="second-button mt-5 border w-40 flex items-center justify-center"
            >
              {refetchSkill.isPending ? <LoadingSpinner /> : "Update skill"}
            </button>
          </div>
        )}
      </section>
      <section className="w-4/12 min-h-screen max-h-max flex flex-col gap-2  bg-white  h-full">
        <div className="w-full py-5 flex items-start flex-col px-5  border-b">
          <h1 className="text-lg font-medium">
            {classworkViewDataLanguage.settingTitle(language.data ?? "en")}
          </h1>
          <span className="text-xs text-gray-400">
            {classworkViewDataLanguage.settingDescription(
              language.data ?? "en"
            )}
          </span>
          {classwork?.status === "Draft" && (
            <div className="mt-5 bg-gray-500 text-white px-5 py-1 rounded-md">
              {classworkViewDataLanguage.draft(language.data ?? "en")}
            </div>
          )}
          {classwork?.status === "Published" && (
            <div className="mt-5  text-white px-5 py-1 rounded-md gradient-bg ">
              {classworkViewDataLanguage.published(language.data ?? "en")}
            </div>
          )}
        </div>

        <section className="flex flex-col gap-3 mt-5 px-5 w-10/12">
          <label className="flex border-b pb-2 flex-col  w-full">
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
          <label className="flex flex-col bg-gray-50  w-full">
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
            <label className="flex flex-col  w-full  border-b pb-2">
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
            <label className="flex flex-col  w-full border-b pb-2">
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
            <label className="flex gap-2 items-center justify-between   w-full">
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
            <label className="flex flex-col  w-full">
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
