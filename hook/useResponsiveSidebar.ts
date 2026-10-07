import { useEffect, useSyncExternalStore } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  createOpenStore,
  readStoredOpen,
  shouldCloseAfterNavigate,
  writeStoredOpen,
} from "../utils/sidebarState";

/** Matches Tailwind `xl` — the school shell sidebar is persistent from this width up. */
export const SIDEBAR_PERSISTENT_MQ = "(min-width: 3072px )";

/** From Tailwind `md` up the drawer stays open after navigating. */
export const SIDEBAR_KEEP_OPEN_MQ = "(min-width: 768px)";

export function isSidebarPersistent(): boolean {
  return window.matchMedia(SIDEBAR_PERSISTENT_MQ).matches;
}

export function shouldCloseOnNavigate(): boolean {
  return shouldCloseAfterNavigate({
    persistent: isSidebarPersistent(),
    wide: window.matchMedia(SIDEBAR_KEEP_OPEN_MQ).matches,
  });
}

function sessionStore(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

// One store for the whole tab: survives the layout remount on navigation.
const openStore = createOpenStore((open) => {
  if (typeof window !== "undefined") writeStoredOpen(sessionStore(), open);
});

const getServerSnapshot = () => null;

/**
 * Overlay/drawer below the persistent breakpoint, rail above it.
 * `null` until mount so SSR markup can use CSS defaults without a hydration mismatch.
 * The open state is shared across pages (and persisted per tab in sessionStorage).
 */
export function useResponsiveSidebar() {
  const active = useSyncExternalStore(
    openStore.subscribe,
    openStore.get,
    getServerSnapshot,
  );

  useEffect(() => {
    const mq = window.matchMedia(SIDEBAR_PERSISTENT_MQ);
    if (openStore.get() === null) {
      openStore.set(mq.matches || readStoredOpen(sessionStore()));
    }
    const sync = () => {
      if (mq.matches) openStore.set(true);
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const setActive: Dispatch<SetStateAction<boolean | null>> = (next) =>
    openStore.set((prev) =>
      Boolean(typeof next === "function" ? next(prev) : next),
    );

  return [active, setActive] as const;
}

/** Left offset matching Sidebar width (`xl:w-60`, `2xl:w-72`) while the rail is open. */
export function sidebarContentOffsetClass(active: boolean | null): string {
  if (active === false) {
    return "min-w-0 max-w-full overflow-x-hidden";
  }
  return "min-w-0 max-w-full overflow-x-hidden xl:pl-60 2xl:pl-72";
}
