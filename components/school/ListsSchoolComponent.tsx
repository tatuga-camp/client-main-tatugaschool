import React, { useState, memo } from "react";
import Link from "next/link";
import { School } from "@/interfaces";
import { useGetSchools, useGetUser } from "../../react-query";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";

const ListsSchoolComponent = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear] = useState<string>("");
  const user = useGetUser().data;
  const tableHeaders = ["Name", "Create At", "Description", "Action"];
  const inputClasses = "border rounded-md px-4 py-2";

  const schools = useGetSchools();

  const filteredSchools = schools.data?.filter((school: School) => {
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
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClasses} flex-grow w-full md:w-auto`}
            aria-label="Search schools"
          />
          <Link
            className="bg-secondary-color text-white px-6 py-2 rounded-md active:scale-105
             w-full md:w-auto hover:bg-primary-color transition duration-300"
            href="/school/create"
          >
            + create school
          </Link>
        </div>

        <div className="overflow-auto">
          {schools.isLoading ? (
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
                {filteredSchools && filteredSchools?.length > 0 ? (
                  filteredSchools?.map((school: School, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="p-4">
                        <div className="flex items-center justify-start gap-1">
                          <div className="w-10 h-10 rounded-md overflow-hidden relative">
                            <Image
                              src={school.logo}
                              fill
                              placeholder="blur"
                              blurDataURL={decodeBlurhashToCanvas(
                                school.blurHash || defaultBlurHash
                              )}
                              alt="logo tatuga school"
                              className="object-cover"
                            />
                          </div>
                          <Link
                            href={`/school/${school.id}`}
                            className="ml-2 text-primary-color underline underline-offset-1"
                          >
                            {school.title}
                          </Link>
                        </div>
                      </td>
                      <td className="p-4">
                        {new Date(school.createAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/school/${school.id}`}
                          className="ml-2 text-primary-color underline underline-offset-1"
                        >
                          {school.description}
                        </Link>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/school/${school.id}`}
                          className="main-button text-nowrap"
                        >
                          Join School
                        </Link>
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
