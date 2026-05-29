import React from "react";
import { animated, useTransition } from "@react-spring/web";
import { WordCount } from "../../../interfaces";
import { useGetLanguage } from "../../../react-query";
import { wordCloudLanguage } from "../../../data/languages";
import WithAnswerers from "./WithAnswerers";

// Vibrant palette in the spirit of the Poll Everywhere word cloud.
const PALETTE = [
  "#2C7CD1", // brand blue
  "#27AE60", // green
  "#F2994A", // orange
  "#9B51E0", // purple
  "#EB5757", // red
  "#2D9CDB", // light blue
  "#16A085", // teal
  "#E2B93B", // gold
  "#EB5E8D", // pink
];

// Stable color per word so it never flickers between polls.
function colorFor(normalized: string): string {
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash + normalized.charCodeAt(i) * (i + 1)) % PALETTE.length;
  }
  return PALETTE[hash];
}

function weightFor(size: number): number {
  if (size >= 48) return 800;
  if (size >= 28) return 700;
  return 600;
}

// Order the words so the largest sits in the middle of the wrapped flow and
// sizes fan outward — the organic, centre-weighted look of a real word cloud.
function arrangeCenterOut(words: WordCount[]): WordCount[] {
  const sorted = [...words].sort((a, b) => b.count - a.count);
  const arranged: WordCount[] = [];
  sorted.forEach((w, i) => {
    if (i % 2 === 0) arranged.push(w);
    else arranged.unshift(w);
  });
  return arranged;
}

function WordCloudView({ words }: { words: WordCount[] }) {
  const language = useGetLanguage();

  const counts = words.map((w) => w.count);
  const max = counts.length ? Math.max(...counts) : 1;
  const min = counts.length ? Math.min(...counts) : 1;
  const minSize = 18;
  const maxSize = 84;

  const sizeFor = (count: number) => {
    if (max === min) return (minSize + maxSize) / 2;
    return minSize + ((count - min) / (max - min)) * (maxSize - minSize);
  };

  const arranged = arrangeCenterOut(words);

  const transitions = useTransition(arranged, {
    keys: (w) => w.normalized,
    from: (w) => ({ opacity: 0, transform: "scale(0.2)", fontSize: sizeFor(w.count) }),
    enter: (w) => ({ opacity: 1, transform: "scale(1)", fontSize: sizeFor(w.count) }),
    update: (w) => ({ opacity: 1, transform: "scale(1)", fontSize: sizeFor(w.count) }),
    leave: { opacity: 0, transform: "scale(0.2)" },
    trail: 40,
    config: { tension: 280, friction: 18 },
  });

  if (words.length === 0) {
    return (
      <div className="flex h-full min-h-60 w-full items-center justify-center text-icon-color/50">
        {wordCloudLanguage.noAnswers(language.data ?? "en")}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-60 w-full flex-wrap content-center items-center justify-center gap-x-3 gap-y-1 p-6">
      {transitions((style, w) => (
        <WithAnswerers students={w.students} className="leading-none">
          <animated.span
            style={{
              ...style,
              color: colorFor(w.normalized),
              fontWeight: weightFor(sizeFor(w.count)),
            }}
            title={`${w.text}: ${w.count}`}
            className="inline-block whitespace-nowrap px-1 font-Anuphan leading-none"
          >
            {w.text}
          </animated.span>
        </WithAnswerers>
      ))}
    </div>
  );
}

export default WordCloudView;
