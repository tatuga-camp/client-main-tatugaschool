import React, { useRef, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { MdCheck, MdOutlineCalendarMonth } from "react-icons/md";
import { studentPointsLanguage } from "../../data/languages";
import { useEscKey } from "../../hook";
import useClickOutside from "../../hook/useClickOutside";
import { Language } from "../../interfaces";

export type DatePreset =
  | "all"
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "custom";

export type DateRange = { start: Date; end: Date };

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
const endOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};
const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
// Weeks start on Monday, like the Thai school timetable.
const startOfWeek = (date: Date) => {
  const d = startOfDay(date);
  return addDays(d, -((d.getDay() + 6) % 7));
};

export function getPresetRange(
  preset: Exclude<DatePreset, "all" | "custom">,
  now = new Date(),
): DateRange {
  switch (preset) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "yesterday": {
      const y = addDays(now, -1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case "thisWeek":
      return { start: startOfWeek(now), end: endOfDay(now) };
    case "lastWeek": {
      const start = addDays(startOfWeek(now), -7);
      return { start, end: endOfDay(addDays(start, 6)) };
    }
    case "thisMonth":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfDay(now),
      };
  }
}

export function formatRange(range: DateRange, lang: Language) {
  const formatter = new Intl.DateTimeFormat(
    lang === "th" ? "th-TH" : "en-GB",
    { day: "numeric", month: "short" },
  );
  const sameDay =
    startOfDay(range.start).getTime() === startOfDay(range.end).getTime();
  if (sameDay) return formatter.format(range.start);
  // formatRange collapses a shared month ("28–30 Sept"); fall back if missing.
  const withRange = formatter as Intl.DateTimeFormat & {
    formatRange?: (a: Date, b: Date) => string;
  };
  return withRange.formatRange
    ? withRange.formatRange(range.start, range.end)
    : `${formatter.format(range.start)} – ${formatter.format(range.end)}`;
}

export function presetLabel(preset: DatePreset, lang: Language) {
  switch (preset) {
    case "all":
      return studentPointsLanguage.presetAll(lang);
    case "today":
      return studentPointsLanguage.presetToday(lang);
    case "yesterday":
      return studentPointsLanguage.presetYesterday(lang);
    case "thisWeek":
      return studentPointsLanguage.presetThisWeek(lang);
    case "lastWeek":
      return studentPointsLanguage.presetLastWeek(lang);
    case "thisMonth":
      return studentPointsLanguage.presetThisMonth(lang);
    case "custom":
      return studentPointsLanguage.presetCustom(lang);
  }
}

// <input type="date"> speaks YYYY-MM-DD in local time.
const toInputValue = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
const fromInputValue = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const PRESETS: Exclude<DatePreset, "all" | "custom">[] = [
  "today",
  "yesterday",
  "thisWeek",
  "lastWeek",
  "thisMonth",
];

type Props = {
  preset: DatePreset;
  range: DateRange | null;
  onChange: (preset: DatePreset, range: DateRange | null) => void;
  lang: Language;
};

function PointsDateFilter({ preset, range, onChange, lang }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const close = () => {
    setOpen(false);
    setShowCustom(false);
  };
  useClickOutside(ref, close);
  useEscKey(() => {
    if (open) close();
  });

  const openCustom = () => {
    const today = new Date();
    setCustomFrom(toInputValue(range?.start ?? addDays(today, -6)));
    setCustomTo(toInputValue(range?.end ?? today));
    setShowCustom(true);
  };

  const customInvalid =
    !customFrom ||
    !customTo ||
    fromInputValue(customFrom) > fromInputValue(customTo);

  const isActive = preset !== "all";
  const buttonLabel =
    preset === "custom" && range
      ? formatRange(range, lang)
      : presetLabel(preset, lang);

  const itemClass = (active: boolean) =>
    `flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
      active
        ? "bg-primary-color/10 font-semibold text-primary-color"
        : "text-icon-color hover:bg-background-color"
    }`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors ${
          isActive
            ? "border-primary-color/30 bg-primary-color/5 text-primary-color"
            : "border-gray-200 bg-white text-icon-color hover:bg-background-color"
        }`}
      >
        <MdOutlineCalendarMonth className="text-base" />
        <span className="max-w-40 truncate">{buttonLabel}</span>
        <IoChevronDown
          className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        // Phones: dimmed backdrop + bottom sheet. sm+: dropdown under the button.
        <div
          aria-hidden
          onClick={close}
          className="fixed inset-0 z-40 bg-black/30 sm:hidden"
        />
      )}
      {open && (
        <div
          role="dialog"
          aria-label={studentPointsLanguage.periodTitle(lang)}
          className="fixed inset-x-3 bottom-3 z-50 flex max-h-[80dvh] flex-col overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1 shadow-xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-12 sm:z-30 sm:w-72 sm:shadow-lg"
        >
          <div className="px-3 pb-2.5 pt-2.5">
            <p className="text-sm font-semibold text-icon-color">
              {studentPointsLanguage.periodTitle(lang)}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
              {studentPointsLanguage.periodHint(lang)}
            </p>
          </div>
          <div className="mx-2 mb-1 h-px bg-gray-100" />

          <button
            type="button"
            onClick={() => {
              onChange("all", null);
              close();
            }}
            className={itemClass(preset === "all")}
          >
            {studentPointsLanguage.presetAll(lang)}
            {preset === "all" && <MdCheck />}
          </button>
          {PRESETS.map((p) => {
            const r = getPresetRange(p);
            const active = preset === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  onChange(p, r);
                  close();
                }}
                className={itemClass(active)}
              >
                <span>{presetLabel(p, lang)}</span>
                <span
                  className={`text-xs font-normal ${
                    active ? "text-primary-color/80" : "text-gray-400"
                  }`}
                >
                  {formatRange(r, lang)}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            aria-expanded={showCustom}
            onClick={() => (showCustom ? setShowCustom(false) : openCustom())}
            className={itemClass(preset === "custom" || showCustom)}
          >
            <span>{studentPointsLanguage.presetCustom(lang)}</span>
            <span className="text-xs font-normal text-gray-400">
              {preset === "custom" && range ? (
                formatRange(range, lang)
              ) : (
                <IoChevronDown
                  className={`transition-transform ${showCustom ? "rotate-180" : ""}`}
                />
              )}
            </span>
          </button>

          {showCustom && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customInvalid) return;
                onChange("custom", {
                  start: startOfDay(fromInputValue(customFrom)),
                  end: endOfDay(fromInputValue(customTo)),
                });
                close();
              }}
              className="mx-1 mb-1 mt-1 flex flex-col gap-2 rounded-xl bg-background-color p-2.5"
            >
              <div className="grid grid-cols-2 gap-2">
                <label className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">
                    {studentPointsLanguage.from(lang)}
                  </span>
                  <input
                    type="date"
                    required
                    value={customFrom}
                    max={customTo || undefined}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="h-9 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-2 text-xs text-icon-color outline-none focus:border-primary-color"
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500">
                    {studentPointsLanguage.to(lang)}
                  </span>
                  <input
                    type="date"
                    required
                    value={customTo}
                    min={customFrom || undefined}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="h-9 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-2 text-xs text-icon-color outline-none focus:border-primary-color"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={customInvalid}
                className="h-9 rounded-lg bg-primary-color text-sm font-semibold text-white transition-colors hover:bg-primary-color-hover disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
              >
                {studentPointsLanguage.apply(lang)}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default PointsDateFilter;
