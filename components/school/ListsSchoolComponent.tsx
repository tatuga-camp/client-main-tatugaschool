import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";
import {
  LuInfo,
  LuPlus,
  LuSchool,
  LuSearch,
  LuSearchX,
  LuStar,
  LuX,
} from "react-icons/lu";
import { homepageDataLanguage as t } from "../../data/languages";
import {
  useGetLanguage,
  useGetSchools,
  useGetUser,
  useUpdateUser,
} from "../../react-query";
import { filterSchools, sortSchools } from "../../utils/schoolList";
import SchoolCard from "./SchoolCard";

const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3";

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="h-24 bg-gray-100" />
      <div className="-mt-9 px-5">
        <div className="h-[72px] w-[72px] rounded-2xl bg-gray-200 ring-4 ring-white" />
      </div>
      <div className="space-y-3 px-5 pb-5 pt-4">
        <div className="h-5 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-1/2 rounded bg-gray-100" />
        <div className="h-12 rounded-xl bg-gray-100" />
        <div className="h-10 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

const ListsSchoolComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const update = useUpdateUser();
  const user = useGetUser();
  const schools = useGetSchools(!!user.data);
  const [defaultId, setDefaultId] = useState<string | null>(
    user.data?.favoritSchool ?? null,
  );
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    setDefaultId(user.data?.favoritSchool ?? null);
  }, [user.data?.favoritSchool]);

  const handleSetDefault = (schoolId: string) => {
    const previous = defaultId;
    setDefaultId(schoolId);
    setSaveError(false);
    update.mutate(
      { favoritSchool: schoolId },
      {
        onError: () => {
          setDefaultId(previous);
          setSaveError(true);
        },
      },
    );
  };

  const all = schools.data ?? [];
  // Sort against the saved default so a card doesn't jump while you look at it.
  const visible = useMemo(
    () =>
      filterSchools(
        sortSchools(schools.data ?? [], user.data?.favoritSchool),
        searchTerm,
      ),
    [schools.data, user.data?.favoritSchool, searchTerm],
  );
  const defaultSchool = all.find((s) => s.id === defaultId);
  const loading = !user.data || schools.isLoading;

  return (
    <main className="mx-auto flex w-full flex-col items-center pb-16">
      <header className="gradient-bg relative w-full overflow-hidden px-6 pb-36 pt-12 sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 right-40 h-64 w-64 rounded-full bg-white/10"
        />
        <div className="relative mx-auto w-full max-w-7xl">
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            {t.welcome(lang)}
            {user.data?.firstName ? `, ${user.data.firstName}` : ""}{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-white/85">{t.welcomeDetail(lang)}</p>
        </div>
      </header>

      <section className="relative -mt-28 w-full max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white p-5 shadow-lg sm:p-7">
          {/* Title + toolbar */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                {t.selectSchool(lang)}
                {!loading && all.length > 0 && (
                  <span className="rounded-full bg-primary-color/10 px-2.5 py-0.5 text-xs font-semibold text-primary-color">
                    {t.schoolCount(lang, all.length)}
                  </span>
                )}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t.selectSchoolDetail(lang)}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              {all.length > 1 && (
                <label className="relative flex-1 lg:w-80 lg:flex-none">
                  <span className="sr-only">{t.searchPlaceholder(lang)}</span>
                  <LuSearch
                    aria-hidden
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t.searchPlaceholder(lang)}
                    className="w-full rounded-xl border border-gray-200 bg-background-color py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary-color focus:bg-white focus:ring-2 focus:ring-primary-color/20"
                  />
                </label>
              )}
              <Link
                href="/school/create"
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-color px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-color-hover active:scale-[0.98]"
              >
                <LuPlus aria-hidden className="h-4 w-4" />
                {t.create(lang)}
              </Link>
            </div>
          </div>

          {/* Default-school explainer */}
          {!loading && all.length > 0 && (
            <div
              role="status"
              className={`mt-6 flex gap-3 rounded-2xl border px-4 py-3 ${
                defaultSchool
                  ? "border-primary-color/20 bg-primary-color/5"
                  : "border-warning-color/60 bg-warning-color/15"
              }`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  defaultSchool
                    ? "bg-warning-color text-icon-color"
                    : "bg-white text-icon-color"
                }`}
              >
                {defaultSchool ? (
                  <LuStar aria-hidden className="h-4 w-4 fill-icon-color" />
                ) : (
                  <LuInfo aria-hidden className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-gray-900">
                  {defaultSchool
                    ? t.defaultHintTitle(lang, defaultSchool.title)
                    : t.noDefaultHintTitle(lang)}
                </p>
                <p className="mt-0.5 text-gray-600">{t.defaultHintBody(lang)}</p>
                {saveError && (
                  <p className="mt-1 font-medium text-error-color">
                    {t.defaultSaveError(lang)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* List */}
          <div className="mt-6">
            {loading ? (
              <div className={GRID} aria-busy="true">
                {Array.from({ length: 3 }, (_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : schools.isError ? (
              <div className="flex flex-col items-center py-14 text-center">
                <p className="font-semibold text-gray-900">{t.loadError(lang)}</p>
                <button
                  type="button"
                  onClick={() => schools.refetch()}
                  className="mt-4 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {t.retry(lang)}
                </button>
              </div>
            ) : all.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-color/10 text-primary-color">
                  <LuSchool aria-hidden className="h-8 w-8" />
                </span>
                <p className="mt-4 text-lg font-semibold text-gray-900">
                  {t.emptyTitle(lang)}
                </p>
                <p className="mt-1 max-w-md text-sm text-gray-500">
                  {t.emptyBody(lang)}
                </p>
                <Link
                  href="/school/create"
                  className="mt-6 flex items-center gap-2 rounded-xl bg-primary-color px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-color-hover"
                >
                  <LuPlus aria-hidden className="h-4 w-4" />
                  {t.create(lang)}
                </Link>
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-center">
                <LuSearchX aria-hidden className="h-10 w-10 text-gray-300" />
                <p className="mt-3 font-semibold text-gray-900">
                  {t.noMatchTitle(lang)}
                </p>
                <p className="mt-1 text-sm text-gray-500">{t.noMatchBody(lang)}</p>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-4 flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <LuX aria-hidden className="h-4 w-4" />
                  {t.clearSearch(lang)}
                </button>
              </div>
            ) : (
              <div className={GRID}>
                {visible.map((school) => (
                  <SchoolCard
                    key={school.id}
                    school={school}
                    language={lang}
                    isDefault={school.id === defaultId}
                    savingDefault={update.isPending}
                    onSetDefault={handleSetDefault}
                  />
                ))}
                {!searchTerm.trim() && (
                  <Link
                    href="/school/create"
                    className="group flex min-h-[18rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center transition hover:border-primary-color/50 hover:bg-primary-color/5"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-color/10 text-primary-color transition group-hover:scale-105">
                      <LuPlus aria-hidden className="h-7 w-7" />
                    </span>
                    <span className="mt-4 font-semibold text-gray-900">
                      {t.createCardTitle(lang)}
                    </span>
                    <span className="mt-1 text-sm text-gray-500">
                      {t.createCardBody(lang)}
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default memo(ListsSchoolComponent);
