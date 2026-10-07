import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SIDEBAR_OPEN_KEY,
  createOpenStore,
  highlightedMenu,
  readStoredOpen,
  shouldCloseAfterNavigate,
  shouldLockBodyScroll,
  writeStoredOpen,
} from "./sidebarState";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

const throwing = {
  getItem: (): string | null => {
    throw new Error("SecurityError");
  },
  setItem: (): void => {
    throw new Error("QuotaExceededError");
  },
};

test("readStoredOpen: '1' is open, anything else closed", () => {
  assert.equal(readStoredOpen(memoryStorage({ [SIDEBAR_OPEN_KEY]: "1" })), true);
  assert.equal(readStoredOpen(memoryStorage({ [SIDEBAR_OPEN_KEY]: "0" })), false);
  assert.equal(readStoredOpen(memoryStorage()), false);
  assert.equal(readStoredOpen(null), false);
  assert.equal(readStoredOpen(undefined), false);
});

test("readStoredOpen / writeStoredOpen swallow storage errors", () => {
  assert.equal(readStoredOpen(throwing), false);
  assert.doesNotThrow(() => writeStoredOpen(throwing, true));
  assert.doesNotThrow(() => writeStoredOpen(null, true));
});

test("writeStoredOpen writes '1' / '0'", () => {
  const s = memoryStorage();
  writeStoredOpen(s, true);
  assert.equal(s.data[SIDEBAR_OPEN_KEY], "1");
  writeStoredOpen(s, false);
  assert.equal(s.data[SIDEBAR_OPEN_KEY], "0");
});

test("shouldCloseAfterNavigate: only on narrow, non-persistent screens", () => {
  assert.equal(shouldCloseAfterNavigate({ persistent: false, wide: false }), true);
  assert.equal(shouldCloseAfterNavigate({ persistent: false, wide: true }), false);
  assert.equal(shouldCloseAfterNavigate({ persistent: true, wide: true }), false);
  assert.equal(shouldCloseAfterNavigate({ persistent: true, wide: false }), false);
});

test("highlightedMenu falls back to default for missing, empty or array query", () => {
  assert.equal(highlightedMenu("Grade", "Subject"), "Grade");
  assert.equal(highlightedMenu(undefined, "Subject"), "Subject");
  assert.equal(highlightedMenu("", "Subject"), "Subject");
  assert.equal(highlightedMenu(["Grade", "Classwork"], "Subject"), "Grade");
  assert.equal(highlightedMenu([], "Subject"), "Subject");
});

test("createOpenStore starts null, notifies listeners, supports updater fn", () => {
  const changes: boolean[] = [];
  const store = createOpenStore((open) => changes.push(open));
  assert.equal(store.get(), null);

  let calls = 0;
  const unsubscribe = store.subscribe(() => calls++);
  store.set(true);
  assert.equal(store.get(), true);
  store.set((prev) => !prev);
  assert.equal(store.get(), false);
  assert.equal(calls, 2);
  assert.deepEqual(changes, [true, false]);

  unsubscribe();
  store.set(true);
  assert.equal(calls, 2);
});

test("createOpenStore skips notify when value is unchanged", () => {
  const store = createOpenStore();
  let calls = 0;
  store.subscribe(() => calls++);
  store.set(false);
  store.set(false);
  assert.equal(calls, 1);
});

test("shouldLockBodyScroll: only while the dimming backdrop is visible", () => {
  assert.equal(shouldLockBodyScroll({ persistent: false, backdropVisible: true }), true);
  // xl..3071px: open sidebar sits beside content as a rail, page must scroll
  assert.equal(shouldLockBodyScroll({ persistent: false, backdropVisible: false }), false);
  assert.equal(shouldLockBodyScroll({ persistent: true, backdropVisible: true }), false);
});
