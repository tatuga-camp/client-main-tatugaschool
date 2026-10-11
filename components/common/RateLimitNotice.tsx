import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MdOutlineHourglassTop } from "react-icons/md";
import { rateLimitLanguageData } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import {
  dismissRateLimitNotice,
  getRateLimitNotice,
  subscribeRateLimit,
} from "../../utils/rateLimit";

const formatWait = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/**
 * Shown when the API answers 429 (see utils/rateLimit). Counts down the wait
 * the server asked for and closes itself; the page underneath is untouched
 * so nothing the user was doing is lost.
 */
function RateLimitNotice() {
  const notice = useSyncExternalStore(
    subscribeRateLimit,
    getRateLimitNotice,
    () => null,
  );
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [now, setNow] = useState(() => Date.now());
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!notice) return;
    setNow(Date.now());
    buttonRef.current?.focus();
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= notice.until) dismissRateLimitNotice();
    }, 250);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissRateLimitNotice();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [notice]);

  if (!notice) return null;

  const secondsLeft = Math.max(0, Math.ceil((notice.until - now) / 1000));
  const remaining = Math.min(1, secondsLeft / notice.totalSeconds);
  const isAuth = notice.scope === "auth";
  const t = rateLimitLanguageData;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={dismissRateLimitNotice}
        className="absolute inset-0 bg-icon-color/40 backdrop-blur-[2px]"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="rate-limit-title"
        aria-describedby="rate-limit-body"
        data-testid="rate-limit-notice"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-color/10 text-primary-color">
          <MdOutlineHourglassTop className="h-6 w-6" aria-hidden="true" />
        </div>

        <h2
          id="rate-limit-title"
          className="mt-4 text-lg font-semibold text-icon-color"
        >
          {isAuth ? t.authTitle(lang) : t.generalTitle(lang)}
        </h2>
        <p id="rate-limit-body" className="mt-1 text-sm leading-6 text-gray-600">
          {isAuth ? t.authBody(lang) : t.generalBody(lang)}
        </p>

        <div className="mt-5 rounded-xl bg-background-color px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-gray-600">
              {isAuth ? t.authCountdown(lang) : t.generalCountdown(lang)}
            </span>
            <span className="text-2xl font-semibold tabular-nums text-primary-color">
              {formatWait(secondsLeft)}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-color/10">
            <div
              className="h-full rounded-full bg-primary-color transition-[width] duration-300 ease-linear motion-reduce:transition-none"
              style={{ width: `${remaining * 100}%` }}
            />
          </div>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={dismissRateLimitNotice}
          className="mt-5 w-full rounded-full bg-primary-color py-2.5 text-sm font-semibold text-white transition hover:bg-primary-color-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-color focus-visible:ring-offset-2 active:bg-primary-color-focus"
        >
          {t.dismiss(lang)}
        </button>
      </div>
    </div>
  );
}

export default RateLimitNotice;
