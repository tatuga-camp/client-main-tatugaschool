import React from "react";
import { attendanceSessionDataLanguage } from "../../data/languages";
import { AttendanceTable, Language } from "../../interfaces";
import Switch from "../common/Switch";

// Building blocks shared by AttendanceChecker and AttendanceQRcode so both
// popups read as one family.

const pad2 = (n: number) => String(n).padStart(2, "0");

export const addOneHour = (datetimeLocal: string): string => {
  if (!datetimeLocal) return datetimeLocal;
  const d = new Date(datetimeLocal);
  if (Number.isNaN(d.getTime())) return datetimeLocal;
  d.setHours(d.getHours() + 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
    d.getDate(),
  )}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

// "in 3 hours" / "ในอีก 3 ชั่วโมง" — null when the time is invalid or passed.
const relativeFromNow = (
  datetimeLocal: string,
  language: Language,
): string | null => {
  const target = new Date(datetimeLocal).getTime();
  if (Number.isNaN(target)) return null;
  const diffSeconds = Math.round((target - Date.now()) / 1000);
  if (diffSeconds <= 0) return null;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(language === "th" ? "th" : "en", {
    numeric: "auto",
  });
  for (const [unit, seconds] of units) {
    if (diffSeconds >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return rtf.format(diffSeconds, "second");
};

export const DateTimeInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...rest }, ref) => (
  <input
    ref={ref}
    type="datetime-local"
    {...rest}
    className={`h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-icon-color outline-none transition focus:border-primary-color focus:ring-2 focus:ring-primary-color/20 ${className}`}
  />
));
DateTimeInput.displayName = "DateTimeInput";

export const Field: React.FC<{
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <label className="flex min-w-0 flex-col gap-1">
    <span className="text-xs font-medium text-icon-color/70">{label}</span>
    {children}
    {hint && <span className="text-xs text-icon-color/60">{hint}</span>}
  </label>
);

export const SectionHeading: React.FC<{
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
}> = ({ icon, title, description }) => (
  <div className="mb-3">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-icon-color">
      {icon && <span className="text-primary-color">{icon}</span>}
      {title}
    </h3>
    {description && (
      <p className="mt-0.5 text-xs text-icon-color/60">{description}</p>
    )}
  </div>
);

export const TablePills: React.FC<{
  tables: AttendanceTable[];
  selectedId?: string;
  onSelect: (table: AttendanceTable) => void;
}> = ({ tables, selectedId, onSelect }) => (
  <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
    {tables.map((table) => {
      const active = selectedId === table.id;
      return (
        <button
          key={table.id}
          type="button"
          onClick={() => onSelect(table)}
          aria-pressed={active}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            active
              ? "bg-primary-color text-white"
              : "bg-background-color text-icon-color hover:bg-primary-color/10"
          }`}
        >
          {table.title}
        </button>
      );
    })}
  </div>
);

export const ClassTimeFields: React.FC<{
  language: Language;
  stackOnDesktop?: boolean;
  startDate?: string;
  endDate?: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}> = ({
  language,
  stackOnDesktop,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}) => {
  const lang = attendanceSessionDataLanguage;
  return (
    <div>
      <div
        className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${stackOnDesktop ? "md:grid-cols-1" : ""}`}
      >
        <Field label={lang.startTime(language)}>
          <DateTimeInput
            required
            value={startDate ?? ""}
            onChange={(e) => onStartChange(e.target.value)}
          />
        </Field>
        <Field label={lang.endTime(language)}>
          <DateTimeInput
            required
            min={startDate || undefined}
            value={endDate ?? ""}
            onChange={(e) => onEndChange(e.target.value)}
          />
        </Field>
      </div>
      <p className="mt-2 text-xs text-icon-color/60">
        {lang.classTimeHint(language)}
      </p>
    </div>
  );
};

export const ScanSettingsFields: React.FC<{
  language: Language;
  stackOnDesktop?: boolean;
  allowScanAt?: string;
  expireAt?: string;
  isAllowScanManyTime?: boolean;
  onAllowScanAtChange: (value: string) => void;
  onExpireAtChange: (value: string) => void;
  onAllowScanManyTimeChange: (value: boolean) => void;
}> = ({
  language,
  stackOnDesktop,
  allowScanAt,
  expireAt,
  isAllowScanManyTime,
  onAllowScanAtChange,
  onExpireAtChange,
  onAllowScanManyTimeChange,
}) => {
  const lang = attendanceSessionDataLanguage;
  const closesIn = expireAt ? relativeFromNow(expireAt, language) : null;
  return (
    <div className="flex flex-col gap-3">
      <div
        className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${stackOnDesktop ? "md:grid-cols-1" : ""}`}
      >
        <Field label={lang.scanOpens(language)}>
          <DateTimeInput
            required
            value={allowScanAt ?? ""}
            onChange={(e) => onAllowScanAtChange(e.target.value)}
          />
        </Field>
        <Field
          label={lang.scanCloses(language)}
          hint={
            expireAt ? (
              closesIn ? (
                <span className="font-medium text-primary-color">
                  {lang.closesIn(closesIn)(language)}
                </span>
              ) : (
                <span className="font-medium text-error-color">
                  {lang.closed(language)}
                </span>
              )
            ) : undefined
          }
        >
          <DateTimeInput
            required
            min={allowScanAt || undefined}
            value={expireAt ?? ""}
            onChange={(e) => onExpireAtChange(e.target.value)}
          />
        </Field>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-icon-color">
            {lang.multipleScans(language)}
          </p>
          <p className="text-xs text-icon-color/60">
            {isAllowScanManyTime
              ? lang.multipleScansOn(language)
              : lang.multipleScansOff(language)}
          </p>
        </div>
        <div className="shrink-0">
          <Switch
            checked={isAllowScanManyTime}
            setChecked={onAllowScanManyTimeChange}
          />
        </div>
      </div>
    </div>
  );
};
