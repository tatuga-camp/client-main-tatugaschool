import { useGetSchool } from "../../react-query";

type Props = {
  schoolId: string;
};
const Stats = ({ schoolId }: Props) => {
  const school = useGetSchool({ schoolId: schoolId });
  return (
    <div className="p-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-24">
        <div className="bg-white text-primary-color p-10 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total teachers in school</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {school.data?.totalTeacher}
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
        <div className="bg-white text-primary-color p-10 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total students</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {school.data?.totalStudent}
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
        <div className="bg-white text-primary-color p-10 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total subjects</p>
            <h2 className="text-2xl font-bold text-gray-900">
              {" "}
              {school.data?.totalSubject}
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
      </div>
    </div>
  );
};

export default Stats;
