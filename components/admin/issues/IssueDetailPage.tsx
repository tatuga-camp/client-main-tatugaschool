import Link from "next/link";
import { useRouter } from "next/router";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import {
  MdArrowBack,
  MdBugReport,
  MdContentCopy,
  MdExpandMore,
  MdListAlt,
} from "react-icons/md";
import Swal from "sweetalert2";
import { IssueReport, IssueStatus } from "../../../interfaces";
import { useGetIssue, useUpdateIssueStatus } from "../../../react-query/issue";
import { EmptyState, Panel } from "../../common/Panel";
import IssueStatusPill from "./IssueStatusPill";
import { absoluteLabel, browserLabel, timeAgoLabel } from "./issueFormat";

const LIMIT = 20;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard unavailable; text is on screen
        }
      }}
      className="flex items-center gap-1 rounded-xl border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
    >
      <MdContentCopy /> {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ text }: { text: string }) {
  return (
    <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-800">
      {text || "(none)"}
    </pre>
  );
}

function StatTile({
  label,
  value,
  title,
}: {
  label: string;
  value: string | number;
  title?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4" title={title}>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 truncate text-lg font-bold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function ReportRow({ report }: { report: IssueReport }) {
  const [open, setOpen] = useState(false);
  const reporter = report.user
    ? `${report.user.firstName} ${report.user.lastName} · ${report.user.email}`
    : report.userEmail || "Anonymous";
  return (
    <li className="px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 text-left"
        aria-expanded={open}
      >
        {report.user?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.user.photo}
            alt=""
            className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-color/10 text-xs font-bold text-primary-color">
            {report.user ? report.user.firstName.charAt(0) : "?"}
          </span>
        )}
        <div className="min-w-0 grow">
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-semibold text-gray-900">{reporter}</span>
            <span className="text-gray-500">
              {absoluteLabel(report.capturedAt)}
            </span>
          </div>
          <div className="mt-0.5 break-all text-xs text-gray-600">
            {report.pageUrl}
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            {browserLabel(report.userAgent)}
          </div>
        </div>
        <MdExpandMore
          className={`mt-1 shrink-0 text-xl text-gray-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-2 pl-11">
          <div className="text-xs font-semibold text-gray-500">Stack</div>
          <CodeBlock text={report.stack} />
          <div className="text-xs font-semibold text-gray-500">
            Component stack
          </div>
          <CodeBlock text={report.componentStack} />
        </div>
      )}
    </li>
  );
}

export default function IssueDetailPage({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const toast = useRef<Toast>(null);
  const issue = useGetIssue({ groupId, page, limit: LIMIT });
  const update = useUpdateIssueStatus();

  // Role revoked after the SSR guard passed: the API answers 403.
  useEffect(() => {
    const status = (issue.error as { statusCode?: number } | null)?.statusCode;
    if (status === 403) router.replace("/");
  }, [issue.error, router]);

  const changeStatus = async (status: IssueStatus) => {
    const resolving = status === "RESOLVED";
    const { isConfirmed } = await Swal.fire({
      title: resolving ? "Mark this issue as resolved?" : "Reopen this issue?",
      text: resolving
        ? "It will reopen automatically if the same crash is reported again."
        : "The issue goes back to the Open list.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: resolving ? "Mark as resolved" : "Reopen",
    });
    if (!isConfirmed) return;
    update.mutate(
      { groupId, status },
      {
        onSuccess: () =>
          toast.current?.show({
            severity: "success",
            summary: resolving ? "Issue marked as resolved" : "Issue reopened",
          }),
        onError: (error) =>
          toast.current?.show({
            severity: "error",
            summary: "Could not update issue",
            detail: error.message,
          }),
      },
    );
  };

  const group = issue.data?.group;
  const reports = issue.data?.reports;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-5">
      <Toast ref={toast} />
      <Link
        href="/admin/issues"
        className="flex w-fit items-center gap-1 text-sm text-gray-600 hover:text-primary-color"
      >
        <MdArrowBack /> Issues
      </Link>

      {issue.isLoading ? (
        <div className="animate-pulse rounded-2xl border bg-white p-6">
          <div className="h-6 w-1/3 rounded bg-gray-200" />
          <div className="mt-3 h-4 w-2/3 rounded bg-gray-100" />
        </div>
      ) : issue.error || !group ? (
        <Panel Icon={MdBugReport} title="Issue">
          <EmptyState
            Icon={MdBugReport}
            title="Issue not found"
            hint={issue.error?.message}
            action={{ label: "Back to issues", href: "/admin/issues" }}
          />
        </Panel>
      ) : (
        <>
          <header className="flex flex-col gap-3 rounded-2xl border bg-white p-4 md:flex-row md:items-start md:justify-between md:p-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-xl font-bold text-gray-900 md:text-2xl">
                  {group.errorName}
                </h1>
                <IssueStatusPill status={group.status} />
              </div>
              <p className="mt-1 break-words text-sm text-gray-700 md:text-base">
                {group.message}
              </p>
              {group.status === "RESOLVED" && group.resolvedAt && (
                <p className="mt-1 text-xs text-gray-500">
                  Resolved {timeAgoLabel(group.resolvedAt)}
                </p>
              )}
            </div>
            {group.status === "OPEN" ? (
              <button
                type="button"
                disabled={update.isPending}
                onClick={() => changeStatus("RESOLVED")}
                className="main-button shrink-0 disabled:opacity-60"
              >
                Mark as resolved
              </button>
            ) : (
              <button
                type="button"
                disabled={update.isPending}
                onClick={() => changeStatus("OPEN")}
                className="second-button shrink-0 border disabled:opacity-60"
              >
                Reopen
              </button>
            )}
          </header>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile label="Events" value={group.count} />
            <StatTile label="Users" value={group.affectedUserCount} />
            <StatTile
              label="First seen"
              value={timeAgoLabel(group.firstSeenAt)}
              title={absoluteLabel(group.firstSeenAt)}
            />
            <StatTile
              label="Last seen"
              value={timeAgoLabel(group.lastSeenAt)}
              title={absoluteLabel(group.lastSeenAt)}
            />
          </div>

          <Panel
            Icon={MdBugReport}
            title="Stack trace"
            aside={<CopyButton text={group.sampleStack} />}
          >
            <CodeBlock text={group.sampleStack} />
          </Panel>
          <Panel
            Icon={MdBugReport}
            title="Component stack"
            aside={<CopyButton text={group.sampleComponentStack} />}
          >
            <CodeBlock text={group.sampleComponentStack} />
          </Panel>

          <Panel
            Icon={MdListAlt}
            title={`Reports (${reports?.total ?? 0})`}
            bodyClassName="p-0"
          >
            {!reports || reports.items.length === 0 ? (
              <EmptyState Icon={MdListAlt} title="No reports" />
            ) : (
              <ul className="divide-y">
                {reports.items.map((report) => (
                  <ReportRow key={report.id} report={report} />
                ))}
              </ul>
            )}
          </Panel>

          {reports && reports.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-medium">
                Page {reports.page} of {reports.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= reports.totalPages}
                onClick={() =>
                  setPage((p) => Math.min(reports.totalPages, p + 1))
                }
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
