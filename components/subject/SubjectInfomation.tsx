import Link from "next/link";
import React, { memo } from "react";
import { useGetSubject } from "../../react-query";
import InputNumber from "../common/InputNumber";
import { ProgressSpinner } from "primereact/progressspinner";
import { CiSaveDown2 } from "react-icons/ci";

type Props = {
  onSummit: (
    e: React.FormEvent<HTMLFormElement>,
    data: {
      title?: string;
      description?: string;
      code?: string;
      educationYear?: string;
    }
  ) => void;
  subjectId: string;
  isPending?: boolean;
};
function SubjectInfomation({ onSummit, subjectId, isPending = false }: Props) {
  const subject = useGetSubject({ subjectId });

  const [subjectBasicInfo, setSubjectBasicInfo] = React.useState<{
    name?: string;
    description?: string;
    code?: string;
    year?: string;
    term?: string;
  }>();

  React.useEffect(() => {
    if (subject.data) {
      const term = subject.data.educationYear.split("/")[0];
      const year = subject.data.educationYear.split("/")[1];
      setSubjectBasicInfo({
        name: subject.data.title,
        description: subject.data.description,
        code: subject.data.code,
        term: term,
        year: year,
      });
    }
  }, [subject.data]);
  return (
    <form
      onSubmit={(e) => {
        if (subjectBasicInfo) {
          onSummit(e, {
            title: subjectBasicInfo.name,
            description: subjectBasicInfo.description,
            code: subjectBasicInfo.code,
            educationYear: `${subjectBasicInfo.term}/${subjectBasicInfo.year}`,
          });
        }
      }}
      className="flex flex-col p-4 min-h-80 bg-white rounded-md border gap-5 mt-5"
    >
      <h2 className="border-b text-lg font-medium py-3">Subject Infomation</h2>
      <div className="grid grid-cols-1 w-full">
        <div className="grid grid-cols-1  bg-gray-200/20 gap-5  p-2 py-4">
          <label className="w-full grid md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">Subject ID:</span>
            <Link
              target="_blank"
              href={`/subject/${subject.data?.id}`}
              className="text-base font-semibold underline  text-blue-600"
            >
              {subject.data?.id}
            </Link>
          </label>
        </div>
        <div className="grid grid-cols-1  gap-5  p-2 py-4">
          <label className="w-full grid md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">
              The Subject Connect To Class ID:
            </span>
            <Link
              target="_blank"
              href={`/class/${subject.data?.classId}`}
              className="text-base font-semibold underline  text-blue-600"
            >
              {subject.data?.classId}
            </Link>
          </label>
        </div>
        <div className="grid grid-cols-1  gap-5 bg-gray-200/20  p-2 py-4">
          <label className="w-full grid md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">Subject Code:</span>
            <span className="text-base font-semibold  text-black">
              {subject.data?.code}
            </span>
          </label>
        </div>
        <div className="grid grid-cols-1   gap-5  p-2 py-4">
          <label className="w-full items-center grid md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">Subject Name:</span>
            <input
              required
              type="text"
              value={subjectBasicInfo?.name}
              onChange={(e) => {
                setSubjectBasicInfo({
                  ...subjectBasicInfo,
                  name: e.target.value,
                });
              }}
              placeholder="Subject Name"
              className="main-input"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 bg-gray-200/20   gap-5  p-2 py-4">
          <label className="w-full items-center grid md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">Description:</span>
            <input
              required
              type="text"
              value={subjectBasicInfo?.description}
              onChange={(e) => {
                setSubjectBasicInfo({
                  ...subjectBasicInfo,
                  description: e.target.value,
                });
              }}
              placeholder="Description"
              className="main-input"
            />
          </label>
        </div>
        <div className="grid grid-cols-1  gap-5  p-2 py-4">
          <label className="w-1/2 md:w-full items-center grid md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">Education Year:</span>
            <div className="flex items-center gap-2">
              <InputNumber
                required
                value={Number(subjectBasicInfo?.term)}
                onValueChange={(e) =>
                  setSubjectBasicInfo({
                    ...subjectBasicInfo,
                    term: e?.toString(),
                  })
                }
                min={1}
                useGrouping={false}
                max={10}
              />

              <span className="text-4xl">/</span>
              <InputNumber
                required
                value={Number(subjectBasicInfo?.year)}
                onValueChange={(e) =>
                  setSubjectBasicInfo({
                    ...subjectBasicInfo,
                    year: e.toString(),
                  })
                }
                min={1999}
                useGrouping={false}
                max={new Date().getFullYear() + 1}
              />
            </div>
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

export default memo(SubjectInfomation);
