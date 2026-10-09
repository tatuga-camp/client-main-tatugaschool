import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoArrowBack, IoChevronDownSharp } from "react-icons/io5";
import { MdQuiz } from "react-icons/md";
import Swal from "sweetalert2";
import QuestionList from "../../../../components/quiz/QuestionList";
import QuizMonitor from "../../../../components/quiz/QuizMonitor";
import QuizSettingsPanel from "../../../../components/quiz/QuizSettingsPanel";
import ClassStudentAssignWork from "../../../../components/subject/ClassStudentAssignWork";
import useClickOutside from "../../../../hook/useClickOutside";
import useUnsavedQuizGuard from "../../../../hook/useUnsavedQuizGuard";
import { menuClassworkList } from "../../../../components/subject/ClassworkCreate";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import { MenuSubject } from "../../../../data";
import {
  classworkHeadMenuBarDataLanguage,
  quizLanguage,
} from "../../../../data/languages";
import { ErrorMessages } from "../../../../interfaces";
import {
  useDeleteAssignment,
  useGetAssignment,
  useGetLanguage,
  useGetQuizMonitor,
  useGetQuizQuestions,
  useUpdateAssignment,
  forgetDeletedAssignment,
} from "../../../../react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  deleteConfirmOptions,
  runIfConfirmed,
} from "../../../../utils/confirmDelete";
import { withDirtyId } from "../../../../utils/quizDraft";
import {
  editorLockState,
  quizEditorLoadState,
} from "../../../../utils/quizMonitor";

type Tab = "questions" | "settings" | "monitor" | "manageassigning";
const TABS: Tab[] = ["questions", "settings", "monitor", "manageassigning"];

export default function QuizEditorPage({
  subjectId,
  assignmentId,
}: {
  subjectId: string;
  assignmentId: string;
}) {
  const router = useRouter();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const assignment = useGetAssignment({ id: assignmentId });
  const questions = useGetQuizQuestions({ assignmentId });
  const update = useUpdateAssignment();
  const remove = useDeleteAssignment();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("questions");
  const [title, setTitle] = useState("");
  // Lock state comes from the monitor (any started attempt locks questions).
  const monitor = useGetQuizMonitor({
    assignmentId,
    enabled: tab === "questions",
    poll: false,
  });
  // Read-only until the first lock check returns, so a locked quiz never flashes editable.
  const { locked, readOnly } = editorLockState(
    monitor.data?.locked,
    monitor.isLoading,
  );
  // Question cards with unsaved edits; leaving the tab or publishing asks first.
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const onDirtyChange = useCallback(
    (questionId: string, dirty: boolean) =>
      setDirtyIds((ids) => withDirtyId(ids, questionId, dirty)),
    [],
  );

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query.tab as Tab | undefined;
    if (q && TABS.includes(q)) setTab(q);
  }, [router.isReady]);

  useEffect(() => {
    if (assignment.data) setTitle(assignment.data.title);
  }, [assignment.data?.title]);

  // Every question card registers "save now"; leaving saves first and only
  // asks when something still can't be saved.
  const saveAllRef = useRef<(() => Promise<number>) | null>(null);
  const saveAll = async () => (saveAllRef.current ? saveAllRef.current() : 0);
  const { allowNextNavigation, requestLeave } = useUnsavedQuizGuard({
    enabled: dirtyIds.size > 0,
    saveAll,
    language: lang,
  });

  /** True when everything saved, or the teacher chose to go on anyway. */
  const confirmUnsaved = async (text: string, confirmButtonText: string) => {
    if (dirtyIds.size === 0) return true;
    const remaining = await saveAll();
    if (remaining === 0) return true;
    const answer = await Swal.fire({
      title: quizLanguage.unsavedCount(lang, remaining),
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: quizLanguage.keepEditing(lang),
    });
    return answer.isConfirmed;
  };

  const selectTab = async (next: Tab) => {
    if (next === tab) return;
    if (tab === "questions") {
      const ok = await confirmUnsaved(
        quizLanguage.unsavedText(lang),
        quizLanguage.leaveAnyway(lang),
      );
      if (!ok) return;
    }
    setTab(next);
    router.replace({ query: { ...router.query, tab: next } }, undefined, {
      shallow: true,
    });
  };

  const fail = (error: unknown) => {
    const result = error as ErrorMessages;
    Swal.fire({
      title: result?.error ?? "Error",
      text: result?.message?.toString(),
      icon: "error",
    });
  };

  const saveTitle = async () => {
    if (!assignment.data) return;
    const next = title.trim();
    if (!next || next === assignment.data.title) {
      setTitle(assignment.data.title);
      return;
    }
    try {
      await update.mutateAsync({
        query: { assignmentId },
        data: { title: next },
      });
      setTitle(next);
    } catch (error) {
      fail(error);
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement | null>(null);
  const [savingChanges, setSavingChanges] = useState(false);
  useClickOutside(menuRef, () => setMenuOpen(false));

  // Questions autosave, so "Save change" flushes the title and any card still dirty.
  const saveChanges = async () => {
    setSavingChanges(true);
    try {
      await saveTitle();
      const remaining = await saveAll();
      if (remaining > 0) {
        Swal.fire({
          icon: "warning",
          title: quizLanguage.unsavedCount(lang, remaining),
          text: quizLanguage.unsavedText(lang),
        });
      }
    } finally {
      setSavingChanges(false);
    }
  };

  const setStatus = async (next: "Draft" | "Published") => {
    if (!assignment.data || assignment.data.status === next) return;
    if (next === "Published") {
      const ok = await confirmUnsaved(
        quizLanguage.unsavedPublishText(lang),
        quizLanguage.publishAnyway(lang),
      );
      if (!ok) return;
    }
    try {
      await update.mutateAsync({
        query: { assignmentId },
        data: { status: next },
      });
    } catch (error) {
      fail(error);
    }
  };

  const deleteQuiz = async () => {
    try {
      return await runIfConfirmed(
        () => Swal.fire(deleteConfirmOptions("quiz", lang)),
        async () => {
          await remove.mutateAsync({ assignmentId });
          allowNextNavigation();
          await router.push(backHref);
          forgetDeletedAssignment(queryClient, assignmentId);
          Swal.fire({
            icon: "success",
            title: quizLanguage.deleted(lang),
            timer: 1500,
            showConfirmButton: false,
          });
        },
      );
    } catch (error) {
      fail(error);
    }
  };

  const loadState = quizEditorLoadState({
    data: assignment.data,
    isError: assignment.isError,
  });
  const backHref = {
    pathname: `/subject/${subjectId}`,
    query: { menu: "Classwork" as MenuSubject },
  };

  if (loadState === "error" || loadState === "notQuiz") {
    // The server's own message (e.g. "Assignment not found"), shown under the localized heading.
    const detail =
      loadState === "error"
        ? (assignment.error as ErrorMessages | null)?.message?.toString()
        : undefined;
    return (
      <div className="flex h-dvh items-center justify-center bg-background-color p-4 font-Anuphan">
        <div
          role="alert"
          className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-8 text-center"
        >
          <MdQuiz className="text-4xl text-error-color/70" />
          <p className="font-semibold text-icon-color">
            {loadState === "error"
              ? quizLanguage.loadQuizFailed(lang)
              : quizLanguage.notAQuiz(lang)}
          </p>
          {detail && <p className="text-sm text-icon-color/60">{detail}</p>}
          <Link
            href={backHref}
            className="mt-2 flex items-center gap-2 rounded-2xl bg-primary-color px-4 py-2 text-sm font-medium text-white hover:bg-primary-color-hover"
          >
            <IoArrowBack /> {quizLanguage.backToClasswork(lang)}
          </Link>
        </div>
      </div>
    );
  }

  if (!assignment.data) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background-color">
        <LoadingSpinner />
      </div>
    );
  }

  const isPublished = assignment.data.status === "Published";
  const questionCount = questions.data?.length ?? 0;
  const cannotPublish = !isPublished && questionCount === 0;
  const busy = update.isPending || savingChanges;
  const tabText: Record<Tab, { title: string; description: string }> = {
    questions: {
      title: quizLanguage.tabQuestions(lang),
      description: quizLanguage.tabQuestionsDescription(lang),
    },
    settings: {
      title: quizLanguage.tabSettings(lang),
      description: quizLanguage.tabSettingsDescription(lang),
    },
    monitor: {
      title: quizLanguage.tabMonitor(lang),
      description: quizLanguage.tabMonitorDescription(lang),
    },
    manageassigning: {
      title: classworkHeadMenuBarDataLanguage.title.manageassigning(lang),
      description:
        classworkHeadMenuBarDataLanguage.description.manageassigning(lang),
    },
  };

  return (
    <>
      <Head>
        <title>{assignment.data.title}</title>
      </Head>
      <div className="flex h-dvh flex-col bg-background-color font-Anuphan">
        <header className="shrink-0 bg-white">
          <nav className="relative flex min-h-16 flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-2 md:px-6">
            <Link
              href={backHref}
              onClick={(e) => {
                if (dirtyIds.size === 0) return;
                // Save first (and warn only if needed) instead of letting the
                // router start a navigation the guard would have to cancel.
                e.preventDefault();
                requestLeave(`/subject/${subjectId}?menu=Classwork`);
              }}
              aria-label={quizLanguage.backToClasswork(lang)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100 hover:text-icon-color"
            >
              <IoArrowBack />
            </Link>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-color/10 text-2xl text-warning-color">
              <MdQuiz />
            </div>
            <input
              aria-label="Quiz title"
              value={title}
              placeholder={quizLanguage.untitled(lang)}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              className="min-w-0 flex-1 border-b-2 border-transparent bg-transparent py-1 text-lg font-semibold text-icon-color outline-none focus:border-primary-color md:text-xl"
            />
            <span className="hidden text-sm text-icon-color/60 sm:inline">
              {quizLanguage.totalPoints(lang, assignment.data.maxScore ?? 0)}
            </span>
            <span
              className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium md:inline ${
                isPublished
                  ? "bg-success-color/10 text-success-color"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isPublished
                ? quizLanguage.published(lang)
                : quizLanguage.draft(lang)}
            </span>
            <section
              ref={menuRef}
              className="flex shrink-0 items-center md:relative"
            >
              <button
                type="button"
                onClick={() =>
                  isPublished ? saveChanges() : setStatus("Published")
                }
                disabled={busy || cannotPublish}
                title={
                  cannotPublish
                    ? quizLanguage.needQuestionsToPublish(lang)
                    : undefined
                }
                className="flex h-10 items-center justify-center gap-2 rounded-l-xl bg-primary-color px-5 text-sm font-semibold text-white transition hover:bg-primary-color-hover disabled:opacity-60"
              >
                {busy && <LoadingSpinner />}
                {isPublished
                  ? classworkHeadMenuBarDataLanguage.button.saveChange(lang)
                  : classworkHeadMenuBarDataLanguage.button.publish(lang)}
              </button>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                type="button"
                aria-label="More actions"
                aria-expanded={menuOpen}
                className="flex h-10 items-center justify-center rounded-r-xl border-l border-white/20 bg-primary-color px-2.5 text-white transition hover:bg-primary-color-hover"
              >
                <IoChevronDownSharp />
              </button>

              {menuOpen && (
                <div className="absolute right-4 top-full z-40 mt-1 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white p-1.5 shadow-lg md:right-0 md:mt-2">
                  {menuClassworkList.map((menu) => {
                    const isDelete = menu.title === "Delete";
                    const disabled =
                      busy ||
                      (menu.title === "Mark as Draft" && !isPublished) ||
                      (menu.title === "Publish" &&
                        (isPublished || cannotPublish));
                    const run = () => {
                      setMenuOpen(false);
                      if (isDelete) return deleteQuiz();
                      if (menu.title === "Publish")
                        return setStatus("Published");
                      if (menu.title === "Mark as Draft")
                        return setStatus("Draft");
                      return saveChanges();
                    };
                    return (
                      <React.Fragment key={menu.value}>
                        {isDelete && (
                          <div className="my-1 border-t border-gray-100" />
                        )}
                        <button
                          type="button"
                          onClick={run}
                          disabled={isDelete ? remove.isPending : disabled}
                          title={
                            menu.title === "Publish" && cannotPublish
                              ? quizLanguage.needQuestionsToPublish(lang)
                              : undefined
                          }
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                            isDelete
                              ? "text-error-color hover:bg-error-color/10"
                              : disabled
                                ? "cursor-not-allowed text-gray-300"
                                : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-lg">{menu.icon}</span>
                          {isDelete
                            ? quizLanguage.deleteQuiz(lang)
                            : classworkHeadMenuBarDataLanguage.button[
                                menu.value as keyof typeof classworkHeadMenuBarDataLanguage.button
                              ](lang)}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </section>
          </nav>
          <div className="flex h-12 w-full items-center justify-start gap-1 overflow-x-auto border-b border-gray-100 bg-white px-4 md:h-14 md:px-6">
            {TABS.map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => selectTab(t)}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full shrink-0 flex-col justify-center border-b-2 px-3 text-left transition md:px-4 ${
                    active
                      ? "border-primary-color text-primary-color"
                      : "border-transparent text-gray-500 hover:text-icon-color"
                  }`}
                >
                  <span className="whitespace-nowrap text-sm font-semibold">
                    {tabText[t].title}
                  </span>
                  <span className="hidden whitespace-nowrap text-xs text-gray-400 md:block">
                    {tabText[t].description}
                  </span>
                </button>
              );
            })}
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {tab === "questions" && (
            <QuestionList
              assignmentId={assignmentId}
              subjectId={subjectId}
              locked={locked}
              readOnly={readOnly}
              onDirtyChange={onDirtyChange}
              saveAllRef={saveAllRef}
            />
          )}
          {tab === "settings" && (
            <QuizSettingsPanel assignment={assignment.data} />
          )}
          {tab === "monitor" && <QuizMonitor assignmentId={assignmentId} />}
          {tab === "manageassigning" && (
            <ClassStudentAssignWork
              assignmentId={assignmentId}
              subjectId={subjectId}
            />
          )}
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const params = ctx.params;
  if (!params?.subjectId || !params?.assignmentId) return { notFound: true };
  return {
    props: { subjectId: params.subjectId, assignmentId: params.assignmentId },
  };
};
