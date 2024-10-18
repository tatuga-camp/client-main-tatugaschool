import React, { useEffect, useState, memo } from "react";
import { GetSchoolService, DeleteSchoolService } from "@/services";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { School } from "@/interfaces";
import Swal from "sweetalert2";
import useUserStore from '@/store/userStore';

const ListsSchoolComponent = () => {
  const { user } = useUserStore();
  

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const tableHeaders = ["Name", "Description", "Action"];
  const inputClasses = "border rounded-md px-4 py-2";
  const buttonClasses =
    "bg-[#6f47dd] text-white px-6 py-2 rounded-lg w-full md:w-auto";

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response: School[] = await GetSchoolService();
      setSchools(response);
    } catch (error) {
      console.error("Error fetching school data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchool = async (id: string, schoolName: string) => {
    const { value: inputValue } = await Swal.fire({
      title: "Are you sure?",
      text: `To confirm, please type the name of the school: ${schoolName}`,
      input: "text",
      inputPlaceholder: "Type the school name",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      inputValidator: (value) => {
        if (!value) {
          return "You need to type the school name!";
        }
        if (value !== schoolName) {
          return "The name doesn't match!";
        }
        return null;
      },
    });

    if (inputValue === schoolName) {
      await DeleteSchoolService({ schoolId: id });
      fetchSchools();
      Swal.fire("Deleted!", "The school has been deleted.", "success");
    } else {
      Swal.fire("Cancelled", "The school was not deleted.", "error");
    }
  };

  const filteredSchools = schools.filter((school) => {
    const matchesSearchTerm = school.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear
      ? getYearFromDate(school.createAt) === selectedYear
      : true;
    return matchesSearchTerm && matchesYear;
  });

  function getYearFromDate(dateInput: string | number | Date) {
    const date = new Date(dateInput);
    return date.getFullYear().toString();
  }
  function createYearArray(startYear: number, endYear: number) {
    let years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year.toString());
    }
    return years.reverse();
  }

  const startYear = 1990;
  const endYear = new Date().getFullYear();
  const uniqueYears = createYearArray(startYear, endYear);

  return (
    <main className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-4xl font-semibold text-white mb-4">
        Welcome Back, {user?.firstName}
        <span role="img" aria-label="wave">
          👋
        </span>
      </h2>
      <p className="text-gray-300 mb-8">
        This is your Homepage Schools Dashboard.
      </p>

      <div className="bg-white rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Select Your School</h3>
        <p className="text-gray-600 mb-6">Lists of your school</p>

        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <select
            className={`${inputClasses} w-full md:w-40`}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label="Year education"
          >
            <option value="">All Years</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClasses} flex-grow w-full md:w-auto`}
            aria-label="Search schools"
          />
          <Link className={buttonClasses} href="/school/create">
            + create school
          </Link>
        </div>

        <div className="overflow-auto">
          {loading ? (
            <p>Loading schools...</p>
          ) : (
            <table className="min-w-full table-auto text-left">
              <thead>
                <tr className="bg-gray-100">
                  {tableHeaders.map((header, index) => (
                    <th key={index} className="p-4">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((school, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4">
                        <div className="flex items-center">
                          <span className="ml-2 text-gray-500">
                            {school.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="ml-2 text-gray-500">
                          {school.description}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          aria-label="Delete"
                          onClick={() =>
                            handleDeleteSchool(school.id, school.title)
                          }
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="text-red-500"
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      No schools found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
};

export default memo(ListsSchoolComponent);
