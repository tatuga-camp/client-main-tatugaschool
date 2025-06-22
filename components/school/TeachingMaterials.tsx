import { useEffect, useState } from "react";
import { SiGooglegemini } from "react-icons/si";
import {
  useGetLanguage,
  useGetSchool,
  useGetTeachingMaterialByAI,
  useGetUser,
} from "../../react-query";
import PopupLayout from "../layout/PopupLayout";
import TeachingMaterialSection from "./TeachingMaterialSection";
import TeachingMaterialCard from "./TeachingMaterialCard";
import { FileOnTeachingMaterial, TeachingMaterial } from "../../interfaces";
import TeachingMaterialShow from "./TeachingMaterialShow";
import LoadingSpinner from "../common/LoadingSpinner";

type Props = {
  schoolId: string;
};

const suggestionsSearch = [
  {
    en: "Cute English Worksheet for Grade 2",
    th: "ใบงานภาษาอังกฤษของ ป.2 น่ารักๆ ให้รักเรียนวาดรูป",
  },
  {
    en: "Thai literature worksheets for primary school",
    th: "ใบงานวรรณกรรมไทย สำหรับประถม",
  },
  {
    en: "A cute teaching Schedule table",
    th: "ตารางสอนน่ารัก ๆ",
  },
];

function TeachingMaterials({ schoolId }: Props) {
  const school = useGetSchool({ schoolId });
  const user = useGetUser();
  const language = useGetLanguage();
  const [query, setQuery] = useState(
    language.data === "th" ? suggestionsSearch[0].th : suggestionsSearch[0].en,
  );
  const [search, setSearch] = useState(
    language.data === "th" ? suggestionsSearch[0].th : suggestionsSearch[0].en,
  );
  const [teachingMaterials, setTeachingMaterials] = useState<
    TeachingMaterial[]
  >([]);
  const [triggerCreate, setTriggerCreate] = useState(false);
  const [totalFound, setTotalFound] = useState(0);
  const [selectTeachingMaterial, setSelectTeachingMaterial] =
    useState<TeachingMaterial | null>(null);
  const [displayedSuggestion, setDisplayedSuggestion] = useState("");

  const getTeachingMaterials = useGetTeachingMaterialByAI({
    ...(search !== "" && { search: search }),
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
      <div className="flex w-full flex-col items-center font-Anuphan">
        <header className="gradient-bg flex h-max w-full flex-col items-center justify-center gap-2 py-20 pt-10">
          <h1 className="text-3xl font-semibold text-white">
            AI-Powered Teaching Materials Search
          </h1>
          <p className="text-center text-lg text-white/90">
            Discover over <span className="text-3xl font-extrabold">350</span>{" "}
            personalized educational resources with intelligent recommendations{" "}
            <br />
            tailored to your teaching needs
          </p>

          <section className="mb-4 mt-10 w-full max-w-3xl rounded-xl bg-white/10 p-2 shadow-lg backdrop-blur-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(query);
              }}
              className="relative flex items-center rounded-xl bg-white"
            >
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setDisplayedSuggestion(""); // Clear displayed suggestion
                }}
                type="text"
                placeholder="Describe what you're looking for... e.g., 'Interactive math games for 5th grade'"
                className="w-full bg-transparent py-3 pl-6 pr-60 text-black placeholder-gray-400 outline-none"
              />
              <button
                onClick={() => {
                  setSearch(query);
                }}
                className="gradient-bg-success absolute right-1.5 top-1/2 flex w-40 -translate-y-1/2 items-center gap-2 rounded-full px-6 py-2 font-semibold text-white transition-colors duration-200 hover:scale-105 active:scale-110"
              >
                <SiGooglegemini
                  className={`${getTeachingMaterials.isFetching && "animate-spin"}`}
                />
                <span>AI Search</span>
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white">
              <span className="font-semibold text-gray-200">Quick Search:</span>
              {suggestionsSearch.map((suggestion, index) => (
                <a
                  key={index}
                  href="#"
                  className="hover:text-white hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(
                      language.data === "th" ? suggestion.th : suggestion.en,
                    );
                  }}
                >
                  {language.data === "th" ? suggestion.th : suggestion.en}
                </a>
              ))}
            </div>
          </section>

          {user.data?.role === "ADMIN" && (
            <button
              onClick={() => setTriggerCreate(true)}
              className="main-button gradient-bg-success rounded-full text-sm text-white"
            >
              CREATE
            </button>
          )}
        </header>
        <main className="flex w-full max-w-7xl flex-col gap-2 px-10 pb-10">
          <section className="mt-5">
            <div className="flex w-max items-center justify-center gap-2">
              <h3 className="text-3xl font-semibold text-black">
                Search Results
              </h3>
              <span className="rounded-md bg-primary-color/5 px-3 text-lg text-primary-color">
                {totalFound} teaching materials found
              </span>
            </div>
          </section>

          <ul className="mt-10 grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {getTeachingMaterials.isLoading &&
              [...Array(10)].map((_, index) => (
                <div
                  key={index}
                  className="h-80 w-80 animate-pulse rounded-lg bg-gray-200"
                />
              ))}
            {teachingMaterials.flat().map((teachingMaterial) => {
              return (
                <TeachingMaterialCard
                  onClick={() => {
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
