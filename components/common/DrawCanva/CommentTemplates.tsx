import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdAdd, MdComment } from "react-icons/md";

const STORAGE_KEY = "tatuga.drawcanva.commentTemplates";
const DEFAULTS = [
  "Great work!",
  "Show your reasoning.",
  "Check this calculation.",
  "Nice handwriting.",
  "Please revise.",
  "See me after class.",
];

const safeLoad = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((s) => typeof s === "string")
      : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

const safeSave = (templates: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    /* private mode / quota — silently ignore */
  }
};

type Props = {
  open: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
};

export const CommentTemplates: React.FC<Props> = ({
  open,
  onClose,
  onInsert,
}) => {
  const [templates, setTemplates] = useState<string[]>(DEFAULTS);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setTemplates(safeLoad());
  }, []);

  const persist = (next: string[]) => {
    setTemplates(next);
    safeSave(next);
  };

  if (!open) return null;
  return (
    <div className="absolute left-12 top-0 z-40 w-64 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-gray-600">
          Comment templates
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-gray-500 hover:bg-gray-100"
        >
          <IoMdClose />
        </button>
      </div>
      <ul className="max-h-56 space-y-1 overflow-auto">
        {templates.map((t, i) => (
          <li key={`${i}-${t}`} className="group flex items-center gap-1">
            <button
              type="button"
              onClick={() => onInsert(t)}
              className="flex-1 truncate rounded px-2 py-1 text-left text-sm hover:bg-sky-50"
              title={t}
            >
              {t}
            </button>
            <button
              type="button"
              onClick={() => persist(templates.filter((_, j) => j !== i))}
              className="rounded p-1 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
              title="Delete"
            >
              <IoMdClose />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 flex items-center gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          const v = draft.trim();
          if (!v) return;
          persist([...templates, v]);
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="New template…"
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <button
          type="submit"
          className="flex h-7 w-7 items-center justify-center rounded bg-sky-500 text-white hover:bg-sky-600"
          title="Add"
        >
          <MdAdd />
        </button>
      </form>
    </div>
  );
};

export const CommentTemplatesIcon = MdComment;
