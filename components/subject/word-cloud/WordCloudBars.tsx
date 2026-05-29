import React from "react";
import { WordCount } from "../../../interfaces";
import { useGetLanguage } from "../../../react-query";
import { wordCloudLanguage } from "../../../data/languages";
import WithAnswerers from "./WithAnswerers";

function WordCloudBars({ words }: { words: WordCount[] }) {
  const language = useGetLanguage();
  if (words.length === 0) {
    return (
      <div className="flex h-full min-h-60 w-full items-center justify-center text-icon-color/50">
        {wordCloudLanguage.noAnswers(language.data ?? "en")}
      </div>
    );
  }
  const max = Math.max(...words.map((w) => w.count));

  return (
    <div className="flex w-full flex-col gap-2 p-6">
      {words.map((w) => (
        <WithAnswerers key={w.normalized} students={w.students}>
          <div className="flex items-center gap-3">
            <span className="w-28 truncate text-right text-sm font-semibold text-icon-color">
              {w.text}
            </span>
            <div className="h-6 flex-1 overflow-hidden rounded-lg bg-background-color">
              <div
                className="flex h-full items-center justify-end rounded-lg bg-primary-color pr-2 text-xs font-bold text-white"
                style={{ width: `${(w.count / max) * 100}%` }}
              >
                {w.count}
              </div>
            </div>
          </div>
        </WithAnswerers>
      ))}
    </div>
  );
}

export default WordCloudBars;
