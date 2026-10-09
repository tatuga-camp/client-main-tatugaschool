import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { MdQuiz } from "react-icons/md";
import Swal from "sweetalert2";
import QuestionList from "../../../../components/quiz/QuestionList";
import QuizMonitor from "../../../../components/quiz/QuizMonitor";
import QuizSettingsPanel from "../../../../components/quiz/QuizSettingsPanel";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import { MenuSubject } from "../../../../data";
import { quizLanguage } from "../../../../data/languages";
import { ErrorMessages } from "../../../../interfaces";
import {
  useGetAssignment,
  useGetLanguage,
  useGetQuizMonitor,
  useGetQuizQuestions,
  useUpdateAssignment,
} from "../../../../react-query";
import { editorLockState } from "../../../../utils/quizMonitor";

type Tab = "questions" | "settings" | "monitor";
const TABS: Tab[] = ["questions", "settings", "monitor"];

export default function QuizEditorPage({ subjectId, assignmentId }: { subjectId: string; assignmentId: string }) {
  const router = useRouter();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const assignment = useGetAssignment({ id: assignmentId });
  const questions = useGetQuizQuestions({ assignmentId });
  const update = useUpdateAssignment();
  const [tab, setTab] = useState<Tab>("questions");
  const [title, setTitle] = useState("");
  // Lock state comes from the monitor (any started attempt locks questions).
  const monitor = useGetQuizMonitor({ assignmentId, enabled: tab === "questions", poll: false });
  // Read-only until the first lock check returns, so a locked quiz never flashes editable.
  const { locked, readOnly } = editorLockState(monitor.data?.rows, monitor.isLoading);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query.tab as Tab | undefined;
    if (q && TABS.includes(q)) setTab(q);
  }, [router.isReady]);

  useEffect(() => {
    if (assignment.data) setTitle(assignment.data.title);
  }, [assignment.data?.title]);

  const selectTab = (next: Tab) => {
    setTab(next);
    router.replace({ query: { ...router.query, tab: next } }, undefined, { shallow: true });
  };

  const fail = (error: unknown) => {
    const result = error as ErrorMessages;
    Swal.fire({ title: result?.error ?? "Error", text: result?.message?.toString(), icon: "error" });
  };

  const saveTitle = async () => {
    if (!assignment.data) return;
    const next = title.trim();
    if (!next || next === assignment.data.title) {
      setTitle(assignment.data.title);
      return;
    }
    try {
      await update.mutateAsync({ query: { assignmentId }, data: { title: next } });
      setTitle(next);
    } catch (error) {
      fail(error);
    }
  };

  const toggleStatus = async () => {
    if (!assignment.data) return;
    const next = assignment.data.status === "Published" ? "Draft" : "Published";
    try {
      await update.mutateAsync({ query: { assignmentId }, data: { status: next } });
    } catch (error) {
      fail(error);
    }
  };

  if (!assignment.data) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background-color">
        <LoadingSpinner />
      </div>
    );
  }

  const isPublished = assignment.data.status === "Published";
  const questionCount = questions.data?.length ?? 0;
  const tabLabel = (t: Tab) =>
    t === "questions" ? quizLanguage.tabQuestions(lang) : t === "settings" ? quizLanguage.tabSettings(lang) : quizLanguage.tabMonitor(lang);

  return (
    <>
      <Head>
        <title>{assignment.data.title}</title>
      </Head>
      <div className="flex h-dvh flex-col bg-background-color font-Anuphan">
        <header className="shrink-0 border-b border-gray-100 bg-white">
          <nav className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-2 md:px-6">
            <Link
              href={{ pathname: `/subject/${subjectId}`, query: { menu: "Classwork" as MenuSubject } }}
              aria-label="Back to classwork"
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
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isPublished ? "bg-success-color/10 text-success-color" : "bg-gray-100 text-gray-600"
              }`}
            >
              {isPublished ? quizLanguage.published(lang) : quizLanguage.draft(lang)}
            </span>
            <button
              type="button"
              onClick={toggleStatus}
              disabled={update.isPending || (!isPublished && questionCount === 0)}
              title={!isPublished && questionCount === 0 ? quizLanguage.needQuestionsToPublish(lang) : undefined}
              className={`rounded-2xl px-4 py-2 text-sm font-medium disabled:opacity-40 ${
                isPublished ? "border border-gray-200 text-icon-color hover:bg-gray-50" : "gradient-bg text-white"
              }`}
            >
              {isPublished ? quizLanguage.unpublish(lang) : quizLanguage.publish(lang)}
            </button>
          </nav>
          <div className="flex items-center gap-1 overflow-x-auto px-4 md:px-6">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => selectTab(t)}
                className={`border-b-2 px-3 py-2 text-sm font-medium ${
                  tab === t ? "border-primary-color text-primary-color" : "border-transparent text-icon-color/60 hover:text-icon-color"
                }`}
              >
                {tabLabel(t)}
              </button>
            ))}
            <Link
              href={{ pathname: `/subject/${subjectId}/assignment/${assignmentId}`, query: { menu: "manageassigning" } }}
              className="ml-auto whitespace-nowrap px-3 py-2 text-sm text-primary-color hover:underline"
            >
              {quizLanguage.assignStudents(lang)}
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {tab === "questions" && <QuestionList assignmentId={assignmentId} subjectId={subjectId} locked={locked} readOnly={readOnly} />}
          {tab === "settings" && <QuizSettingsPanel assignment={assignment.data} />}
          {tab === "monitor" && <QuizMonitor assignmentId={assignmentId} />}
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const params = ctx.params;
  if (!params?.subjectId || !params?.assignmentId) return { notFound: true };
  return { props: { subjectId: params.subjectId, assignmentId: params.assignmentId } };
};
