import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useRouter } from "next/router";
import { Toast } from "primereact/toast";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { FiSearch, FiX } from "react-icons/fi";
import {
  MdAssignment,
  MdCampaign,
  MdChecklist,
  MdImportContacts,
} from "react-icons/md";
import {
  announcementDataLanguage,
  classworksDataLanguage as t,
  rubricLanguage,
} from "../../data/languages";
import { Assignment, Language } from "../../interfaces";
import {
  useGetAnnouncementsTeacher,
  useGetAssignments,
  useGetLanguage,
  useGetUser,
  useReoderAssignment,
} from "../../react-query";
import { ResponseGetAssignmentsService } from "../../services";
import PopupLayout from "../layout/PopupLayout";
import AnnouncementCard from "./announcement/AnnouncementCard";
import AnnouncementCreate from "./announcement/AnnouncementCreate";
import AssignmentTagFilterBar from "./AssignmentTagFilterBar";
import ClassworkCard from "./ClassworkCard";
import ClassworkCreate from "./ClassworkCreate";
import ImportAssignment from "./ImportAssignment";
import RubricList from "./rubric/RubricList";

type Props = {
  toast: React.RefObject<Toast>;
  subjectId: string;
  schoolId: string;
};

type View = "classwork" | "announcements";
type StatusFilter = "all" | "toReview" | "published" | "draft";

function Classworks({ toast, subjectId, schoolId }: Props) {
  const router = useRouter();
  const language = useGetLanguage();
  const lang: Language = language.data ?? "en";
  const user = useGetUser();
  const [triggerCreate, setTriggerCreate] = React.useState(false);
  const [showAnnouncementCreate, setShowAnnouncementCreate] =
    React.useState(false);
  const announcements = useGetAnnouncementsTeacher({ subjectId });
  const classworks = useGetAssignments({ subjectId: subjectId });
  const [selectClasswork, setSelectClasswork] =
    React.useState<Assignment | null>(null);
  const [triggerImportAssignment, setTriggerImportAssignment] = useState(false);
  const [triggerManageRubric, setTriggerManageRubric] = useState(false);
  const [classworksData, setClassworksData] =
    React.useState<ResponseGetAssignmentsService>([]);
  const reorderAssignment = useReoderAssignment();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  // The tab lives in the URL so refresh / shared links keep it.
  const view: View =
    router.query.view === "announcements" ? "announcements" : "classwork";
  const setView = (next: View) => {
    const query = { ...router.query };
    if (next === "classwork") delete query.view;
    else query.view = next;
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const uniqueTags = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of classworksData) {
      for (const tag of a.tags ?? []) {
        const key = tag.toLowerCase();
        if (!map.has(key)) map.set(key, tag);
      }
    }
    return [...map.values()].sort((a, b) => a.localeCompare(b));
  }, [classworksData]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of classworksData) {
      for (const tag of c.tags ?? []) {
        const key = tag.toLowerCase();
        out[key] = (out[key] ?? 0) + 1;
      }
    }
    return out;
  }, [classworksData]);

  const statusCounts = useMemo(
    () => ({
      all: classworksData.length,
      toReview: classworksData.filter((c) => (c.summitNumber ?? 0) > 0).length,
      published: classworksData.filter((c) => c.status === "Published").length,
      draft: classworksData.filter((c) => c.status === "Draft").length,
    }),
    [classworksData],
  );

  const query = search.trim().toLowerCase();
  const visibleClassworks = useMemo(() => {
    return classworksData.filter((c) => {
      if (statusFilter === "toReview" && !((c.summitNumber ?? 0) > 0))
        return false;
      if (statusFilter === "published" && c.status !== "Published")
        return false;
      if (statusFilter === "draft" && c.status !== "Draft") return false;
      if (
        selectedTags.size > 0 &&
        !(c.tags ?? []).some((tag) => selectedTags.has(tag.toLowerCase()))
      )
        return false;
      if (query) {
        const haystack = [c.title, ...(c.tags ?? [])].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [classworksData, statusFilter, selectedTags, query]);

  const filtersActive =
    query !== "" || statusFilter !== "all" || selectedTags.size > 0;
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSelectedTags(new Set());
  };

  useEffect(() => {
    const lower = new Set(uniqueTags.map((tag) => tag.toLowerCase()));
    setSelectedTags((prev) => {
      const filtered = new Set([...prev].filter((tag) => lower.has(tag)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [uniqueTags]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    let newSort: ResponseGetAssignmentsService = [];
    if (active.id !== over?.id) {
      setClassworksData((prevs) => {
        const oldIndex = prevs.findIndex((item) => item.id === active.id);
        const newIndex = prevs.findIndex((item) => item.id === over!.id);
        newSort = arrayMove(prevs, oldIndex, newIndex);

        return newSort;
      });
    }

    if (newSort.length > 0) {
      await reorderAssignment.mutateAsync({
        request: {
          assignmentIds: newSort.map((item) => item.id),
        },
        subjectId: subjectId,
      });
    }
  }, []);

  useEffect(() => {
    if (classworks.data) {
      setClassworksData(classworks.data.sort((a, b) => a.order - b.order));
    }
  }, [classworks.data]);

  const announcementCount = announcements.data?.length ?? 0;
  const statusOptions: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t.filterAll(lang) },
    { key: "toReview", label: t.filterToReview(lang) },
    { key: "published", label: t.filterPublished(lang) },
    { key: "draft", label: t.filterDraft(lang) },
  ];

  return (
    <>
      {triggerCreate && (
        <PopupLayout onClose={() => {}}>
          <div className="h-screen w-screen bg-background-color">
            <ClassworkCreate
              schoolId={schoolId}
              subjectId={subjectId}
              toast={toast}
              onClose={() => {
                document.body.style.overflow = "auto";
                setTriggerCreate(false);
              }}
            />
          </div>
        </PopupLayout>
      )}
      {showAnnouncementCreate && (
        <AnnouncementCreate
          subjectId={subjectId}
          schoolId={schoolId}
          toast={toast}
          onClose={() => setShowAnnouncementCreate(false)}
        />
      )}
      {triggerImportAssignment && (
        <PopupLayout
          onClose={() => {
            setTriggerImportAssignment(false);
          }}
        >
          <ImportAssignment
            schoolId={schoolId}
            toast={toast}
            targetSubjectId={subjectId}
            onClose={() => {
              document.body.style.overflow = "auto";
              setTriggerImportAssignment(false);
            }}
          />
        </PopupLayout>
      )}
      {triggerManageRubric && (
        <PopupLayout
          onClose={() => {
            document.body.style.overflow = "auto";
            setTriggerManageRubric(false);
          }}
        >
          <div className="max-h-[85vh] w-11/12 max-w-3xl overflow-auto rounded-2xl bg-background-color p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h1 className="text-lg font-medium sm:text-xl">
                  {rubricLanguage.rubricsTitle(lang)}
                </h1>
                <h4 className="text-xs text-gray-500 sm:text-sm">
                  {rubricLanguage.rubricsDescription(lang)}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  document.body.style.overflow = "auto";
                  setTriggerManageRubric(false);
                }}
                className="second-button flex items-center justify-center border px-3 py-1"
              >
                {rubricLanguage.close(lang)}
              </button>
            </div>
            <RubricList subjectId={subjectId} toast={toast} />
          </div>
        </PopupLayout>
      )}

      <div className="mx-auto w-full px-5 pb-10 font-Anuphan md:max-w-screen-md xl:max-w-screen-lg">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-icon-color sm:text-3xl">
              {t.title(lang)}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{t.description(lang)}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {view === "classwork" ? (
              <>
                <button
                  type="button"
                  onClick={() => setTriggerManageRubric(true)}
                  className="second-button flex items-center gap-1.5 border px-3 py-2 text-sm"
                >
                  <MdChecklist aria-hidden />
                  <span>{t.rubricsShort(lang)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTriggerImportAssignment(true)}
                  className="second-button flex items-center gap-1.5 border px-3 py-2 text-sm"
                >
                  <MdImportContacts aria-hidden />
                  <span>{t.importShort(lang)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTriggerCreate(true)}
                  className="main-button flex items-center gap-1.5 px-4 py-2 text-sm"
                >
                  <FaPlus aria-hidden />
                  <span>{t.create(lang)}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowAnnouncementCreate(true)}
                className="main-button flex items-center gap-1.5 px-4 py-2 text-sm"
              >
                <FaPlus aria-hidden />
                <span>{announcementDataLanguage.create(lang)}</span>
              </button>
            )}
          </div>
        </header>

        <nav
          role="tablist"
          aria-label={t.title(lang)}
          className="mt-6 flex gap-6 border-b border-gray-200"
        >
          <TabButton
            active={view === "classwork"}
            onClick={() => setView("classwork")}
            controls="classworks-panel-classwork"
            icon={<MdAssignment aria-hidden />}
            label={t.tabClasswork(lang)}
            count={classworksData.length}
          />
          <TabButton
            active={view === "announcements"}
            onClick={() => setView("announcements")}
            controls="classworks-panel-announcements"
            icon={<MdCampaign aria-hidden />}
            label={announcementDataLanguage.sectionTitle(lang)}
            count={announcementCount}
          />
        </nav>

        {view === "classwork" ? (
          <section id="classworks-panel-classwork" role="tabpanel">
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="relative block w-full md:max-w-xs">
                <span className="sr-only">{t.searchPlaceholder(lang)}</span>
                <FiSearch
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.searchPlaceholder(lang)}
                  className="h-10 w-full rounded-full border border-gray-200 bg-white pl-9 pr-9 text-sm outline-none transition focus:border-primary-color focus:ring-2 focus:ring-primary-color/20 [&::-webkit-search-cancel-button]:hidden"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label={t.clearSearch(lang)}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <FiX aria-hidden />
                  </button>
                )}
              </label>
              <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
                <div className="inline-flex gap-1 rounded-full border border-gray-200 bg-white p-1">
                  {statusOptions.map((option) => {
                    const active = statusFilter === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setStatusFilter(option.key)}
                        className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
                          active
                            ? "bg-primary-color text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span>{option.label}</span>
                        <span
                          className={`rounded-full px-1.5 text-xs ${
                            active
                              ? "bg-white/20"
                              : option.key === "toReview" &&
                                  statusCounts.toReview > 0
                                ? "bg-warning-color/30 text-amber-800"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {statusCounts[option.key]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {uniqueTags.length > 0 && (
              <div className="mt-3">
                <AssignmentTagFilterBar
                  uniqueTags={uniqueTags}
                  counts={counts}
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                  totalCount={classworksData.length}
                />
              </div>
            )}

            {filtersActive && visibleClassworks.length > 0 && (
              <p className="mt-3 text-xs text-gray-400">
                {t.reorderHint(lang)}
              </p>
            )}

            <div className="mt-4">
              {classworks.isLoading ? (
                <ul className="flex flex-col gap-3" aria-busy="true">
                  {[0, 1, 2].map((i) => (
                    <li
                      key={i}
                      className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white"
                    />
                  ))}
                </ul>
              ) : classworksData.length === 0 ? (
                <EmptyState
                  icon={<MdAssignment />}
                  title={t.emptyTitle(lang)}
                  description={t.emptyDescription(lang)}
                  action={
                    <button
                      type="button"
                      onClick={() => setTriggerCreate(true)}
                      className="main-button flex items-center gap-1.5 px-4 py-2 text-sm"
                    >
                      <FaPlus aria-hidden />
                      <span>{t.create(lang)}</span>
                    </button>
                  }
                />
              ) : visibleClassworks.length === 0 ? (
                <EmptyState
                  icon={<FiSearch />}
                  title={t.noResults(lang)}
                  action={
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="second-button border px-4 py-2 text-sm"
                    >
                      {t.clearFilters(lang)}
                    </button>
                  }
                />
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={visibleClassworks}
                    strategy={rectSortingStrategy}
                  >
                    <ul className="flex flex-col gap-3">
                      {visibleClassworks.map((classwork) => (
                        <li key={classwork.id} className="list-none">
                          <ClassworkCard
                            classwork={classwork}
                            reorderable={!filtersActive}
                            selectClasswork={selectClasswork}
                            subjectId={subjectId}
                            uniqueTags={uniqueTags}
                            onSelect={(classwork) => {
                              setSelectClasswork((prev) => {
                                if (prev?.id === classwork.id) {
                                  return null;
                                }
                                return classwork;
                              });
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </section>
        ) : (
          <section
            id="classworks-panel-announcements"
            role="tabpanel"
            className="mt-4 flex flex-col gap-3"
          >
            <button
              type="button"
              onClick={() => setShowAnnouncementCreate(true)}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-left shadow-sm transition hover:border-primary-color/40 hover:shadow-md sm:p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-color/10 text-xl text-primary-color">
                <MdCampaign aria-hidden />
              </span>
              <span className="flex-1 rounded-full bg-background-color px-4 py-2.5 text-sm text-gray-400">
                {t.composerPrompt(lang)}
              </span>
            </button>

            {announcements.isLoading ? (
              <div
                className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white"
                aria-busy="true"
              />
            ) : announcementCount === 0 ? (
              <EmptyState
                icon={<MdCampaign />}
                title={t.noAnnouncements(lang)}
                description={t.noAnnouncementsDescription(lang)}
              />
            ) : (
              <ul className="flex list-none flex-col gap-3 p-0">
                {announcements.data?.map((announcement) => (
                  <li key={announcement.id} className="list-none">
                    <AnnouncementCard
                      announcement={announcement}
                      subjectId={subjectId}
                      userId={user.data?.id ?? ""}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}

type TabButtonProps = {
  active: boolean;
  onClick: () => void;
  controls: string;
  icon: React.ReactNode;
  label: string;
  count: number;
};

function TabButton({
  active,
  onClick,
  controls,
  icon,
  label,
  count,
}: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={`-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-sm font-medium transition sm:text-base ${
        active
          ? "border-primary-color text-primary-color"
          : "border-transparent text-gray-500 hover:text-icon-color"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          active
            ? "bg-primary-color/10 text-primary-color"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-color/10 text-2xl text-primary-color">
        {icon}
      </span>
      <p className="font-semibold text-icon-color">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default Classworks;
