export const SIDEBAR_OPEN_KEY = "tatuga:sidebar-open";

/** Stored open flag; any storage failure (private mode, blocked) reads as closed. */
export function readStoredOpen(
  storage: Pick<Storage, "getItem"> | null | undefined,
): boolean {
  try {
    return storage?.getItem(SIDEBAR_OPEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeStoredOpen(
  storage: Pick<Storage, "setItem"> | null | undefined,
  open: boolean,
): void {
  try {
    storage?.setItem(SIDEBAR_OPEN_KEY, open ? "1" : "0");
  } catch {
    // Persistence is a convenience; the in-memory store still works.
  }
}

/** Phones close the drawer after a tap; tablet/desktop keep it open. */
export function shouldCloseAfterNavigate({
  persistent,
  wide,
}: {
  persistent: boolean;
  wide: boolean;
}): boolean {
  return !persistent && !wide;
}

/** Lock page scroll only while the dimming backdrop covers the content. */
export function shouldLockBodyScroll({
  persistent,
  backdropVisible,
}: {
  persistent: boolean;
  backdropVisible: boolean;
}): boolean {
  return !persistent && backdropVisible;
}

/** The menu item to highlight: `?menu=` when present, else the page default. */
export function highlightedMenu(
  queryMenu: string | string[] | undefined,
  defaultMenu: string,
): string {
  const value = Array.isArray(queryMenu) ? queryMenu[0] : queryMenu;
  return value ? value : defaultMenu;
}

export type OpenStore = {
  get(): boolean | null;
  set(next: boolean | ((prev: boolean | null) => boolean)): void;
  subscribe(listener: () => void): () => void;
};

/**
 * Module-level open state. Lives outside React so it survives the layout
 * remount that happens on every page navigation.
 */
export function createOpenStore(
  onChange?: (open: boolean) => void,
): OpenStore {
  let value: boolean | null = null;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next) {
      const resolved = typeof next === "function" ? next(value) : next;
      if (resolved === value) return;
      value = resolved;
      onChange?.(resolved);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
