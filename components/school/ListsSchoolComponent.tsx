import { School } from "@/interfaces";
import Image from "next/image";
import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { defaultBlurHash } from "../../data";
import { homepageDataLanguage } from "../../data/languages";
import {
  useGetLanguage,
  useGetSchools,
  useGetUser,
  useUpdateUser,
} from "../../react-query";
import { decodeBlurhashToCanvas } from "../../utils";
import PlanBadge from "../common/PlanBadge";

const NoSchoolsComponent = () => (
  <div className="py-12 text-center text-gray-500">
    <p className="text-lg font-semibold">No schools found.</p>
    <p className="mt-1 text-sm">
      Try adjusting your search or create a new school.
    </p>
  </div>
);

const ListsSchoolComponent = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear] = useState<string>("");
  const language = useGetLanguage();
  const update = useUpdateUser();
  const user = useGetUser();
  const [favorites, setFavorites] = useState<string | null>(
    user.data?.favoritSchool ?? null,
  );
  const tableHeaders = ["Name", "Plan", "Create At", "Description", "Action"];
  const inputClasses = "border rounded-2xl px-4 py-2 w-full";
  const schools = useGetSchools();

  useEffect(() => {
    if (!user.data) return;
    setFavorites(() => user.data?.favoritSchool ?? null);
  }, [user.isSuccess]);
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

  // Handler to toggle a school's favorite status
  const handleFavoriteToggle = (schoolId: string) => {
    setFavorites(schoolId);
    update.mutate({
      favoritSchool: schoolId,
    });
  };

  const formatDate = (dateInput: string | number | Date) => {
    return new Date(dateInput).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="mx-auto flex w-full flex-col items-center">
      <header className="gradient-bg flex h-96 w-full flex-col items-start justify-center p-10">
        <h2 className="mb-4 text-4xl font-semibold text-white">
          {homepageDataLanguage.welcome(language.data ?? "en")},{" "}
          {user.data?.firstName}
          <span role="img" aria-label="wave">
            {" "}
            👋
          </span>
        </h2>
        <p className="mb-8 text-gray-300">
          {homepageDataLanguage.welcomeDetail(language.data ?? "en")}
        </p>
      </header>

      <div className="relative -top-28 w-full max-w-7xl rounded-2xl bg-white p-4 shadow-lg md:w-11/12 md:p-6">
        <h3 className="mb-4 text-xl font-semibold">
          {homepageDataLanguage.selectSchool(language.data ?? "en")}
        </h3>
        <p className="mb-6 text-gray-600">
          {homepageDataLanguage.selectSchoolDetail(language.data ?? "en")}
        </p>

        <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClasses} flex-grow md:w-auto`}
            aria-label="Search schools"
          />
          <Link
            className="w-full shrink-0 rounded-2xl bg-secondary-color px-6 py-2 text-center text-white transition duration-300 hover:bg-primary-color active:scale-105 md:w-auto"
            href="/school/create"
          >
            {homepageDataLanguage.create(language.data ?? "en")}
          </Link>
        </div>

        {/* --- Responsive List Container --- */}
        <div className="overflow-x-auto">
          {schools.isLoading ? (
            <p className="py-12 text-center">Loading schools...</p>
          ) : filteredSchools && filteredSchools.length > 0 ? (
            <>
              {/* --- Desktop Table (Hidden on mobile) --- */}
              <table className="hidden min-w-full divide-y divide-gray-200 md:table">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredSchools.map((school: School) => {
                    const isFavorited = favorites === school.id;

                    return (
                      <tr
                        key={school.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-2xl">
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
                              className="max-w-96 truncate font-medium text-primary-color underline-offset-2 hover:underline"
                            >
                              {school.title}
                            </Link>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <PlanBadge plan={school.plan} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {formatDate(school.createAt)}
                        </td>
                        <td className="max-w-xs truncate whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                          <Link
                            href={`/school/${school.id}`}
                            className="hover:underline"
                            title={school.description}
                          >
                            {school.description}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleFavoriteToggle(school.id)}
                              aria-label={
                                isFavorited
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                              className="rounded-full p-1 transition-colors hover:bg-gray-200"
                            >
                              {isFavorited ? (
                                <MdFavorite className="text-red-500" />
                              ) : (
                                <MdFavoriteBorder />
                              )}
                            </button>
                            <Link
                              href={`/school/${school.id}`}
                              className="main-button text-nowrap"
                            >
                              {homepageDataLanguage.join(language.data ?? "en")}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* --- Mobile Card List (Hidden on desktop) --- */}
              <div className="block space-y-4 md:hidden">
                {filteredSchools.map((school: School) => {
                  const isFavorited = favorites === school.id;
                  return (
                    <div
                      key={school.id}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between pb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-2xl">
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
                            className="max-w-40 truncate font-semibold text-primary-color"
                          >
                            {school.title}
                          </Link>
                          <div>
                            <PlanBadge plan={school.plan} />
                          </div>
                        </div>
                        <button
                          onClick={() => handleFavoriteToggle(school.id)}
                          aria-label={
                            isFavorited
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          className="-mr-1 -mt-1 p-1"
                        >
                          {isFavorited ? (
                            <MdFavorite className="text-red-500" />
                          ) : (
                            <MdFavoriteBorder />
                          )}{" "}
                        </button>
                      </div>

                      {/* Card Body */}
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                        {school.description}
                      </p>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(school.createAt)}
                        </span>
                        <Link
                          href={`/school/${school.id}`}
                          className="main-button text-nowrap"
                        >
                          {homepageDataLanguage.join(language.data ?? "en")}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <NoSchoolsComponent />
          )}
        </div>
      </div>
    </main>
  );
};

export default memo(ListsSchoolComponent);
