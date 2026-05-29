import React, { useState } from "react";
import { useGetLanguage } from "../../../react-query";
import { wordCloudLanguage } from "../../../data/languages";

/**
 * Wraps an answer (a bar row or a cloud word) and, when answerer names are
 * available (STUDENTS_ONLY clouds), reveals "who answered" on hover (desktop)
 * or tap (touch).
 */
function WithAnswerers({
  students,
  className,
  children,
}: {
  students?: string[];
  className?: string;
  children: React.ReactNode;
}) {
  const language = useGetLanguage();
  const [open, setOpen] = useState(false);
  const has = !!students && students.length > 0;

  return (
    <div
      className={`relative ${has ? "cursor-pointer" : ""} ${className ?? ""}`}
      onMouseEnter={() => has && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => has && setOpen((prev) => !prev)}
    >
      {children}
      {open && has && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[16rem] -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-2 text-left shadow-xl">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-icon-color/60">
            {wordCloudLanguage.answeredBy(language.data ?? "en")} (
            {students!.length})
          </p>
          <ul className="flex max-h-40 flex-col gap-0.5 overflow-auto">
            {students!.map((name, i) => (
              <li
                key={i}
                className="whitespace-nowrap text-xs font-medium text-icon-color"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default WithAnswerers;
