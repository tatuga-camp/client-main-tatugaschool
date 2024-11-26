import React, { memo } from "react";
import { useGetSubject } from "../../react-query";
import Switch from "../common/Switch";
import { ProgressSpinner } from "primereact/progressspinner";
import { CiSaveDown2 } from "react-icons/ci";

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
      <h2 className="border-b text-lg font-medium py-3">Subject Permission</h2>
      <div className="grid grid-cols-1 ">
        <div className="grid grid-cols-1 p-2 py-4">
          <label className="w-full grid grid-cols-2 gap-10">
            <span className="text-base text-black">
              Allow Student To Delete Their Work:
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
        <div className="grid grid-cols-1 bg-gray-200/20 gap-5  p-2 py-4">
          <label className="w-full grid grid-cols-2 gap-10">
            <span className="text-base text-black">
              Allow Student To View Overall Score:
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
        <div className="grid grid-cols-1  gap-5  p-2 py-4">
          <label className="w-full grid grid-cols-2 gap-10">
            <span className="text-base text-black">
              Allow Student To View Grade:
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
        <div className="grid grid-cols-1 bg-gray-200/20 gap-5  p-2 py-4">
          <label className="w-full grid grid-cols-2 gap-10">
            <span className="text-base text-black">
              Allow Student To View Attendance Record:
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
        className="main-button flex justify-center items-center  w-40 mt-5"
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
            Save Changes
          </div>
        )}
      </button>
    </form>
  );
}

export default memo(SubjectPermission);
