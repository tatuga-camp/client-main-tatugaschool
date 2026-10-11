/**
 * Client side of the server's rate limit (HTTP 429). The API sends
 * { statusCode: 429, retryAfter: seconds, scope: "auth" | "general" }.
 *
 * - The axios interceptors call reportRateLimit() on a 429, which opens the
 *   RateLimitNotice popup with a countdown.
 * - For "general" limits (this account / IP is sending too much), new
 *   requests are held until the wait is over and then sent (see
 *   waitForRateLimit), so polling tabs stop sending requests that would only
 *   be rejected again.
 * - "auth" limits (sign-in, sign-up, forgot password) only show the popup:
 *   they are per email, so the rest of the app keeps working.
 */

export type RateLimitScope = "general" | "auth";

export type RateLimitNotice = {
  scope: RateLimitScope;
  /** Epoch ms when the wait is over. */
  until: number;
  /** Total wait in seconds, for the progress bar. */
  totalSeconds: number;
};

export type RateLimitBody = {
  statusCode: 429;
  message: string;
  error: string;
  retryAfter: number;
  scope: RateLimitScope;
};

const DEFAULT_WAIT_SECONDS = 30;

let notice: RateLimitNotice | null = null;
let generalUntil = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function subscribeRateLimit(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRateLimitNotice(): RateLimitNotice | null {
  return notice;
}

/** True when an error (axios error or a service's rethrown body) is a 429. */
export function isRateLimitError(error: unknown): boolean {
  const e = error as any;
  return e?.statusCode === 429 || e?.response?.status === 429;
}

export function reportRateLimit(
  body: Partial<RateLimitBody> | undefined,
  now = Date.now(),
): void {
  const seconds =
    typeof body?.retryAfter === "number" && body.retryAfter > 0
      ? Math.ceil(body.retryAfter)
      : DEFAULT_WAIT_SECONDS;
  const scope: RateLimitScope = body?.scope === "auth" ? "auth" : "general";
  const until = now + seconds * 1000;

  if (scope === "general") generalUntil = Math.max(generalUntil, until);
  // Keep showing the longer wait if one is already on screen.
  if (notice && notice.until >= until && notice.until > now) return;
  notice = { scope, until, totalSeconds: seconds };
  emit();
}

export function dismissRateLimitNotice(): void {
  if (!notice) return;
  notice = null;
  emit();
}

/** Seconds left on the app-wide pause, or 0 when requests may go out. */
export function generalWaitSeconds(now = Date.now()): number {
  return generalUntil > now ? Math.ceil((generalUntil - now) / 1000) : 0;
}

/**
 * Resolves once the general wait is over (immediately when there is none).
 * Held requests stay in flight instead of failing fast: a failing query that
 * remounts would otherwise refetch in a tight loop and freeze the tab, and
 * React Query de-duplicates the in-flight ones. A little jitter keeps them
 * from all going out in the same millisecond when the wait ends.
 */
export async function waitForRateLimit(
  sleep: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<void> {
  // Loop: another 429 can extend the wait while this request is held.
  for (let left = generalWaitSeconds(); left > 0; left = generalWaitSeconds()) {
    await sleep(generalUntil - Date.now() + Math.floor(Math.random() * 1000));
  }
}

/**
 * An error shaped like the server's 429 (used when a token refresh is
 * rate-limited, so callers see the same body as from the server).
 * Services rethrow `error.response.data`, so callers see the same body.
 */
export function localRateLimitError(seconds: number): Error {
  const body: RateLimitBody = {
    statusCode: 429,
    error: "Too Many Requests",
    message: "Too many requests. Please wait a moment and try again.",
    retryAfter: seconds,
    scope: "general",
  };
  const error = new Error(body.message) as Error & {
    response: { status: number; data: RateLimitBody };
    statusCode: number;
  };
  error.response = { status: 429, data: body };
  error.statusCode = 429;
  return error;
}

type SwalLike = { fire: (...args: any[]) => Promise<any>; close?: () => void };

const isErrorAlert = (args: any[]) =>
  args[0]?.icon === "error" || args[2] === "error";

let swalGuardInstalled = false;

/**
 * Pages show their own SweetAlert error on every failed request. While the
 * rate-limit popup is up those alerts would only say "Too Many Requests"
 * again (or cover the countdown), so error alerts are skipped until it
 * closes. Other alerts (confirmations, success) are untouched. A skipped
 * error alert would have replaced whatever alert was open (usually the
 * "Loading…" spinner shown while the request ran), so that one is closed.
 */
export function installSwalRateLimitGuard(swal: SwalLike): void {
  if (swalGuardInstalled) return;
  swalGuardInstalled = true;
  const originalFire = swal.fire.bind(swal);
  swal.fire = (...args: any[]) => {
    if (notice && isErrorAlert(args)) {
      swal.close?.();
      return Promise.resolve({
        isConfirmed: false,
        isDenied: false,
        isDismissed: true,
      });
    }
    return originalFire(...args);
  };
}

/** Test-only reset. */
export function resetRateLimitForTests(): void {
  notice = null;
  generalUntil = 0;
  listeners.clear();
}
