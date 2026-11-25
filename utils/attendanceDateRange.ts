// Date range used by the attendance export popup (Excel and image).
// All dates are the teacher's local calendar days.

export const DATE_PRESETS = [
  "all",
  "today",
  "yesterday",
  "last30",
  "thisMonth",
  "lastMonth",
  "custom",
] as const;

export type DatePreset = (typeof DATE_PRESETS)[number];

export type DateBounds = { start?: Date; end?: Date };

/** `YYYY-MM-DD` in local time, the format `<input type="date">` uses. */
export const toInputDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseInputDate = (value: string): Date | undefined => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

/** The from/to input values a preset stands for. Empty strings mean "no limit". */
export const presetRange = (
  preset: DatePreset,
  today: Date = new Date(),
): { from: string; to: string } => {
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  const range = (from: Date, to: Date) => ({
    from: toInputDate(from),
    to: toInputDate(to),
  });

  switch (preset) {
    case "today":
      return range(today, today);
    case "yesterday": {
      const yesterday = new Date(year, month, day - 1);
      return range(yesterday, yesterday);
    }
    case "last30":
      return range(new Date(year, month, day - 30), today);
    case "thisMonth":
      return range(new Date(year, month, 1), today);
    case "lastMonth":
      return range(new Date(year, month - 1, 1), new Date(year, month, 0));
    case "all":
    case "custom":
      return { from: "", to: "" };
  }
};

/** Start of the `from` day to the last millisecond of the `to` day. */
export const toDateBounds = (from: string, to: string): DateBounds => {
  const start = parseInputDate(from);
  const end = parseInputDate(to);
  end?.setHours(23, 59, 59, 999);
  return { ...(start && { start }), ...(end && { end }) };
};

export const isWithinBounds = (
  date: Date | string,
  bounds: DateBounds,
): boolean => {
  const time = new Date(date).getTime();
  if (bounds.start && time < bounds.start.getTime()) return false;
  if (bounds.end && time > bounds.end.getTime()) return false;
  return true;
};
