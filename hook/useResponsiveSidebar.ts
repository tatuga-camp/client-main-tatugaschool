import { useEffect, useState } from "react";

/** Matches Tailwind `xl` — the school shell sidebar is persistent from this width up. */
export const SIDEBAR_PERSISTENT_MQ = "(min-width: 1536px )";

export function isSidebarPersistent(): boolean {
  return window.matchMedia(SIDEBAR_PERSISTENT_MQ).matches;
}

/**
 * Overlay/drawer below `xl`, persistent from `xl` up.
 * `null` until mount so SSR markup can use CSS defaults without a hydration mismatch.
 */
export function useResponsiveSidebar() {
  const [active, setActive] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(SIDEBAR_PERSISTENT_MQ);
    const sync = () => setActive(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return [active, setActive] as const;
}

/** Left offset matching Sidebar width (`xl:w-60`, `2xl:w-72`) while the rail is open. */
export function sidebarContentOffsetClass(active: boolean | null): string {
  if (active === false) {
    return "min-w-0 max-w-full overflow-x-hidden";
  }
  return "min-w-0 max-w-full overflow-x-hidden xl:pl-60 2xl:pl-72";
}
