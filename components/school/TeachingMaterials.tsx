import { useEffect, useState } from "react";
import { MdOutlineSearch, MdOutlineSearchOff } from "react-icons/md";
import { TbAlertCircle } from "react-icons/tb";
import { TeachingMaterial } from "../../interfaces";
import {
  useGetLanguage,
  useGetSchool,
  useGetTeachingMaterialByAI,
  useGetTeachingMaterialsCount,
  useGetUser,
} from "../../react-query";
import { teachingMaterialDataLanguage as L } from "../../data/languages/teaching-material";
import LoadingBar from "../common/LoadingBar";
import PopupLayout from "../layout/PopupLayout";
import TeachingMaterialCard from "./TeachingMaterialCard";
import TeachingMaterialSection from "./TeachingMaterialSection";
import TeachingMaterialShow from "./TeachingMaterialShow";

type Props = {
  schoolId: string;
};

const suggestionsSearch = [
  {
    en: "Cute English worksheet for grade 2",
    th: "ใบงานภาษาอังกฤษของ ป.2 น่ารักๆ ให้รักเรียนวาดรูป",
  },
  {
    en: "Thai literature worksheets for primary school",
    th: "ใบงานวรรณกรรมไทย สำหรับประถม",
  },
  {
    en: "A cute teaching schedule table",
    th: "ตารางสอนน่ารัก ๆ",
  },
  {
    en: "Chinese worksheets for primary school",
    th: "ใบงานภาษาจีนสำหรับประถม",
  },
];

function TeachingMaterials({ schoolId }: Props) {
  const school = useGetSchool({ schoolId });
  const user = useGetUser();
  const languageQuery = useGetLanguage();
  const language = languageQuery.data === "th" ? "th" : "en";
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [teachingMaterials, setTeachingMaterials] = useState<
    TeachingMaterial[]
  >([]);
  const [triggerCreate, setTriggerCreate] = useState(false);
  const [totalFound, setTotalFound] = useState(0);
  const [selectTeachingMaterial, setSelectTeachingMaterial] =
    useState<TeachingMaterial | null>(null);
  const [displayedSuggestion, setDisplayedSuggestion] = useState("");
  const [filter, setFilter] = useState<"relevant" | "recent">("relevant");

  const teachingMaterialsCount = useGetTeachingMaterialsCount();

  const getTeachingMaterials = useGetTeachingMaterialByAI({
    ...(search !== "" && { search: search }),
    ...(filter === "recent" && { filter: "recent" }),
  });

  useEffect(() => {
    if (getTeachingMaterials.data) {
      // Assuming getTeachingMaterials.data is an array of pages, and each page is an array of materials
      setTotalFound(() => getTeachingMaterials.data.flat().length);
      setTeachingMaterials(() => getTeachingMaterials.data);
    }
  }, [getTeachingMaterials.data]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSearch(suggestion); // Immediately trigger search on suggestion click
  };

  const materials = teachingMaterials.flat();
  const showEmpty =
    !getTeachingMaterials.isLoading &&
    !getTeachingMaterials.error &&
    materials.length === 0;

  return (
    <>
      {triggerCreate && (
        <PopupLayout
          onClose={() => {
            setTriggerCreate(false);
          }}
        >
          <TeachingMaterialSection
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerCreate(false);
            }}
          />
        </PopupLayout>
      )}
      {selectTeachingMaterial && (
        <PopupLayout
          onClose={() => {
            document.body.style.overflow = "auto";
            setSelectTeachingMaterial(null);
          }}
        >
          <TeachingMaterialShow
            id={selectTeachingMaterial.id}
            onClose={() => {
              document.body.style.overflow = "auto";
              setSelectTeachingMaterial(null);
            }}
          />
        </PopupLayout>
      )}
      <div className="flex w-full flex-col justify-center bg-white font-Anuphan">
        <header className="mx-auto flex w-full flex-col justify-between gap-4 p-3 md:max-w-screen-md md:flex-row md:px-5 xl:max-w-screen-lg">
          <section className="min-w-0 text-center md:text-left">
            <h1 className="text-2xl font-semibold md:text-3xl">
              {L.title(language)}
            </h1>
            <p className="max-w-96 break-words text-sm text-gray-400 md:text-base">
              {L.description(language)}
            </p>
            {typeof teachingMaterialsCount.data === "number" && (
              <p className="mt-1 text-xs text-gray-400">
                {L.available(teachingMaterialsCount.data)(language)}
              </p>
            )}
          </section>
          {user.data?.role === "ADMIN" && (
            <section className="flex shrink-0 flex-col items-center gap-2 md:items-end">
              <button
                type="button"
                onClick={() => setTriggerCreate(true)}
                className="main-button flex w-full items-center justify-center gap-1 py-1 ring-1 ring-blue-600 md:w-auto"
              >
                {L.create(language)}
              </button>
            </section>
          )}
        </header>

        <main className="mx-auto flex min-h-screen w-full flex-col gap-4 p-3 pb-24 md:max-w-screen-md md:px-5 xl:max-w-screen-lg">
          <section className="flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(query);
              }}
              className="flex w-full flex-col gap-2 sm:flex-row sm:items-end"
            >
              <label className="flex min-w-0 grow flex-col">
                <span className="text-sm text-gray-400">
                  {L.search(language)}
                </span>
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setDisplayedSuggestion(""); // Clear displayed suggestion
                  }}
                  type="text"
                  placeholder={L.searchPlaceholder(language)}
                  className="w-full min-w-0 rounded-2xl border border-gray-300 p-2 outline-none focus:border-primary-color"
                />
              </label>
              <button
                type="submit"
                className="main-button flex shrink-0 items-center justify-center gap-1 sm:w-auto"
              >
                <MdOutlineSearch className="text-lg" />
                {L.searchButton(language)}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400">{L.quickSearch(language)}</span>
              {suggestionsSearch.map((suggestion, index) => {
                const text = language === "th" ? suggestion.th : suggestion.en;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(text)}
                    className={`max-w-full truncate rounded-full border px-3 py-1 text-gray-600 transition hover:border-primary-color/60 hover:text-primary-color ${
                      search === text
                        ? "border-primary-color/60 bg-primary-color/10 text-primary-color"
                        : "bg-white"
                    }`}
                  >
                    {text}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
                {L.results(language)}
              </h2>
              {!getTeachingMaterials.isLoading && (
                <span className="shrink-0 rounded-full bg-primary-color/10 px-2 py-0.5 text-xs font-medium text-primary-color">
                  {L.found(totalFound)(language)}
                </span>
              )}
            </div>
            <label className="flex w-full items-center gap-2 sm:w-auto">
              <span className="shrink-0 text-sm text-gray-400">
                {L.sortBy(language)}
              </span>
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as "relevant" | "recent")
                }
                className="second-button min-w-0 grow border sm:w-44 sm:grow-0"
              >
                <option value="relevant">{L.sortRelevant(language)}</option>
                <option value="recent">{L.sortRecent(language)}</option>
              </select>
            </label>
          </section>

          {getTeachingMaterials.isFetching && <LoadingBar />}

          {getTeachingMaterials.error && (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-error-color/40 bg-white p-6 text-center text-sm text-error-color">
              <TbAlertCircle className="shrink-0 text-lg" />
              <span>{L.errorTitle(language)}</span>
            </div>
          )}

          {showEmpty && (
            <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border bg-white px-4 py-10 text-center">
              <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-color/10">
                <MdOutlineSearchOff className="text-xl text-primary-color" />
              </span>
              <p className="text-sm font-medium text-gray-700">
                {L.emptyTitle(language)}
              </p>
              <p className="max-w-xs text-xs text-gray-400">
                {L.emptyHint(language)}
              </p>
            </div>
          )}

          <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {getTeachingMaterials.isLoading &&
              [...Array(6)].map((_, index) => (
                <li
                  key={index}
                  className="min-w-0 overflow-hidden rounded-2xl border bg-white"
                >
                  <div className="aspect-[4/3] w-full animate-pulse bg-gray-100" />
                  <div className="flex flex-col gap-2 p-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                  </div>
                </li>
              ))}
            {materials.map((teachingMaterial) => {
              return (
                <TeachingMaterialCard
                  language={language}
                  onClick={() => {
                    document.body.style.overflow = "hidden";
                    setSelectTeachingMaterial(teachingMaterial);
                  }}
                  key={teachingMaterial.id}
                  teachingMaterial={teachingMaterial}
                />
              );
            })}
          </ul>
        </main>
      </div>
    </>
  );
}

export default TeachingMaterials;
