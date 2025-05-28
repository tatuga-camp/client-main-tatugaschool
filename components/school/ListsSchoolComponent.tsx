import React, { useState, memo } from "react";
import Link from "next/link";
import { School } from "@/interfaces";
import { useGetLanguage, useGetSchools, useGetUser } from "../../react-query";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import { homepageDataLanguage } from "../../data/languages";

const ListsSchoolComponent = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear] = useState<string>("");
  const language = useGetLanguage();
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
    <main className="mx-auto flex w-full flex-col items-center">
      <header className="gradient-bg flex h-96 w-full flex-col items-start justify-center p-10">
        <h2 className="mb-4 text-4xl font-semibold text-white">
          {homepageDataLanguage.welcome(language.data ?? "en")},{" "}
          {user?.firstName}
          <span role="img" aria-label="wave">
            👋
          </span>
        </h2>
        <p className="mb-8 text-gray-300">
          {homepageDataLanguage.welcomeDetail(language.data ?? "en")}
        </p>
      </header>
      <div className="relative -top-28 w-full rounded-lg bg-white p-6 md:w-10/12">
        <h3 className="mb-4 text-xl font-semibold">
          {homepageDataLanguage.selectSchool(language.data ?? "en")}
        </h3>
        <p className="mb-6 text-gray-600">
          {homepageDataLanguage.selectSchoolDetail(language.data ?? "en")}
        </p>

        <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClasses} w-full flex-grow md:w-auto`}
            aria-label="Search schools"
          />
          <Link
            className="w-full rounded-md bg-secondary-color px-6 py-2 text-white transition duration-300 hover:bg-primary-color active:scale-105 md:w-auto"
            href="/school/create"
          >
            {homepageDataLanguage.create(language.data ?? "en")}
          </Link>
        </div>

        <div className="overflow-auto">
          {schools.isLoading ? (
            <p>Loading schools...</p>
          ) : (
            <table className="w-max min-w-full table-auto text-left">
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
                          <div className="relative h-10 w-10 overflow-hidden rounded-md">
                            <Image
                              src={school.logo}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              placeholder="blur"
                              blurDataURL={decodeBlurhashToCanvas(
                                school.blurHash || defaultBlurHash,
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
                          },
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
                          {homepageDataLanguage.join(language.data ?? "en")}
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
