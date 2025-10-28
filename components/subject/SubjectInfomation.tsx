import Link from "next/link";
import React, { memo } from "react";
import { useGetLanguage, useGetSubject } from "../../react-query";
import InputNumber from "../common/InputNumber";
import { ProgressSpinner } from "primereact/progressspinner";
import { CiSaveDown2 } from "react-icons/ci";
import InputEducationYear from "../common/InputEducationYear";
import { settingOnSubjectDataLanguage } from "../../data/languages";

type Props = {
  onSummit: (
    e: React.FormEvent<HTMLFormElement>,
    data: {
      title?: string;
      description?: string;
      code?: string;
      educationYear?: string;
    },
  ) => void;
  subjectId: string;
  isPending?: boolean;
};
function SubjectInfomation({ onSummit, subjectId, isPending = false }: Props) {
  const subject = useGetSubject({ subjectId });
  const language = useGetLanguage();
  const [subjectBasicInfo, setSubjectBasicInfo] = React.useState<{
    name?: string;
    description?: string;
    code?: string;
    year?: string;
    term?: string;
  }>();

  React.useEffect(() => {
    if (subject.data) {
      const split = subject.data.educationYear.split("/");
      const term = split[0];
      const year = split[1];
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
      className="mt-5 flex min-h-80 flex-col gap-5 rounded-2xl border bg-white p-4"
    >
      <h2 className="border-b py-3 text-lg font-medium">
        {settingOnSubjectDataLanguage.info(language.data ?? "en")}
      </h2>
      <div className="grid w-full grid-cols-1">
        <div className="grid grid-cols-1 gap-5 bg-gray-200/20 p-2 py-4">
          <label className="grid w-full md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">
              {settingOnSubjectDataLanguage.subjectId(language.data ?? "en")}:
            </span>
            <Link
              target="_blank"
              href={`/subject/${subject.data?.id}`}
              className="text-base font-semibold text-blue-600 underline"
            >
              {subject.data?.id}
            </Link>
          </label>
        </div>
        <div className="grid grid-cols-1 gap-5 p-2 py-4">
          <label className="grid w-full md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">
              {settingOnSubjectDataLanguage.connectClassId(
                language.data ?? "en",
              )}
              :
            </span>
            <Link
              target="_blank"
              href={`/classroom/${subject.data?.classId}`}
              className="text-base font-semibold text-blue-600 underline"
            >
              {subject.data?.classId}
            </Link>
          </label>
        </div>
        <div className="grid grid-cols-1 gap-5 bg-gray-200/20 p-2 py-4">
          <label className="grid w-full md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">
              {settingOnSubjectDataLanguage.code(language.data ?? "en")}:
            </span>
            <span className="text-base font-semibold text-black">
              {subject.data?.code}
            </span>
          </label>
        </div>
        <div className="grid grid-cols-1 gap-5 p-2 py-4">
          <label className="grid w-full items-center md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">
              {settingOnSubjectDataLanguage.name(language.data ?? "en")}:
            </span>
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
              placeholder={settingOnSubjectDataLanguage.name(
                language.data ?? "en",
              )}
              className="main-input"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-5 bg-gray-200/20 p-2 py-4">
          <label className="grid w-full items-center md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">
              {settingOnSubjectDataLanguage.description(language.data ?? "en")}:
            </span>
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
              placeholder={settingOnSubjectDataLanguage.description(
                language.data ?? "en",
              )}
              className="main-input"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-5 p-2 py-4">
          <label className="grid w-1/2 items-center md:w-full md:grid-cols-2 md:gap-10">
            <span className="text-base text-black">
              {settingOnSubjectDataLanguage.educationYear(
                language.data ?? "en",
              )}
              :
            </span>
            <div className="flex items-center gap-2">
              {subjectBasicInfo?.term && subjectBasicInfo.year && (
                <InputEducationYear
                  required={true}
                  value={`${subjectBasicInfo?.term}/${subjectBasicInfo?.year}`}
                  onChange={(value) => {
                    const valueSplit = value.split("/");
                    setSubjectBasicInfo((prev) => {
                      return {
                        ...prev,
                        term: valueSplit[0],
                        year: valueSplit[1],
                      };
                    });
                  }}
                />
              )}
            </div>
          </label>
        </div>
      </div>
      <button
        disabled={isPending}
        className="main-button mt-5 flex w-60 items-center justify-center"
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

export default memo(SubjectInfomation);
