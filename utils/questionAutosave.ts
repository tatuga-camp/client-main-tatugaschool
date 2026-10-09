/**
 * Debounced autosave for one question card. Pure (timers are injected) so the
 * timing rules are unit-tested:
 * - saves `delayMs` after the last edit
 * - never runs two saves at once; edits made during a save trigger one more
 *   save of the latest value once it finishes
 * - retries a failed save on `retryDelaysMs`, then stops in "error" until the
 *   next edit or flush
 */
export type AutosaveStatus =
  | "idle"
  | "waiting"
  | "saving"
  | "saved"
  | "retrying"
  | "error";

type Options<T> = {
  save: (value: T) => Promise<void>;
  delayMs: number;
  retryDelaysMs: number[];
  setTimer: (fn: () => void, ms: number) => unknown;
  clearTimer: (timer: unknown) => void;
  onStatus?: (status: AutosaveStatus) => void;
};

export const QUESTION_AUTOSAVE_DELAY_MS = 2000;
export const QUESTION_AUTOSAVE_RETRY_MS = [1000, 2000, 4000];

export class AutosaveQueue<T> {
  status: AutosaveStatus = "idle";
  private latest: { value: T } | null = null;
  private timer: unknown = null;
  private inFlight: Promise<boolean> | null = null;
  private attempt = 0;

  constructor(private options: Options<T>) {}

  /** Records the newest value and restarts the idle timer. */
  edit(value: T) {
    this.latest = { value };
    this.attempt = 0;
    this.schedule(this.options.delayMs);
    if (!this.inFlight) this.setStatus("waiting");
  }

  /** Drops any pending value without saving (e.g. the draft became invalid). */
  cancel() {
    const hadPending = this.latest !== null || this.timer !== null;
    this.clear();
    this.latest = null;
    // Nothing was pending (e.g. the server copy just caught up): keep "saved".
    if (hadPending && !this.inFlight) this.setStatus("idle");
  }

  /** Nothing pending, nothing in flight, last save did not fail. */
  isSettled() {
    return !this.latest && !this.inFlight && this.status !== "error";
  }

  /** Saves any pending value now. Resolves true when everything is on the server. */
  async flush(): Promise<boolean> {
    this.clear();
    if (this.inFlight) await this.inFlight;
    if (!this.latest) return this.status !== "error";
    this.attempt = this.options.retryDelaysMs.length; // no background retries
    return this.run();
  }

  dispose() {
    this.clear();
  }

  private schedule(ms: number) {
    this.clear();
    this.timer = this.options.setTimer(() => {
      this.timer = null;
      if (this.inFlight) return; // the running save picks up the newest value
      void this.run();
    }, ms);
  }

  private clear() {
    if (this.timer !== null) this.options.clearTimer(this.timer);
    this.timer = null;
  }

  private run(): Promise<boolean> {
    const pending = this.latest;
    if (!pending) return Promise.resolve(true);
    this.latest = null;
    this.setStatus("saving");
    const job = this.options
      .save(pending.value)
      .then(() => {
        this.inFlight = null;
        this.attempt = 0;
        if (this.latest) {
          // Edited while saving: save the newest value after the usual pause.
          this.schedule(this.options.delayMs);
          this.setStatus("waiting");
        } else {
          this.setStatus("saved");
        }
        return true;
      })
      .catch(() => {
        this.inFlight = null;
        // Keep the newest value: an edit made during the failed save wins.
        if (!this.latest) this.latest = pending;
        const retry = this.options.retryDelaysMs[this.attempt];
        if (retry === undefined) {
          this.setStatus("error");
          return false;
        }
        this.attempt += 1;
        this.schedule(retry);
        this.setStatus("retrying");
        return false;
      });
    this.inFlight = job;
    return job;
  }

  private setStatus(status: AutosaveStatus) {
    if (this.status === status) return;
    this.status = status;
    this.options.onStatus?.(status);
  }
}
