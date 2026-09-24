import React from "react";

/**
 * Global React Error Boundary.
 *
 * Catches errors thrown during render, in lifecycle methods, in effects and
 * inside state-updater functions anywhere below it, and replaces Next.js'
 * generic "Application error: a client-side exception has occurred" page with
 * a screen that prints everything a developer needs (message, stack,
 * component stack, page URL, time, browser). Users without technical skills
 * can simply screenshot the whole page and send it to the team.
 *
 * Note: like every React error boundary, this does NOT catch errors thrown in
 * event handlers, async callbacks or unhandled promise rejections.
 */

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
  componentStack: string | null;
  capturedAt: string | null;
};

const MAX_STACK_LINES = 12;

function trimLines(text: string | null | undefined, max: number): string {
  if (!text) return "(none)";
  const lines = text.trim().split("\n");
  if (lines.length <= max) return lines.join("\n");
  return `${lines.slice(0, max).join("\n")}\n… (${lines.length - max} more lines)`;
}

function describeError(error: unknown): { name: string; message: string } {
  if (error instanceof Error) {
    return { name: error.name || "Error", message: error.message };
  }
  return { name: "Error", message: String(error) };
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, componentStack: null, capturedAt: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error, capturedAt: new Date().toISOString() };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ componentStack: info.componentStack ?? null });
    // Keep the original console output as well so DevTools users still see it.
    console.error("[ErrorBoundary] Uncaught render error:", error);
    if (info.componentStack) {
      console.error("[ErrorBoundary] Component stack:", info.componentStack);
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return (
      <ErrorFallback
        error={this.state.error}
        componentStack={this.state.componentStack}
        capturedAt={this.state.capturedAt ?? new Date().toISOString()}
      />
    );
  }
}

type FallbackProps = {
  error: Error;
  componentStack: string | null;
  capturedAt: string;
};

function ErrorFallback({ error, componentStack, capturedAt }: FallbackProps) {
  const [copied, setCopied] = React.useState(false);
  const { name, message } = describeError(error);
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const browser = typeof navigator !== "undefined" ? navigator.userAgent : "";

  const report = [
    `Error: ${name}: ${message}`,
    `Time: ${capturedAt}`,
    `Page: ${pageUrl}`,
    `Browser: ${browser}`,
    "",
    "Stack:",
    trimLines(error.stack, MAX_STACK_LINES),
    "",
    "Component stack:",
    trimLines(componentStack, MAX_STACK_LINES),
  ].join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (http, old browsers, permissions).
      // The text is still visible on screen for a screenshot.
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-5">
          <h1 className="text-2xl font-bold text-red-700 md:text-3xl">
            เกิดข้อผิดพลาดในหน้านี้ / Something went wrong
          </h1>
          <p className="mt-2 text-base text-gray-800 md:text-lg">
            กรุณา<span className="font-semibold">ถ่ายภาพหน้าจอนี้ทั้งหมด</span>
            แล้วส่งให้ทีมพัฒนา เพื่อให้เราแก้ไขปัญหาได้เร็วขึ้น
          </p>
          <p className="text-sm text-gray-600 md:text-base">
            Please take a screenshot of this whole screen and send it to the
            developer so we can fix the problem quickly.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
          <div className="text-sm font-semibold text-gray-500">
            ข้อความผิดพลาด / Error message
          </div>
          <div className="mt-1 break-words text-lg font-bold text-red-700">
            {name}: {message}
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-1 text-sm text-gray-700 md:grid-cols-[8rem_1fr]">
            <dt className="font-semibold">เวลา / Time</dt>
            <dd className="break-all">{capturedAt}</dd>
            <dt className="font-semibold">หน้า / Page</dt>
            <dd className="break-all">{pageUrl}</dd>
            <dt className="font-semibold">Browser</dt>
            <dd className="break-all">{browser}</dd>
          </dl>
        </div>

        <details className="mt-4 rounded-2xl border bg-gray-50 p-4" open>
          <summary className="cursor-pointer text-sm font-semibold text-gray-500">
            รายละเอียดทางเทคนิค / Technical details
          </summary>
          <div className="mt-2 text-xs font-semibold text-gray-500">Stack</div>
          <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 font-mono text-xs leading-relaxed text-gray-800 md:text-sm">
            {trimLines(error.stack, MAX_STACK_LINES)}
          </pre>
          <div className="mt-3 text-xs font-semibold text-gray-500">
            Component stack
          </div>
          <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 font-mono text-xs leading-relaxed text-gray-800 md:text-sm">
            {trimLines(componentStack, MAX_STACK_LINES)}
          </pre>
        </details>

        <div className="mt-5 flex flex-col gap-2 md:flex-row">
          <button
            type="button"
            onClick={handleCopy}
            className="second-button rounded-full border px-5 py-2"
          >
            {copied
              ? "คัดลอกแล้ว / Copied"
              : "คัดลอกรายละเอียด / Copy details"}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="main-button rounded-full px-5 py-2"
          >
            โหลดหน้าใหม่ / Reload page
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="second-button rounded-full border px-5 py-2"
          >
            กลับหน้าหลัก / Go to home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
