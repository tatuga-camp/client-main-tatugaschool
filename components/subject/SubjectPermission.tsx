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
    }
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
      className="flex flex-col p-4 min-h-80 bg-white rounded-md border gap-5 mt-5"
    >
      <h2 className="border-b text-lg font-medium py-3">
        {settingOnSubjectDataLanguage.subjectPermission(language.data ?? "en")}
      </h2>
      <div className="flex flex-col sm:grid-cols-2 gap-4">
        <div className="flex p-2 py-4">
          <label className="w-full flex items-center">
            <span className="text-base text-black flex-1">
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
        <div className="flex bg-gray-200/20 gap-5 p-2 py-4">
          <label className="w-full flex items-center">
            <span className="text-base text-black flex-1">
              {settingOnSubjectDataLanguage.allowViewScore(
                language.data ?? "en"
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
          <label className="w-full flex items-center">
            <span className="text-base text-black flex-1">
              {settingOnSubjectDataLanguage.allowViewGrade(
                language.data ?? "en"
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
        <div className="flex bg-gray-200/20 gap-5 p-2 py-4">
          <label className="w-full flex items-center">
            <span className="text-base text-black flex-1">
              {settingOnSubjectDataLanguage.allowViewAttendance(
                language.data ?? "en"
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
        className="main-button flex justify-center items-center w-full sm:w-60 mt-5"
      >
        {isPending ? (
          <ProgressSpinner
            animationDuration="1s"
            style={{ width: "20px" }}
            className="w-5 h-5"
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
