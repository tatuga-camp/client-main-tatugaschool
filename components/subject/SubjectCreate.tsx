import React, { useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import InputWithIcon from "../common/InputWithIcon";
import { MdOutlineSubtitles, MdTitle } from "react-icons/md";
import InputEducationYear from "../common/InputEducationYear";
import { FiPlus } from "react-icons/fi";
import { EducationYear, ErrorMessages } from "../../interfaces";
import {
  useCreateSubject,
  useGetClassrooms,
  useGetLanguage,
} from "../../react-query";
import Swal from "sweetalert2";
import { Toast } from "primereact/toast";
import { useSound } from "../../hook";
import LoadingBar from "../common/LoadingBar";
import { subjectsDataLanguage } from "../../data/languages";

type Props = {
  onClose: () => void;
  schoolId: string;
  educationYear: EducationYear;
  toast: React.RefObject<Toast>;
};
function SubjectCreate({ onClose, schoolId, educationYear, toast }: Props) {
  const sound = useSound("/sounds/ding.mp3") as HTMLAudioElement;
  const create = useCreateSubject();
  const language = useGetLanguage();
  const classrooms = useGetClassrooms({
    schoolId: schoolId,
    isAchieved: false,
  });
  const [data, setData] = React.useState<{
    title?: string;
    description?: string;
    educationYear: EducationYear;
    classId?: string;
  }>({
    educationYear: educationYear,
  });

  useEffect(() => {
    if (classrooms.data && classrooms.data?.length > 0) {
      setData((prev) => ({ ...prev, classId: classrooms.data[0].id }));
    }
  }, [classrooms.data]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!data.title || !data.description || !data.classId) {
        throw new Error("Please fill all the fields");
      }
      await create.mutateAsync({
        title: data.title,
        description: data.description,
        educationYear: data.educationYear,
        classId: data.classId,
        schoolId: schoolId,
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
      onSubmit={handleCreateSubject}
      className="flex h-max flex-col gap-2 rounded-2xl bg-white p-3 xl:w-5/12 2xl:w-4/12"
    >
      <header className="flex w-full justify-between border-b">
        <h1 className="text-lg font-semibold">
          {subjectsDataLanguage.create(language.data ?? "en")}
        </h1>
        <button
          type="button"
          onClick={() => onClose()}
          className="flex h-6 w-6 items-center justify-center rounded text-lg font-semibold hover:bg-gray-300/50"
        >
          <IoMdClose />
        </button>
      </header>
      {create.isPending && <LoadingBar />}
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
            disabled={create.isPending}
            type="submit"
            className="main-button flex items-center justify-center gap-1"
          >
            <FiPlus /> {subjectsDataLanguage.create(language.data ?? "en")}
          </button>
        </div>
      </div>
    </form>
  );
}

export default SubjectCreate;
