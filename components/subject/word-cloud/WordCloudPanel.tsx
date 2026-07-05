import React, { useState } from "react";
import { PiCloudFog } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import QRCode from "../QRCode";
import WordCloudView from "./WordCloudView";
import WordCloudBars from "./WordCloudBars";
import { WordCloudAccess } from "../../../interfaces";
import {
  useAppendWordCloudQuestion,
  useCreateWordCloudSet,
  useDeleteWordCloudSet,
  useGetLanguage,
  useGetWordCloudSetById,
  useGetWordCloudSetsBySubject,
  useRevokeWordCloudResults,
  useShareWordCloudResults,
  useUpdateWordCloudSet,
} from "../../../react-query";
import { wordCloudLanguage } from "../../../data/languages";

type Props = {
  subjectId: string;
  onClose: () => void;
};

function WordCloudPanel({ subjectId, onClose }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";

  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [view, setView] = useState<"cloud" | "bars">("cloud");
  // Which question's results the teacher is viewing (index into ordered list).
  const [viewIndex, setViewIndex] = useState(0);

  // Builder state
  const [questions, setQuestions] = useState<string[]>([""]);
  const [accessMode, setAccessMode] = useState<WordCloudAccess>("PUBLIC");
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [title, setTitle] = useState("");
  const [newQuestion, setNewQuestion] = useState("");

  const list = useGetWordCloudSetsBySubject({ subjectId });
  const create = useCreateWordCloudSet();
  const update = useUpdateWordCloudSet();
  const append = useAppendWordCloudQuestion();
  const remove = useDeleteWordCloudSet();
  const share = useShareWordCloudResults();
  const revoke = useRevokeWordCloudResults();
  const [copied, setCopied] = useState(false);

  const detail = useGetWordCloudSetById({
    setId: activeSetId ?? "",
    refetchInterval: activeSetId ? 4000 : false,
  });

  const studentUrl = activeSetId
    ? `${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/word-cloud/set/${activeSetId}`
    : "";

  const handleCreate = async () => {
    const cleaned = questions.map((q) => q.trim()).filter((q) => q.length > 0);
    if (cleaned.length === 0) return;
    const created = await create.mutateAsync({
      subjectId,
      questions: cleaned,
      title: title.trim() || undefined,
      accessMode,
      allowMultiple,
    });
    setQuestions([""]);
    setNewQuestion("");
    setTitle("");
    setViewIndex(0);
    setActiveSetId(created.id);
  };

  // ----- Live view -----
  if (activeSetId && detail.data) {
    const set = detail.data.set;
    const resultsUrl = set.publicResultsToken
      ? `${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/word-cloud/results/${set.publicResultsToken}`
      : "";
    const ordered = detail.data.questions; // already order-asc from the API
    const activeIndex = Math.max(
      0,
      ordered.findIndex((q) => q.wordCloud.id === set.activeWordCloudId),
    );
    const safeViewIndex = Math.min(viewIndex, ordered.length - 1);
    const current = ordered[safeViewIndex];
    const isViewingLive = safeViewIndex === activeIndex;

    const advanceTo = (index: number) => {
      const target = ordered[index];
      if (!target) return;
      update.mutate({ setId: set.id, activeWordCloudId: target.wordCloud.id });
      setViewIndex(index);
    };

    return (
      <div className="flex h-[80vh] w-[90vw] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white font-Anuphan">
        <header className="flex items-center justify-between border-b p-4">
          <div>
            <span className="text-xs font-semibold text-icon-color/60">
              {set.title || wordCloudLanguage.sessionTitle(lang)}
            </span>
            <h2 className="text-lg font-bold text-icon-color">
              {current?.wordCloud.question}
            </h2>
            <span className="text-xs text-icon-color/60">
              {wordCloudLanguage.questionXofY(
                lang,
                safeViewIndex + 1,
                ordered.length,
              )}{" "}
              · {current?.totalAnswers ?? 0} {wordCloudLanguage.answers(lang)} ·{" "}
              {set.status === "OPEN"
                ? wordCloudLanguage.open(lang)
                : wordCloudLanguage.closed(lang)}
              {isViewingLive ? ` · ${wordCloudLanguage.liveBadge(lang)}` : ""}
            </span>
          </div>
          <button
            onClick={() => setActiveSetId(null)}
            className="text-2xl text-icon-color"
          >
            <IoMdClose />
          </button>
        </header>

        {/* Question stepper */}
        <div className="flex items-center gap-2 overflow-x-auto border-b p-2">
          {ordered.map((q, i) => (
            <button
              key={q.wordCloud.id}
              onClick={() => setViewIndex(i)}
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                i === safeViewIndex
                  ? "bg-primary-color text-white"
                  : "bg-background-color text-icon-color hover:bg-gray-200"
              }`}
            >
              {wordCloudLanguage.questionN(lang, i + 1)}
              {i === activeIndex && (
                <span className="rounded bg-success-color px-1 text-[9px] text-white">
                  {wordCloudLanguage.liveBadge(lang)}
                </span>
              )}
            </button>
          ))}
          <AppendInline
            value={newQuestion}
            onChange={setNewQuestion}
            pending={append.isPending}
            placeholder={wordCloudLanguage.questionPlaceholder(lang)}
            label={wordCloudLanguage.addQuestion(lang)}
            onAdd={async () => {
              if (!newQuestion.trim()) return;
              await append.mutateAsync({
                setId: set.id,
                question: newQuestion.trim(),
              });
              setNewQuestion("");
            }}
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            {current &&
              (view === "cloud" ? (
                <WordCloudView words={current.words} />
              ) : (
                <WordCloudBars words={current.words} />
              ))}
          </div>
          <aside className="flex w-64 flex-col items-center gap-3 border-l p-4">
            <div className="relative flex w-full items-center justify-center">
              {activeSetId && (
                <QRCode
                  url={studentUrl}
                  setTriggerQRCode={() => {}}
                  variant="embed"
                />
              )}
            </div>
            <a
              href={studentUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all text-center text-xs text-primary-color underline"
            >
              {studentUrl}
            </a>

            {/* Advance controls */}
            <div className="flex w-full items-center justify-between gap-2">
              <button
                onClick={() => advanceTo(activeIndex - 1)}
                disabled={activeIndex <= 0}
                className="flex items-center gap-1 rounded-lg bg-background-color px-3 py-2 text-xs font-semibold text-icon-color disabled:opacity-40"
              >
                <FaChevronLeft /> {wordCloudLanguage.prevQuestion(lang)}
              </button>
              <button
                onClick={() => advanceTo(activeIndex + 1)}
                disabled={activeIndex >= ordered.length - 1}
                className="flex items-center gap-1 rounded-lg bg-primary-color px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
              >
                {wordCloudLanguage.nextQuestion(lang)} <FaChevronRight />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setView("cloud")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${view === "cloud" ? "bg-primary-color text-white" : "bg-background-color text-icon-color"}`}
              >
                {wordCloudLanguage.cloudView(lang)}
              </button>
              <button
                onClick={() => setView("bars")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${view === "bars" ? "bg-primary-color text-white" : "bg-background-color text-icon-color"}`}
              >
                {wordCloudLanguage.barsView(lang)}
              </button>
            </div>

            <div className="w-full border-t pt-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-icon-color/60">
                {wordCloudLanguage.settings(lang)}
              </p>
              <label className="mb-1 block text-xs text-icon-color/70">
                {wordCloudLanguage.titleLabel(lang)}
              </label>
              <input
                key={set.id}
                defaultValue={set.title ?? ""}
                placeholder={wordCloudLanguage.titlePlaceholder(lang)}
                onBlur={(e) => {
                  const next = e.target.value.trim();
                  if (next !== (set.title ?? "")) {
                    update.mutate({ setId: set.id, title: next });
                  }
                }}
                className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-color"
              />
              <label className="flex items-center gap-2 text-sm text-icon-color">
                <input
                  type="checkbox"
                  checked={set.allowMultiple}
                  onChange={(e) =>
                    update.mutate({
                      setId: set.id,
                      allowMultiple: e.target.checked,
                    })
                  }
                />
                {wordCloudLanguage.allowMultiple(lang)}
              </label>
            </div>
            <div className="w-full border-t pt-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-icon-color/60">
                {wordCloudLanguage.shareResults(lang)}
              </p>
              {set.publicResultsToken ? (
                <div className="flex flex-col gap-2">
                  <a
                    href={resultsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-xs text-primary-color underline"
                  >
                    {resultsUrl}
                  </a>
                  <p className="text-[10px] text-icon-color/60">
                    {wordCloudLanguage.shareHint(lang)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(resultsUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex-1 rounded-lg bg-primary-color px-3 py-2 text-xs font-bold text-white"
                    >
                      {copied
                        ? wordCloudLanguage.copied(lang)
                        : wordCloudLanguage.copyLink(lang)}
                    </button>
                    <button
                      onClick={() => revoke.mutate({ setId: set.id })}
                      disabled={revoke.isPending}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-error-color hover:bg-error-color/10 disabled:opacity-50"
                    >
                      {wordCloudLanguage.removePublicLink(lang)}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => share.mutate({ setId: set.id })}
                  disabled={share.isPending}
                  className="w-full rounded-lg bg-primary-color px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  {wordCloudLanguage.shareResultsAction(lang)}
                </button>
              )}
            </div>
            <button
              onClick={() =>
                update.mutate({
                  setId: set.id,
                  status: set.status === "OPEN" ? "CLOSED" : "OPEN",
                })
              }
              className="w-full rounded-lg bg-warning-color px-3 py-2 text-xs font-bold text-icon-color"
            >
              {set.status === "OPEN"
                ? wordCloudLanguage.closeActivity(lang)
                : wordCloudLanguage.reopenActivity(lang)}
            </button>
          </aside>
        </div>
      </div>
    );
  }

  // ----- List + builder -----
  return (
    <div className="flex h-[80vh] w-[90vw] max-w-2xl flex-col overflow-hidden rounded-2xl bg-white font-Anuphan">
      <header className="flex items-center justify-between border-b p-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-icon-color">
          <PiCloudFog /> {wordCloudLanguage.sessionTitle(lang)}
        </h2>
        <button onClick={onClose} className="text-2xl text-icon-color">
          <IoMdClose />
        </button>
      </header>

      <div className="border-b p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={wordCloudLanguage.titlePlaceholder(lang)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 font-semibold outline-none focus:border-primary-color"
        />
        <div className="flex flex-col gap-2">
          {questions.map((q, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-xs text-icon-color/60">{i + 1}.</span>
              <input
                value={q}
                onChange={(e) => {
                  const next = [...questions];
                  next[i] = e.target.value;
                  setQuestions(next);
                }}
                placeholder={wordCloudLanguage.questionPlaceholder(lang)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-color"
              />
              {questions.length > 1 && (
                <button
                  onClick={() =>
                    setQuestions(questions.filter((_, idx) => idx !== i))
                  }
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-error-color hover:bg-error-color/10"
                >
                  {wordCloudLanguage.removeQuestion(lang)}
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setQuestions([...questions, ""])}
            className="flex items-center gap-1 self-start rounded-lg bg-background-color px-3 py-1 text-xs font-semibold text-icon-color hover:bg-gray-200"
          >
            <FaPlus /> {wordCloudLanguage.addQuestion(lang)}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-icon-color">
          <label className="flex items-center gap-2">
            {wordCloudLanguage.audience(lang)}
            <select
              value={accessMode}
              onChange={(e) => setAccessMode(e.target.value as WordCloudAccess)}
              className="rounded border border-gray-300 px-2 py-1"
            >
              <option value="PUBLIC">
                {wordCloudLanguage.audiencePublic(lang)}
              </option>
              <option value="STUDENTS_ONLY">
                {wordCloudLanguage.audienceStudents(lang)}
              </option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
            />
            {wordCloudLanguage.allowMultiple(lang)}
          </label>
          <button
            onClick={handleCreate}
            disabled={create.isPending}
            className="ml-auto rounded-lg bg-primary-color px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {wordCloudLanguage.startSession(lang)}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {list.isLoading && (
          <p className="text-icon-color/60">{wordCloudLanguage.loading(lang)}</p>
        )}
        {list.data?.length === 0 && (
          <p className="text-icon-color/60">
            {wordCloudLanguage.emptySets(lang)}
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {list.data?.map((set) => (
            <li
              key={set.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-3"
            >
              <button
                onClick={() => {
                  setViewIndex(0);
                  setActiveSetId(set.id);
                }}
                className="flex-1 text-left"
              >
                <span className="font-semibold text-icon-color">
                  {set.title || wordCloudLanguage.sessionTitle(lang)}
                </span>
                <span className="ml-2 text-xs text-icon-color/60">
                  {set.status === "OPEN"
                    ? `● ${wordCloudLanguage.open(lang)}`
                    : `○ ${wordCloudLanguage.closed(lang)}`}
                </span>
              </button>
              <button
                onClick={() => remove.mutate({ setId: set.id })}
                className="rounded-lg px-3 py-1 text-xs font-semibold text-error-color hover:bg-error-color/10"
              >
                {wordCloudLanguage.deleteAction(lang)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Small inline "add question while live" control used in the stepper row.
function AppendInline({
  value,
  onChange,
  onAdd,
  pending,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  pending: boolean;
  placeholder: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 whitespace-nowrap rounded-full bg-background-color px-3 py-1 text-xs font-semibold text-icon-color hover:bg-gray-200"
      >
        <FaPlus /> {label}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <input
        value={value}
        autoFocus
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onAdd();
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        className="w-40 rounded-full border border-gray-300 px-3 py-1 text-xs outline-none focus:border-primary-color"
      />
      <button
        onClick={() => {
          onAdd();
          setOpen(false);
        }}
        disabled={pending}
        className="rounded-full bg-primary-color px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
      >
        {label}
      </button>
    </div>
  );
}

export default WordCloudPanel;
