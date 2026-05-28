import React from "react";
import { tagsDataLanguage } from "../../data/languages/classwork";
import { useGetLanguage } from "../../react-query";

type Props = {
  uniqueTags: string[];
  counts: Record<string, number>;
  selectedTags: Set<string>;
  onChange: (next: Set<string>) => void;
  totalCount: number;
};

function AssignmentTagFilterBar({
  uniqueTags,
  counts,
  selectedTags,
  onChange,
  totalCount,
}: Props) {
  const language = useGetLanguage();
  if (uniqueTags.length === 0) return null;

  const showAllActive = selectedTags.size === 0;

  function toggle(tag: string) {
    const key = tag.toLowerCase();
    const next = new Set(selectedTags);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  }

  return (
    <ul className="flex w-full flex-wrap items-center gap-2 px-5 md:px-40">
      <li>
        <button
          type="button"
          onClick={() => onChange(new Set())}
          className={`inline-flex items-center gap-1 rounded-2xl border border-primary-color px-3 py-1 text-sm font-Anuphan ${
            showAllActive
              ? "bg-primary-color text-white"
              : "bg-white text-primary-color hover:bg-primary-color/10"
          }`}
        >
          <span>{tagsDataLanguage.showAll(language.data ?? "en")}</span>
          <span className="opacity-75">({totalCount})</span>
        </button>
      </li>
      {uniqueTags.map((tag) => {
        const key = tag.toLowerCase();
        const active = selectedTags.has(key);
        return (
          <li key={tag}>
            <button
              type="button"
              onClick={() => toggle(tag)}
              className={`inline-flex items-center gap-1 rounded-2xl border border-primary-color px-3 py-1 text-sm font-Anuphan ${
                active
                  ? "bg-primary-color text-white"
                  : "bg-white text-primary-color hover:bg-primary-color/10"
              }`}
            >
              <span className="max-w-[12rem] truncate">{tag}</span>
              <span className="opacity-75">({counts[key] ?? 0})</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default AssignmentTagFilterBar;
