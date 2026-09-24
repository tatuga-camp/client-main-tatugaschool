import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdBugReport, MdSearch } from "react-icons/md";
import { IssueGroup, IssueStatusFilter } from "../../../interfaces";
import { useGetIssues } from "../../../react-query/issue";
import { EmptyState, Panel } from "../../common/Panel";
import IssueStatusPill from "./IssueStatusPill";
import { absoluteLabel, pathOf, timeAgoLabel } from "./issueFormat";

const LIMIT = 20;
const TABS: { key: IssueStatusFilter; label: string }[] = [
  { key: "OPEN", label: "Open" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "ALL", label: "All" },
];

function readStatus(value: unknown): IssueStatusFilter {
  return value === "RESOLVED" || value === "ALL" ? value : "OPEN";
}

function readPage(value: unknown): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export default function AdminIssuesPage() {
  const router = useRouter();
  const status = readStatus(router.query.status);
  const page = readPage(router.query.page);
  const search = typeof router.query.q === "string" ? router.query.q : "";
  const [searchInput, setSearchInput] = useState(search);

  // Tab, page and search live in the URL so refresh and back work.
  const setQuery = (next: { status?: IssueStatusFilter; page?: number; q?: string }) => {
    const query: Record<string, string> = {};
    const s = next.status ?? status;
    const p = next.page ?? 1;
    const q = next.q ?? search;
    if (s !== "OPEN") query.status = s;
    if (p > 1) query.page = String(p);
    if (q) query.q = q;
    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  };

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (!router.isReady) return;
    const handle = setTimeout(() => {
      if (searchInput !== search) setQuery({ q: searchInput, page: 1 });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, router.isReady]);

  const issues = useGetIssues({
    status,
    search: search || undefined,
    page,
    limit: LIMIT,
  });

  // Role revoked after the SSR guard passed: the API answers 403.
  useEffect(() => {
    const status = (issues.error as { statusCode?: number } | null)?.statusCode;
    if (status === 403) router.replace("/");
  }, [issues.error, router]);

  const counts = issues.data?.counts;
  const countFor = (key: IssueStatusFilter) =>
    key === "OPEN" ? counts?.open : key === "RESOLVED" ? counts?.resolved : undefined;

  const emptyTitle =
    status === "OPEN"
      ? "No open issues"
      : status === "RESOLVED"
        ? "No resolved issues"
        : "No issues yet";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Issues</h1>
          <p className="text-sm text-gray-500">
            Crash reports sent from the error screen
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-sm md:w-80">
          <MdSearch className="shrink-0 text-lg text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search error name or message"
            className="w-full bg-transparent outline-none"
            aria-label="Search issues"
          />
        </label>
      </header>

      <div className="flex gap-1 overflow-x-auto border-b">
        {TABS.map((tab) => {
          const active = tab.key === status;
          const count = countFor(tab.key);
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setQuery({ status: tab.key, page: 1 })}
              className={`shrink-0 pb-2 text-sm text-gray-600 ${
                active
                  ? "border-b-2 border-primary-color px-3 font-semibold text-primary-color sm:px-5"
                  : "px-3 hover:text-gray-800 sm:px-5"
              }`}
            >
              {tab.label}
              {count !== undefined && (
                <span
                  className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${
                    active
                      ? "bg-primary-color/10 text-primary-color"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Panel Icon={MdBugReport} title="Issues" bodyClassName="p-0">
        {issues.isLoading ? (
          <ul className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="animate-pulse px-4 py-4">
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
              </li>
            ))}
          </ul>
        ) : issues.error ? (
          <div className="flex items-center justify-center gap-2 p-6 text-center text-sm text-error-color">
            {issues.error.message || "Could not load issues"}
          </div>
        ) : !issues.data || issues.data.items.length === 0 ? (
          <EmptyState
            Icon={MdBugReport}
            title={emptyTitle}
            hint="Reports sent from the error screen appear here."
          />
        ) : (
          <>
            <table className="hidden w-full text-sm md:table">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-semibold">Issue</th>
                  <th className="px-4 py-2 font-semibold">Last seen</th>
                  <th className="px-4 py-2 font-semibold">First seen</th>
                  <th className="px-4 py-2 text-right font-semibold">Events</th>
                  <th className="px-4 py-2 text-right font-semibold">Users</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {issues.data.items.map((group) => (
                  <IssueRow key={group.id} group={group} />
                ))}
              </tbody>
            </table>
            <ul className="divide-y md:hidden">
              {issues.data.items.map((group) => (
                <IssueCard key={group.id} group={group} />
              ))}
            </ul>
          </>
        )}
      </Panel>

      {issues.data && issues.data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setQuery({ page: page - 1 })}
            className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium">
            Page {issues.data.page} of {issues.data.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= issues.data.totalPages}
            onClick={() => setQuery({ page: page + 1 })}
            className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function IssueSummary({ group }: { group: IssueGroup }) {
  return (
    <div className="min-w-0">
      <div className="truncate font-semibold text-gray-900">{group.errorName}</div>
      <div className="truncate text-gray-600">{group.message}</div>
      <span className="mt-1 inline-block max-w-full truncate rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-600">
        {pathOf(group.samplePageUrl)}
      </span>
    </div>
  );
}

function IssueRow({ group }: { group: IssueGroup }) {
  const href = `/admin/issues/${group.id}`;
  return (
    <tr className="transition hover:bg-gray-50">
      <td className="max-w-md px-4 py-3">
        <Link href={href} className="block">
          <IssueSummary group={group} />
        </Link>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-gray-700" title={absoluteLabel(group.lastSeenAt)}>
        {timeAgoLabel(group.lastSeenAt)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-gray-700" title={absoluteLabel(group.firstSeenAt)}>
        {timeAgoLabel(group.firstSeenAt)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-gray-900">{group.count}</td>
      <td className="px-4 py-3 text-right tabular-nums text-gray-900">
        {group.affectedUserCount}
      </td>
      <td className="px-4 py-3">
        <IssueStatusPill status={group.status} />
      </td>
    </tr>
  );
}

function IssueCard({ group }: { group: IssueGroup }) {
  return (
    <li>
      <Link href={`/admin/issues/${group.id}`} className="flex flex-col gap-3 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <IssueSummary group={group} />
          <IssueStatusPill status={group.status} />
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
          <dt className="font-semibold text-gray-500">Last seen</dt>
          <dd>{timeAgoLabel(group.lastSeenAt)}</dd>
          <dt className="font-semibold text-gray-500">First seen</dt>
          <dd>{timeAgoLabel(group.firstSeenAt)}</dd>
          <dt className="font-semibold text-gray-500">Events</dt>
          <dd>{group.count}</dd>
          <dt className="font-semibold text-gray-500">Users</dt>
          <dd>{group.affectedUserCount}</dd>
        </dl>
      </Link>
    </li>
  );
}
