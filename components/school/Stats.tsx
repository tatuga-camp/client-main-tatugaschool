import { schoolDataLanguage } from "../../data/languages";
import { useGetLanguage, useGetSchool } from "../../react-query";
import { filesize } from "filesize";

type Props = {
  schoolId: string;
};
const Stats = ({ schoolId }: Props) => {
  const school = useGetSchool({ schoolId: schoolId });
  const language = useGetLanguage();
  return (
    <div className="px-4 py-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
      <div className="-mt-20 grid grid-cols-1 gap-3 sm:-mt-24 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4 2xl:gap-6">
        <div className="flex min-w-0 items-center justify-between rounded-2xl border bg-white p-3 text-primary-color sm:p-4 xl:p-6">
          <div className="min-w-0 pr-2">
            <p className="break-words text-sm text-gray-600 sm:text-base">
              {schoolDataLanguage.totalTeacher(language.data ?? "en")}
            </p>
            <h2 className="break-words font-bold text-gray-900 lg:text-lg xl:text-2xl">
              {school.data?.totalTeacher}/{" "}
              <span className="text-gray-400 lg:text-sm xl:text-lg">
                {school.data?.limitSchoolMember.toLocaleString()}
              </span>
            </h2>
          </div>
          <div className="shrink-0 text-green-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="h-6 w-6"
            >
              <path d="M4 22V10h4v12H4zm6-8h4v8h-4v-8zm6-4h4v12h-4V10z"></path>
            </svg>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-between rounded-2xl border bg-white p-3 text-primary-color sm:p-4 xl:p-6">
          <div className="min-w-0 pr-2">
            <p className="break-words text-sm text-gray-600 sm:text-base">
              {schoolDataLanguage.totalClassroom(language.data ?? "en")}
            </p>
            <h2 className="break-words font-bold text-gray-900 lg:text-lg xl:text-2xl">
              {school.data?.totalClass}/{" "}
              <span className="text-gray-400 lg:text-sm xl:text-lg">
                {school.data?.plan === "ENTERPRISE"
                  ? language.data === "en"
                    ? "Unlimited"
                    : "ไม่จำกัด"
                  : school.data?.limitClassNumber.toLocaleString()}{" "}
              </span>
            </h2>
          </div>
          <div className="shrink-0 text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="h-6 w-6"
            >
              <path d="M4 22V10h4v12H4zm6-8h4v8h-4v-8zm6-4h4v12h-4V10z"></path>
            </svg>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-between rounded-2xl border bg-white p-3 text-primary-color sm:p-4 xl:p-6">
          <div className="min-w-0 pr-2">
            <p className="break-words text-sm text-gray-600 sm:text-base">
              {schoolDataLanguage.totalSubject(language.data ?? "en")}
            </p>
            <h2 className="break-words font-bold text-gray-900 lg:text-lg xl:text-2xl">
              {" "}
              {school.data?.totalSubject} /{" "}
              <span className="text-gray-400 lg:text-sm xl:text-lg">
                {school.data?.plan === "ENTERPRISE"
                  ? language.data === "en"
                    ? "Unlimited"
                    : "ไม่จำกัด"
                  : school.data?.limitSubjectNumber.toLocaleString()}{" "}
              </span>
            </h2>
          </div>
          <div className="shrink-0 text-yellow-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="h-6 w-6"
            >
              <path d="M4 22V10h4v12H4zm6-8h4v8h-4v-8zm6-4h4v12h-4V10z"></path>
            </svg>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-between rounded-2xl border bg-white p-3 text-primary-color sm:p-4 xl:p-6">
          <div className="min-w-0 pr-2">
            <p className="break-words text-sm text-gray-600 sm:text-base">
              {schoolDataLanguage.totalStorage(language.data ?? "en")}
            </p>
            <h2 className="break-words font-bold text-gray-900 lg:text-lg xl:text-2xl">
              {" "}
              {filesize(school.data?.totalStorage ?? 0, {
                standard: "jedec",
              })}{" "}
              /{" "}
              <span className="text-gray-400 lg:text-sm xl:text-lg">
                {school.data?.plan === "FREE"
                  ? "15 GB"
                  : language.data === "en"
                    ? "Unlimited"
                    : "ไม่จำกัด"}
              </span>
            </h2>
          </div>
          <div className="shrink-0 text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="h-6 w-6"
            >
              <path d="M4 22V10h4v12H4zm6-8h4v8h-4v-8zm6-4h4v12h-4V10z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
