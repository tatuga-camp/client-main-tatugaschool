import React, { memo } from "react";
import { useGetLanguage, useGetSubject } from "../../react-query";
import Switch from "../common/Switch";
import { ProgressSpinner } from "primereact/progressspinner";
import { CiSaveDown2 } from "react-icons/ci";
import { settingOnSubjectDataLanguage } from "../../data/languages";

type Props = {
  subjectId: string;
  onSummit: (
    e: React.FormEvent<HTMLFormElement>,
    data: {
      allowStudentDeleteWork?: boolean;
      allowStudentViewOverallScore?: boolean;
      allowStudentViewGrade?: boolean;
      allowStudentViewAttendance?: boolean;
    },
  ) => void;
  isPending: boolean;
};
function SubjectPermission({ subjectId, onSummit, isPending }: Props) {
  const subject = useGetSubject({ subjectId });
  const language = useGetLanguage();
  const [permission, setPermission] = React.useState<{
    allowStudentDeleteWork?: boolean;
    allowStudentViewOverallScore?: boolean;
    allowStudentViewGrade?: boolean;
    allowStudentViewAttendance?: boolean;
  }>();

  React.useEffect(() => {
    if (subject.data) {
      setPermission({
        allowStudentDeleteWork: subject.data.allowStudentDeleteWork,
        allowStudentViewOverallScore: subject.data.allowStudentViewOverallScore,
        allowStudentViewGrade: subject.data.allowStudentViewGrade,
        allowStudentViewAttendance: subject.data.allowStudentViewAttendance,
      });
    }
  }, [subject.status]);
  return (
    <form
      onSubmit={(e) => {
        if (permission) {
          onSummit(e, permission);
        }
      }}
      className="mt-5 flex min-h-80 flex-col gap-5 rounded-2xl border bg-white p-4"
    >
      <h2 className="border-b py-3 text-lg font-medium">
        {settingOnSubjectDataLanguage.subjectPermission(language.data ?? "en")}
      </h2>
      <div className="flex flex-col gap-4 sm:grid-cols-2">
        <div className="flex p-2 py-4">
          <label className="flex w-full items-center">
            <span className="flex-1 text-base text-black">
              {settingOnSubjectDataLanguage.allowDelete(language.data ?? "en")}:
            </span>
            <Switch
              checked={permission?.allowStudentDeleteWork}
              setChecked={(data) => {
                setPermission((prev) => ({
                  ...prev,
                  allowStudentDeleteWork: data,
                }));
              }}
            />
          </label>
        </div>
        <div className="flex gap-5 bg-gray-200/20 p-2 py-4">
          <label className="flex w-full items-center">
            <span className="flex-1 text-base text-black">
              {settingOnSubjectDataLanguage.allowViewScore(
                language.data ?? "en",
              )}
              :
            </span>
            <Switch
              checked={permission?.allowStudentViewOverallScore}
              setChecked={(data) => {
                setPermission((prev) => ({
                  ...prev,
                  allowStudentViewOverallScore: data,
                }));
              }}
            />
          </label>
        </div>
        <div className="flex gap-5 p-2 py-4">
          <label className="flex w-full items-center">
            <span className="flex-1 text-base text-black">
              {settingOnSubjectDataLanguage.allowViewGrade(
                language.data ?? "en",
              )}
              :
            </span>
            <Switch
              checked={permission?.allowStudentViewGrade}
              setChecked={(data) => {
                setPermission((prev) => ({
                  ...prev,
                  allowStudentViewGrade: data,
                }));
              }}
            />
          </label>
        </div>
        <div className="flex gap-5 bg-gray-200/20 p-2 py-4">
          <label className="flex w-full items-center">
            <span className="flex-1 text-base text-black">
              {settingOnSubjectDataLanguage.allowViewAttendance(
                language.data ?? "en",
              )}
              :
            </span>
            <Switch
              checked={permission?.allowStudentViewAttendance}
              setChecked={(data) => {
                setPermission((prev) => ({
                  ...prev,
                  allowStudentViewAttendance: data,
                }));
              }}
            />
          </label>
        </div>
      </div>
      <button
        disabled={isPending}
        className="main-button mt-5 flex w-full items-center justify-center sm:w-60"
      >
        {isPending ? (
          <ProgressSpinner
            animationDuration="1s"
            style={{ width: "20px" }}
            className="h-5 w-5"
            strokeWidth="8"
          />
        ) : (
          <div className="flex items-center justify-center gap-1">
            <CiSaveDown2 />
            {settingOnSubjectDataLanguage.save(language.data ?? "en")}
          </div>
        )}
      </button>
    </form>
  );
}

export default memo(SubjectPermission);
