import Head from "next/head";
import { useMemo, useState } from "react";
import DefaultLayout from "../components/layout/DefaultLayout";
import AnnouncementCard from "../components/updates/AnnouncementCard";
import AnnouncementFilter, {
  FilterValue,
} from "../components/updates/AnnouncementFilter";
import { updatesLanguageData } from "../data/languages";
import { useGetAnnouncements, useGetLanguage } from "../react-query";

function UpdatesPage() {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const { data: announcements, isLoading, isError } = useGetAnnouncements();
  const [filter, setFilter] = useState<FilterValue>("all");

  const visible = useMemo(() => {
    if (!announcements) return [];
    if (filter === "all") return announcements;
    return announcements.filter((item) => item.type === filter);
  }, [announcements, filter]);

  return (
    <DefaultLayout>
      <Head>
        <title>{updatesLanguageData.pageTitle(lang)} - Tatuga School</title>
      </Head>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-5 md:py-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-icon-color">
            {updatesLanguageData.pageTitle(lang)}
          </h1>
          <p className="text-sm text-gray-500">
            {updatesLanguageData.pageSubtitle(lang)}
          </p>
        </header>

        <AnnouncementFilter
          active={filter}
          onChange={setFilter}
          language={lang}
        />

        {isLoading && (
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-40 w-full animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border-2 border-dashed border-error-color/40 p-10 text-center text-error-color">
            {updatesLanguageData.error(lang)}
          </div>
        )}

        {!isLoading && !isError && visible.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 p-10 text-center text-gray-500">
            {updatesLanguageData.empty(lang)}
          </div>
        )}

        {!isLoading && !isError && visible.length > 0 && (
          <div className="flex flex-col gap-4">
            {visible.map((announcement) => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
                language={lang}
              />
            ))}
          </div>
        )}
      </main>
    </DefaultLayout>
  );
}

export default UpdatesPage;
