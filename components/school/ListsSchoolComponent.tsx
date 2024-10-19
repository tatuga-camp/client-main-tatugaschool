import React, { useEffect, useState, memo } from "react";
import { GetSchoolService, DeleteSchoolService } from "@/services";
import Link from "next/link";
import { ErrorMessages, School, User } from "@/interfaces";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSchools, getUser } from "../../react-query";
import { MdDelete } from "react-icons/md";
import Image from "next/image";

const ListsSchoolComponent = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const user = getUser().data;
  const tableHeaders = ["Name", "Create At", "Description", "Action"];
  const inputClasses = "border rounded-md px-4 py-2";
  const buttonClasses =
    "bg-secondary-color text-white px-6 py-2 rounded-lg w-full md:w-auto";

  const schools = getSchools();
  const handleDeleteSchool = async (id: string, schoolName: string) => {
    const { value: inputValue } = await Swal.fire({
      title: "Are you sure?",
      html: `<div>
        <div>To confirm deleting school please type text below</div>
        <h1 style="font-weight: 700;">${schoolName}</h1>
      </div>`,
      input: "text",
      inputPlaceholder: "Type the school name",
      footer: "<p>This action cannot be undone</p>",
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

    try {
      Swal.fire({
        title: "Please wait...",
        text: "We are processing your request",
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      await DeleteSchoolService({ schoolId: id });
      const filterUnDeletedSchools = schools.data?.filter(
        (school: School) => school.id !== id
      );
      queryClient.setQueryData(["schools"], filterUnDeletedSchools);
      Swal.fire("Deleted!", "The school has been deleted.", "success");
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

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
                  filteredSchools?.map((school, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4">
                        <div className="flex items-center justify-start gap-1">
                          <div className="w-10 h-10 rounded-md overflow-hidden relative">
                            <Image
                              src={school.logo || "/favicon.ico"}
                              fill
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
                          className="main-button"
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
