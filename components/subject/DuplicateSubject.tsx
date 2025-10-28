import React, { RefObject } from "react";
import { IoMdClose } from "react-icons/io";
import {
  useDuplicateSubject,
  useGetClassrooms,
  useGetLanguage,
} from "../../react-query";
import LoadingBar from "../common/LoadingBar";
import { EducationYear, ErrorMessages, Subject } from "../../interfaces";
import { subjectsDataLanguage } from "../../data/languages";
import InputEducationYear from "../common/InputEducationYear";
import InputWithIcon from "../common/InputWithIcon";
import { useSound } from "../../hook";
import { MdOutlineSubtitles } from "react-icons/md";
import { IoDuplicate } from "react-icons/io5";
import { Toast } from "primereact/toast";
import Swal from "sweetalert2";

type Props = {
  onClose: () => void;
  subject: Subject;
  toast: RefObject<Toast>;
};
function DuplicateSubject({ onClose, subject, toast }: Props) {
  const sound = useSound("/sounds/ding.mp3") as HTMLAudioElement;
  const duplicate = useDuplicateSubject();
  const language = useGetLanguage();
  const classrooms = useGetClassrooms({
    schoolId: subject.schoolId,
    isAchieved: false,
  });
  const [data, setData] = React.useState<{
    title?: string;
    description?: string;
    educationYear: EducationYear;
    classId?: string;
  }>({
    title: `Duplicate of ${subject.title}`,
    description: subject.description,
    classId: subject.classId,
    educationYear: subject.educationYear as EducationYear,
  });

  const handleDuplicateSubject = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!data.title || !data.description || !data.classId) {
        throw new Error("Please fill all the fields");
      }
      await duplicate.mutateAsync({
        title: data.title,
        description: data.description,
        educationYear: data.educationYear,
        classroomId: data.classId,
        subjectId: subject.id,
        ...(subject.backgroundImage && {
          backgroundImage: subject.backgroundImage,
        }),
      });

      sound.play();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Subject created",
        life: 3000,
      });
      onClose();
    } catch (error) {
      console.error(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  return (
    <form
      onSubmit={handleDuplicateSubject}
      className="flex h-max flex-col gap-2 rounded-2xl bg-white p-3 xl:w-5/12 2xl:w-4/12"
    >
      <header className="flex w-full justify-between border-b">
        <h1 className="text-lg font-semibold">Duplicate Subject</h1>
        <button
          type="button"
          onClick={() => onClose()}
          className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
        >
          <IoMdClose />
        </button>
      </header>
      {duplicate.isPending && <LoadingBar />}
      <div className="flex h-96 flex-col gap-5 overflow-auto p-2 pt-5">
        <div className="flex flex-col">
          <span>
            {subjectsDataLanguage.educationYear(language.data ?? "en")}
          </span>
          <InputEducationYear
            required={true}
            value={data?.educationYear}
            onChange={(value) => {
              setData((prev) => ({
                ...prev,
                educationYear: value as EducationYear,
              }));
            }}
          />
        </div>
        <InputWithIcon
          required
          title="Name"
          value={data?.title ?? ""}
          onChange={(value) => {
            setData((prev) => ({ ...prev, title: value }));
          }}
          placeholder="Enter subject name"
          icon={<MdOutlineSubtitles />}
        />
        <InputWithIcon
          required
          title="Description"
          value={data.description ?? ""}
          onChange={(value) => {
            setData((prev) => ({ ...prev, description: value }));
          }}
          placeholder="Enter subject description"
          icon={<MdOutlineSubtitles />}
        />

        <label className="flex flex-col">
          <span className="text-sm">
            {subjectsDataLanguage.selectClass(language.data ?? "en")}
          </span>
          <select
            disabled={classrooms.isLoading}
            required
            className="main-select border"
            value={data?.classId}
            onChange={(e) => {
              setData((prev) => ({ ...prev, classId: e.target.value }));
            }}
          >
            {classrooms.isLoading && <option>Loading...</option>}
            {classrooms.data
              ?.sort((a, b) =>
                (a.creator?.email ?? "").localeCompare(b.creator?.email ?? ""),
              )
              .map((classroom) => {
                return (
                  <option key={classroom.id} value={classroom.id}>
                    <div className="">
                      <span>{classroom.title}</span>
                      {" - "}
                      <span className="">{classroom.level}</span>:{" "}
                      <span className="">
                        {classroom.creator?.email ?? "No Creator Found"}
                      </span>
                    </div>
                  </option>
                );
              })}
          </select>
          {classrooms.data && classrooms.data?.length === 0 && (
            <span className="text-sm text-red-700">
              {subjectsDataLanguage.create_class_first(language.data ?? "en")}
            </span>
          )}
        </label>
      </div>

      <div className="flex w-full justify-end gap-3 border-t px-3 py-2">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              onClose();
            }}
            type="button"
            className="second-button flex items-center justify-center gap-1 border"
          >
            Cancel
          </button>
          <button
            disabled={duplicate.isPending}
            type="submit"
            className="main-button flex items-center justify-center gap-1"
          >
            <IoDuplicate />{" "}
            {subjectsDataLanguage.duplicate(language.data ?? "en")}
          </button>
        </div>
      </div>
    </form>
  );
}

export default DuplicateSubject;
