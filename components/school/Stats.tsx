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
    <div className="md:p-5 lg:p-5 xl:p-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 xl:gap-4 -mt-24">
        <div
          className="bg-white border text-primary-color md:p-4 xl:p-6 rounded-2xl
         flex items-center justify-between"
        >
          <div>
            <p className="text-gray-600">
              {schoolDataLanguage.totalTeacher(language.data ?? "en")}
            </p>
            <h2 className="lg:text-lg xl:text-2xl font-bold text-gray-900">
              {school.data?.totalTeacher}/{" "}
              <span className="lg:text-sm xl:text-lg text-gray-400">
                {school.data?.limitSchoolMember.toLocaleString()}
              </span>
            </h2>
          </div>
          <div className="text-green-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M4 22V10h4v12H4zm6-8h4v8h-4v-8zm6-4h4v12h-4V10z"></path>
            </svg>
          </div>
        </div>
        <div className="bg-white border text-primary-color md:p-4 xl:p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-600">
              {schoolDataLanguage.totalClassroom(language.data ?? "en")}
            </p>
            <h2 className="lg:text-lg xl:text-2xl font-bold text-gray-900">
              {school.data?.totalClass}/{" "}
              <span className="lg:text-sm xl:text-lg text-gray-400">
                {school.data?.limitClassNumber.toLocaleString()}
              </span>
            </h2>
          </div>
          <div className="text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M4 22V10h4v12H4zm6-8h4v8h-4v-8zm6-4h4v12h-4V10z"></path>
            </svg>
          </div>
        </div>
        <div className="bg-white border text-primary-color md:p-4 xl:p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-600">
              {schoolDataLanguage.totalSubject(language.data ?? "en")}
            </p>
            <h2 className="lg:text-lg xl:text-2xl font-bold text-gray-900">
              {" "}
              {school.data?.totalSubject} /{" "}
              <span className="lg:text-sm xl:text-lg text-gray-400">
                {school.data?.limitSubjectNumber.toLocaleString()}
              </span>
            </h2>
          </div>
          <div className="text-yellow-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path d="M4 22V10h4v12H4zm6-8h4v8h-4v-8zm6-4h4v12h-4V10z"></path>
            </svg>
          </div>
        </div>
        <div className="bg-white border text-primary-color md:p-4 xl:p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-600">
              {schoolDataLanguage.totalStorage(language.data ?? "en")}
            </p>
            <h2 className="lg:text-lg xl:text-2xl font-bold text-gray-900">
              {" "}
              {filesize(school.data?.totalStorage ?? 0, {
                standard: "jedec",
              })}{" "}
              /{" "}
              <span className="lg:text-sm xl:text-lg text-gray-400">
                {filesize(school.data?.limitTotalStorage ?? 0, {
                  standard: "jedec",
                })}
              </span>
            </h2>
          </div>
          <div className="text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
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
