import Link from "next/link";
import { useRouter } from "next/router";
import { Toast } from "primereact/toast";
import React from "react";
import Swal from "sweetalert2";
import {
  classroomUiLanguage,
  settingOnClassroomDataLangugae,
} from "../../data/languages";
import useGetRoleOnSchool from "../../hook/useGetRoleOnSchool";
import { Classroom, ErrorMessages } from "../../interfaces";
import {
  useDeleteClassroom,
  useGetLanguage,
  useGetUser,
  useUpdateClassroom,
} from "../../react-query";
import ConfirmDeleteMessage from "../common/ConfirmDeleteMessage";
import { fieldInputClass, FormField } from "../common/FormField";
import InputClassLevel from "../common/InputClassLevel";
import Switch from "../common/Switch";
import ClassLevelBadge from "./ClassLevelBadge";

type Props = {
  classroom: Classroom;
  toast: React.RefObject<Toast>;
};

const showError = (error: unknown) => {
  console.log(error);
  const result = error as ErrorMessages | undefined;
  Swal.fire({
    title: result?.error ? result.error : "Something Went Wrong",
    text: result?.message?.toString(),
    footer: result?.statusCode
      ? "Code Error: " + result.statusCode.toString()
      : "",
    icon: "error",
  });
};

function ClassroomSetting({ classroom, toast }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const text = settingOnClassroomDataLangugae;
  const update = useUpdateClassroom();
  const deleteClass = useDeleteClassroom();
  const role = useGetRoleOnSchool({ schoolId: classroom.schoolId });
  const user = useGetUser();
  const router = useRouter();
  const [classroomData, setClassroomData] = React.useState<Classroom>(classroom);
  const cannotDelete =
    role === "TEACHER" && !!user.data && user.data.id !== classroom.userId;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        query: { classId: classroomData.id },
        body: {
          title: classroomData.title,
          description: classroomData.description,
          level: classroomData.level,
          isAchieved: classroomData.isAchieved,
        },
      });
      toast.current?.show({
        severity: "success",
        summary: classroomUiLanguage.classroomUpdated(lang),
        life: 3000,
      });
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteClassroom = async () => {
    try {
      Swal.fire({
        title: "Deleting...",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      await deleteClass.mutateAsync({ classId: classroomData.id });
      Swal.close();
      // The school page reads ?menu=, not ?selectMenu= (old bug).
      router.push(`/school/${classroomData.schoolId}?menu=Classes`);
    } catch (error) {
      showError(error);
    }
  };

  return (
    <section className="flex w-full flex-col gap-6">
      <form
        onSubmit={handleUpdate}
        className="rounded-2xl bg-white p-5 shadow-[0_12px_24px_rgba(145,158,171,0.12)] sm:p-6"
      >
        <h2 className="text-lg font-bold text-icon-color">{text.general(lang)}</h2>
        <p className="mt-1 text-sm text-icon-color/70">
          {text.geernalDescription(lang)}
        </p>
        <div className="mt-6 flex flex-col gap-5">
          <FormField id="classroom-setting-title" label={text.title(lang)}>
            <input
              id="classroom-setting-title"
              required
              value={classroomData.title}
              onChange={(e) =>
                setClassroomData((prev) => ({ ...prev, title: e.target.value }))
              }
              className={fieldInputClass()}
            />
          </FormField>
          <FormField
            id="classroom-setting-description"
            label={text.description(lang)}
          >
            <input
              id="classroom-setting-description"
              required
              value={classroomData.description ?? ""}
              onChange={(e) =>
                setClassroomData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={fieldInputClass()}
            />
          </FormField>
          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <InputClassLevel
                required
                title={text.classLevel(lang)}
                value={classroomData.level}
                onChange={(value) =>
                  setClassroomData((prev) => ({ ...prev, level: value }))
                }
              />
            </div>
            <ClassLevelBadge
              level={classroomData.level}
              archived={classroomData.isAchieved}
            />
          </div>
          <div className="flex items-start justify-between gap-4 rounded-xl bg-background-color p-4">
            <div className="min-w-0">
              <p className="font-medium text-icon-color">{text.achieved(lang)}</p>
              <p className="mt-0.5 text-sm text-icon-color/70">
                {classroomUiLanguage.archiveHint(lang)}
              </p>
            </div>
            <Switch
              checked={classroomData.isAchieved}
              setChecked={(checked) =>
                setClassroomData((prev) => ({ ...prev, isAchieved: checked }))
              }
            />
          </div>
          <p className="break-all text-sm text-icon-color/60">
            {text.classroomId(lang)}:{" "}
            <Link
              href={`/classroom/${classroomData.id}`}
              className="font-medium text-primary-color hover:underline"
            >
              {classroomData.id}
            </Link>
          </p>
        </div>
        <div className="mt-6 flex justify-end border-t border-icon-color/10 pt-5">
          <button
            type="submit"
            disabled={update.isPending}
            aria-busy={update.isPending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-color px-6 font-semibold text-white transition-colors hover:bg-primary-color-hover disabled:cursor-wait disabled:opacity-80 sm:w-auto"
          >
            {update.isPending
              ? classroomUiLanguage.saving(lang)
              : text.saveButton(lang)}
          </button>
        </div>
      </form>

      <section
        aria-labelledby="classroom-danger-zone"
        className="rounded-2xl border border-error-color/30 bg-white p-5 sm:p-6"
      >
        <h2 id="classroom-danger-zone" className="text-lg font-bold text-error-color">
          {text.danger(lang)}
        </h2>
        <p className="mt-1 text-sm text-icon-color/70">{text.dangerDescription(lang)}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium text-icon-color">{text.deleteTitle(lang)}</p>
            <p className="mt-0.5 text-sm text-icon-color/70">
              {text.deleteDescription(lang)}
            </p>
            {cannotDelete && (
              <p className="mt-1 text-sm text-error-color">
                {classroomUiLanguage.deleteOnlyOwner(lang)}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={cannotDelete}
            onClick={() =>
              ConfirmDeleteMessage({
                language: lang,
                callback: handleDeleteClassroom,
              })
            }
            className="h-11 shrink-0 rounded-xl border border-error-color px-5 font-semibold text-error-color transition-colors hover:bg-error-color hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-error-color"
          >
            {text.deleteButton(lang)}
          </button>
        </div>
      </section>
    </section>
  );
}

export default ClassroomSetting;
