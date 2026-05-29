import React, { useState } from "react";
import { PiCloudFog } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import QRCode from "../QRCode";
import WordCloudView from "./WordCloudView";
import WordCloudBars from "./WordCloudBars";
import { WordCloudAccess } from "../../../interfaces";
import {
  useCreateWordCloud,
  useDeleteWordCloud,
  useGetLanguage,
  useGetWordCloudById,
  useGetWordCloudsBySubject,
  useUpdateWordCloud,
} from "../../../react-query";
import { wordCloudLanguage } from "../../../data/languages";

type Props = {
  subjectId: string;
  onClose: () => void;
};

function WordCloudPanel({ subjectId, onClose }: Props) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<"cloud" | "bars">("cloud");
  const [question, setQuestion] = useState("");
  const [accessMode, setAccessMode] = useState<WordCloudAccess>("PUBLIC");
  const [allowMultiple, setAllowMultiple] = useState(false);

  const list = useGetWordCloudsBySubject({ subjectId });
  const create = useCreateWordCloud();
  const update = useUpdateWordCloud();
  const remove = useDeleteWordCloud();

  const detail = useGetWordCloudById({
    wordCloudId: activeId ?? "",
    refetchInterval: activeId ? 4000 : false,
  });

  const studentUrl = activeId
    ? `${process.env.NEXT_PUBLIC_STUDENT_CLIENT_URL}/word-cloud/${activeId}`
    : "";

  const handleCreate = async () => {
    if (!question.trim()) return;
    const created = await create.mutateAsync({
      question,
      subjectId,
      accessMode,
      allowMultiple,
    });
    setQuestion("");
    setActiveId(created.id);
  };

  if (activeId && detail.data) {
    const wc = detail.data.wordCloud;
    return (
      <div className="flex h-[80vh] w-[90vw] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white font-Anuphan">
        <header className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-lg font-bold text-icon-color">{wc.question}</h2>
            <span className="text-xs text-icon-color/60">
              {detail.data.totalAnswers} {wordCloudLanguage.answers(lang)} ·{" "}
              {wc.status === "OPEN"
                ? wordCloudLanguage.open(lang)
                : wordCloudLanguage.closed(lang)}{" "}
              ·{" "}
              {wc.accessMode === "PUBLIC"
                ? wordCloudLanguage.audiencePublic(lang)
                : wordCloudLanguage.audienceStudents(lang)}
            </span>
          </div>
          <button
            onClick={() => setActiveId(null)}
            className="text-2xl text-icon-color"
          >
            <IoMdClose />
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            {view === "cloud" ? (
              <WordCloudView words={detail.data.words} />
            ) : (
              <WordCloudBars words={detail.data.words} />
            )}
          </div>
          <aside className="flex w-64 flex-col items-center gap-3 border-l p-4">
            <div className="relative flex w-full items-center justify-center">
              {activeId && (
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
            <button
              onClick={() =>
                update.mutate({
                  query: { wordCloudId: wc.id },
                  body: { status: wc.status === "OPEN" ? "CLOSED" : "OPEN" },
                })
              }
              className="w-full rounded-lg bg-warning-color px-3 py-2 text-xs font-bold text-icon-color"
            >
              {wc.status === "OPEN"
                ? wordCloudLanguage.closeActivity(lang)
                : wordCloudLanguage.reopenActivity(lang)}
            </button>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] w-[90vw] max-w-2xl flex-col overflow-hidden rounded-2xl bg-white font-Anuphan">
      <header className="flex items-center justify-between border-b p-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-icon-color">
          <PiCloudFog /> {wordCloudLanguage.title(lang)}
        </h2>
        <button onClick={onClose} className="text-2xl text-icon-color">
          <IoMdClose />
        </button>
      </header>

      <div className="border-b p-4">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={wordCloudLanguage.questionPlaceholder(lang)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary-color"
        />
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
            {wordCloudLanguage.create(lang)}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {list.isLoading && (
          <p className="text-icon-color/60">
            {wordCloudLanguage.loading(lang)}
          </p>
        )}
        {list.data?.length === 0 && (
          <p className="text-icon-color/60">
            {wordCloudLanguage.emptyList(lang)}
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {list.data?.map((wc) => (
            <li
              key={wc.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-3"
            >
              <button
                onClick={() => setActiveId(wc.id)}
                className="flex-1 text-left"
              >
                <span className="font-semibold text-icon-color">
                  {wc.question}
                </span>
                <span className="ml-2 text-xs text-icon-color/60">
                  {wc.status === "OPEN"
                    ? `● ${wordCloudLanguage.open(lang)}`
                    : `○ ${wordCloudLanguage.closed(lang)}`}
                </span>
              </button>
              <button
                onClick={() => remove.mutate({ wordCloudId: wc.id })}
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

export default WordCloudPanel;
