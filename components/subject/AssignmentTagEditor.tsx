import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose, IoAdd } from "react-icons/io5";
import { tagsDataLanguage } from "../../data/languages/classwork";
import { useGetLanguage } from "../../react-query";

const POPOVER_WIDTH = 240; // w-60 in Tailwind = 15rem = 240px

const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 30;

function normalizeOne(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

type ChipListProps = {
  tags: string[];
  size?: "sm" | "md";
  onRemove?: (tag: string) => void;
};

export function TagChipList({ tags, size = "sm", onRemove }: ChipListProps) {
  if (!tags || tags.length === 0) return null;
  const padding = size === "sm" ? "px-1.5 py-0" : "px-2 py-0.5";
  const text = size === "sm" ? "text-xs" : "text-sm";
  return (
    <ul className="flex flex-wrap items-center gap-1">
      {tags.map((tag) => (
        <li
          key={tag}
          className={`inline-flex items-center gap-1 rounded-2xl border border-primary-color bg-white ${padding} ${text} text-primary-color font-Anuphan`}
        >
          <span className="max-w-[12rem] truncate">{tag}</span>
          {onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(tag);
              }}
              className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary-color/10"
              aria-label={`Remove ${tag}`}
            >
              <IoClose />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

type Props = {
  value: string[];
  suggestions: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  size?: "sm" | "md";
};

function AssignmentTagEditor({
  value,
  suggestions,
  onChange,
  disabled,
  size = "sm",
}: Props) {
  const language = useGetLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setPopoverPos(null);
      return;
    }
    function place() {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const left = Math.max(
        8,
        Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8),
      );
      setPopoverPos({ top: rect.bottom + 4, left });
    }
    place();
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
      setQuery("");
      setHint(null);
    }
    document.addEventListener("mousedown", handler);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const lowerValue = useMemo(
    () => new Set(value.map((t) => t.toLowerCase())),
    [value],
  );

  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suggestions.filter(
      (s) => !lowerValue.has(s.toLowerCase()) && s.toLowerCase().startsWith(q),
    );
  }, [suggestions, lowerValue, query]);

  function tryAdd(raw: string) {
    const normalized = normalizeOne(raw);
    if (!normalized) return;
    if (normalized.length > MAX_TAG_LENGTH) {
      setHint(tagsDataLanguage.tooLong(language.data ?? "en"));
      return;
    }
    if (value.length >= MAX_TAGS) {
      setHint(tagsDataLanguage.limitReached(language.data ?? "en"));
      return;
    }
    if (lowerValue.has(normalized.toLowerCase())) {
      setQuery("");
      return;
    }
    onChange([...value, normalized]);
    setQuery("");
    setHint(null);
  }

  function handleRemove(tag: string) {
    onChange(value.filter((t) => t.toLowerCase() !== tag.toLowerCase()));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSuggestions.length > 0 && query.length === 0) return;
      const pick =
        filteredSuggestions.find(
          (s) => s.toLowerCase() === query.trim().toLowerCase(),
        ) ?? query;
      tryAdd(pick);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
      setHint(null);
    } else if (e.key === "Backspace" && query === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  const padding = size === "sm" ? "px-1.5 py-0" : "px-2 py-0.5";
  const text = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div ref={rootRef} className="relative flex flex-wrap items-center gap-1">
      <TagChipList
        tags={value}
        size={size}
        onRemove={disabled ? undefined : handleRemove}
      />
      {!disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className={`inline-flex items-center gap-1 rounded-2xl border border-dashed border-primary-color/60 bg-white ${padding} ${text} text-primary-color/70 hover:bg-primary-color/5`}
        >
          <IoAdd />
          <span>{tagsDataLanguage.addTag(language.data ?? "en")}</span>
        </button>
      )}
      {open && !disabled && popoverPos && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: popoverPos.top,
              left: popoverPos.left,
              width: POPOVER_WIDTH,
              zIndex: 50,
            }}
            className="rounded-2xl border bg-white p-1 drop-shadow font-Anuphan"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHint(null);
              }}
              onKeyDown={handleKeyDown}
              maxLength={MAX_TAG_LENGTH}
              placeholder={tagsDataLanguage.placeholder(language.data ?? "en")}
              className="w-full rounded-2xl border px-2 py-1 text-sm outline-none focus:border-primary-color"
            />
            {hint && (
              <div className="mt-1 px-2 py-1 text-xs text-error-color">
                {hint}
              </div>
            )}
            {filteredSuggestions.length > 0 && (
              <ul className="mt-1 max-h-40 overflow-auto">
                {filteredSuggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        tryAdd(s);
                      }}
                      className="flex w-full items-center px-2 py-1 text-left text-sm hover:bg-primary-color/10"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default AssignmentTagEditor;
