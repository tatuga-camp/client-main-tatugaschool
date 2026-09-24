import React, { ReactNode } from "react";
import Link from "next/link";
import { IconType } from "react-icons";

// One card language for every Insights panel: white, thin border, rounded-2xl,
// matching the stat cards and list cards used on the other school pages.
export const Panel = ({
  Icon,
  title,
  aside,
  children,
  bodyClassName = "p-4",
  className = "",
}: {
  Icon: IconType;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
}) => (
  <section
    className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-white ${className}`}
  >
    <header className="flex items-center gap-2 border-b px-4 py-3">
      <Icon className="shrink-0 text-lg text-primary-color" />
      <h3 className="min-w-0 truncate font-semibold text-gray-900">{title}</h3>
      {aside && (
        <div className="ml-auto flex shrink-0 items-center gap-2">{aside}</div>
      )}
    </header>
    <div className={`flex grow flex-col ${bodyClassName}`}>{children}</div>
  </section>
);

// Compact empty state: icon, one line of what is missing, one line of why or what to do.
export const EmptyState = ({
  Icon,
  title,
  hint,
  action,
}: {
  Icon: IconType;
  title: string;
  hint?: string;
  action?: { label: string; href: string };
}) => (
  <div className="flex grow flex-col items-center justify-center gap-1 px-4 py-8 text-center">
    <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-color/10">
      <Icon className="text-xl text-primary-color" />
    </span>
    <p className="text-sm font-medium text-gray-700">{title}</p>
    {hint && <p className="max-w-xs text-xs text-gray-400">{hint}</p>}
    {action && (
      <Link
        href={action.href}
        className="mt-2 rounded-2xl border px-3 py-1 text-xs font-medium text-primary-color transition hover:bg-gray-100/50"
      >
        {action.label}
      </Link>
    )}
  </div>
);
