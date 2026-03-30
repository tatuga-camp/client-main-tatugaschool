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
    <div className="p-4 md:p-5 lg:p-5 xl:p-12">
      <div className="-mt-24 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 xl:gap-4">
        <div className="flex items-center justify-between rounded-2xl border bg-white p-2 text-primary-color md:p-4 xl:p-6">
          <div>
            <p className="text-gray-600">
              {schoolDataLanguage.totalTeacher(language.data ?? "en")}
            </p>
            <h2 className="font-bold text-gray-900 lg:text-lg xl:text-2xl">
              {school.data?.totalTeacher}/{" "}
              <span className="text-gray-400 lg:text-sm xl:text-lg">
                {school.data?.limitSchoolMember.toLocaleString()}
              </span>
            </h2>
          </div>
          <div className="text-green-400">
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
        <div className="flex items-center justify-between rounded-2xl border bg-white p-2 text-primary-color md:p-4 xl:p-6">
          <div>
            <p className="text-gray-600">
              {schoolDataLanguage.totalClassroom(language.data ?? "en")}
            </p>
            <h2 className="font-bold text-gray-900 lg:text-lg xl:text-2xl">
              {school.data?.totalClass}/{" "}
              <span className="text-gray-400 lg:text-sm xl:text-lg">
                {school.data?.limitClassNumber.toLocaleString()}
              </span>
            </h2>
          </div>
          <div className="text-blue-400">
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
        <div className="flex items-center justify-between rounded-2xl border bg-white p-2 text-primary-color md:p-4 xl:p-6">
          <div>
            <p className="text-gray-600">
              {schoolDataLanguage.totalSubject(language.data ?? "en")}
            </p>
            <h2 className="font-bold text-gray-900 lg:text-lg xl:text-2xl">
              {" "}
              {school.data?.totalSubject} /{" "}
              <span className="text-gray-400 lg:text-sm xl:text-lg">
                {school.data?.limitSubjectNumber.toLocaleString()}
              </span>
            </h2>
          </div>
          <div className="text-yellow-400">
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
        <div className="flex items-center justify-between rounded-2xl border bg-white p-2 text-primary-color md:p-4 xl:p-6">
          <div>
            <p className="text-gray-600">
              {schoolDataLanguage.totalStorage(language.data ?? "en")}
            </p>
            <h2 className="font-bold text-gray-900 lg:text-lg xl:text-2xl">
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
          <div className="text-red-400">
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
