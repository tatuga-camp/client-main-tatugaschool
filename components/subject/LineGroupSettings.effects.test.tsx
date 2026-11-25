// The QR popup inside LineGroupSettings resets itself (spec amendments A7, B4, C3).
// The helper that decides is covered in utils/lineGroup.test.ts; this file runs
// the component's own effect, so the wiring (previous keys kept in a ref, the
// effect's dependencies, the popup's render condition) is covered too.
//
// There is no DOM here and renderToStaticMarkup never runs effects, so three
// hooks of the component body are served by a small harness that keeps their
// values between renders: the popup's open state (the first useState(false)),
// the previous pending keys (the first useRef of an array) and the reset effect
// (the useEffect whose dependencies are [json string, boolean]). Every other
// hook call goes to React untouched. The first test proves the harness holds
// the right hooks before the others rely on it.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { LineGroupOnSubject } from "../../interfaces";

const ReactModule = require("react");

type Session = {
  open: boolean;
  ref: { current: unknown } | null;
  effect: (() => void) | null;
  deps: unknown[] | null;
  ranDeps: unknown[] | null;
  claimed: { state: boolean; ref: boolean; effect: boolean };
  effectRuns: number;
};
let session: Session | null = null;

const originalUseState = ReactModule.useState;
const originalUseRef = ReactModule.useRef;
const originalUseEffect = ReactModule.useEffect;

ReactModule.useState = (initial: unknown) => {
  const current = session;
  if (current && !current.claimed.state && initial === false) {
    current.claimed.state = true;
    const setOpen = (value: boolean | ((previous: boolean) => boolean)) => {
      current.open = typeof value === "function" ? value(current.open) : value;
    };
    return [current.open, setOpen];
  }
  return originalUseState(initial);
};
ReactModule.useRef = (initial: unknown) => {
  const current = session;
  if (
    current &&
    current.claimed.state &&
    !current.claimed.ref &&
    Array.isArray(initial)
  ) {
    current.claimed.ref = true;
    current.ref ??= { current: initial };
    return current.ref;
  }
  return originalUseRef(initial);
};
ReactModule.useEffect = (effect: () => void, deps?: unknown[]) => {
  const current = session;
  if (
    current &&
    current.claimed.ref &&
    !current.claimed.effect &&
    Array.isArray(deps) &&
    deps.length === 2 &&
    typeof deps[0] === "string" &&
    typeof deps[1] === "boolean"
  ) {
    current.claimed.effect = true;
    current.effect = effect;
    current.deps = deps;
    return;
  }
  return originalUseEffect(effect, deps);
};

type Created = { type: unknown; props: Record<string, any> };
let created: Created[] = [];
for (const [moduleName, names] of [
  ["react/jsx-runtime", ["jsx", "jsxs"]],
  ["react/jsx-dev-runtime", ["jsxDEV"]],
] as const) {
  const runtime = require(moduleName);
  for (const name of names) {
    const original = runtime[name];
    if (typeof original !== "function") continue;
    runtime[name] = (type: unknown, props: any, ...rest: unknown[]) => {
      created.push({ type, props: props ?? {} });
      return original(type, props, ...rest);
    };
  }
}

// Load auth before api-service (they import each other; see lineGroupQueries.test.ts).
require("../../services/auth");
const { keyLineGroup } =
  require("../../react-query/line-group") as typeof import("../../react-query/line-group");
const { RouterContext } =
  require("next/dist/shared/lib/router-context.shared-runtime") as typeof import("next/dist/shared/lib/router-context.shared-runtime");
const QrCodeLineConnect = require("./QrCodeLineConnect").default;
const LineGroupSettings = require("./LineGroupSettings")
  .default as typeof import("./LineGroupSettings").default;

function link(overrides: Partial<LineGroupOnSubject>): LineGroupOnSubject {
  return {
    id: "link-1",
    createAt: "2026-11-25T08:00:00.000Z",
    updateAt: "2026-11-25T08:00:00.000Z",
    lineGroupId: "C123a91f",
    groupName: "ม.2/1 นักเรียน",
    isVerify: true,
    verifyToken: null,
    verifyExpireAt: null,
    verifiedAt: "2026-11-25T08:05:00.000Z",
    allowAssignment: true,
    allowMorningSummary: true,
    allowAnnouncement: true,
    allowAi: true,
    subjectId: "s1",
    schoolId: "school-1",
    ...overrides,
  };
}

const pending = (id: string, overrides: Partial<LineGroupOnSubject> = {}) =>
  link({
    id,
    lineGroupId: `C-${id}`,
    groupName: null,
    isVerify: false,
    verifyToken: `tok-${id}`,
    verifyExpireAt: "2026-11-26T08:00:00.000Z",
    verifiedAt: null,
    ...overrides,
  });

function textOf(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  return "";
}

// One mounted settings section. show() renders with the given list and
// archived flag, runs the reset effect when its dependencies changed (always
// after the first render, as React does) and renders again until the popup's
// open state is settled.
function mountSettings() {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  client.setQueryData(["language"], "en");
  const mine: Session = {
    open: false,
    ref: null,
    effect: null,
    deps: null,
    ranDeps: null,
    claimed: { state: false, ref: false, effect: false },
    effectRuns: 0,
  };
  let elements: Created[] = [];
  let html = "";

  const renderOnce = (disabled: boolean) => {
    mine.claimed = { state: false, ref: false, effect: false };
    mine.effect = null;
    created = [];
    session = mine;
    try {
      html = renderToStaticMarkup(
        <RouterContext.Provider value={{ push: async () => true } as any}>
          <QueryClientProvider client={client}>
            <LineGroupSettings subjectId="s1" disabled={disabled} />
          </QueryClientProvider>
        </RouterContext.Provider>,
      );
    } finally {
      session = null;
    }
    elements = created;
    created = [];
    assert.deepEqual(
      mine.claimed,
      { state: true, ref: true, effect: true },
      "the harness must find the popup state, the previous-ids ref and the reset effect",
    );
    const deps = mine.deps as unknown[];
    const changed =
      mine.ranDeps === null ||
      deps.some((dep, index) => !Object.is(dep, mine.ranDeps![index]));
    if (changed) {
      mine.ranDeps = deps;
      mine.effectRuns += 1;
      mine.effect!();
    }
  };

  const view = {
    show(links: LineGroupOnSubject[] | undefined, disabled = false) {
      if (links) {
        client.setQueryData(
          keyLineGroup.getBySubjectId({ subjectId: "s1" }),
          links,
        );
      }
      for (let pass = 0; pass < 5; pass++) {
        const before = mine.open;
        renderOnce(disabled);
        if (mine.open === before) return view;
      }
      assert.fail("the popup's open state never settled");
    },
    // What the teacher sees.
    get popupShown() {
      return elements.some((element) => element.type === QrCodeLineConnect);
    },
    // The state itself: it also drives the 15 s polling of the list.
    get openState() {
      return mine.open;
    },
    get effectRuns() {
      return mine.effectRuns;
    },
    get html() {
      return html;
    },
    button(label: string) {
      return elements.filter(
        (element) =>
          element.type === "button" &&
          textOf(element.props.children).trim() === label,
      );
    },
    // Click "Connect another group" (or the empty state's button) and render.
    openPopup(links: LineGroupOnSubject[], disabled = false) {
      const [connect] = view.button("Connect another group");
      assert.ok(connect, "the connect button is rendered");
      connect.props.onClick();
      return view.show(links, disabled);
    },
    // Close with the popup's own close button and render.
    closePopup(links: LineGroupOnSubject[], disabled = false) {
      const popup = elements.find(
        (element) => element.type === QrCodeLineConnect,
      );
      assert.ok(popup, "the popup is rendered");
      popup.props.onClose();
      return view.show(links, disabled);
    },
  };
  return view;
}

const silencedError = console.error;
beforeEach(() => {
  console.error = () => {};
});
process.on("exit", () => {
  console.error = silencedError;
});

const v1 = link({ id: "v1" });

// ---- the harness holds the component's own hooks ----

test("harness: the connect button opens the popup, its close button closes it, and nothing resets it on its own", () => {
  const view = mountSettings().show([v1]);
  assert.equal(view.popupShown, false);
  assert.equal(view.openState, false);
  // The effect runs once after the first render and leaves a closed popup closed.
  assert.equal(view.effectRuns, 1);

  view.openPopup([v1]);
  assert.equal(view.openState, true);
  assert.equal(view.popupShown, true);
  assert.ok(view.html.includes('alt="Line QR Code"'));

  // Re-rendering with the same list does not run the effect again.
  view.show([v1]);
  assert.equal(view.effectRuns, 1);
  assert.equal(view.popupShown, true);

  view.closePopup([v1]);
  assert.equal(view.openState, false);
  assert.equal(view.popupShown, false);
  assert.ok(!view.html.includes('alt="Line QR Code"'));
});

test("harness: two mounted sections do not share their popup state", () => {
  const first = mountSettings().show([v1]);
  const second = mountSettings().show([v1]);
  first.openPopup([v1]);
  second.show([v1]);
  assert.equal(first.openState, true);
  assert.equal(second.openState, false);
});

// ---- B4 / A7: a new pending link id resets the popup ----

test("B4: a pending link that appears while the popup is open resets it — state too, not only the view", () => {
  const view = mountSettings().show([v1]);
  view.openPopup([v1]);
  view.show([v1, pending("p1")]);
  assert.equal(view.openState, false);
  assert.equal(view.popupShown, false);
  // The pending card is what is left to act on.
  assert.equal(view.button("Confirm").length, 1);
});

test("B4: once reset, the popup does not come back after the link is confirmed, denied or still waiting", () => {
  for (const after of [
    [v1, link({ id: "p1", lineGroupId: "C-p1" })], // confirmed
    [v1], // denied
    [v1, pending("p1")], // still waiting
  ]) {
    const view = mountSettings().show([v1]);
    view.openPopup([v1]);
    view.show([v1, pending("p1")]);
    view.show(after);
    assert.equal(view.openState, false);
    assert.equal(view.popupShown, false);
  }
});

test("B4: the first pending link on an empty section (empty state's connect button) resets it", () => {
  const view = mountSettings().show([]);
  view.openPopup([]);
  assert.equal(view.popupShown, true);
  view.show([pending("p1")]);
  assert.equal(view.openState, false);
  assert.equal(view.popupShown, false);
});

test("B4: one pending link replaced by another in a single refetch (same count) resets it", () => {
  const view = mountSettings().show([v1, pending("p1")]);
  view.openPopup([v1, pending("p1")]);
  assert.equal(view.popupShown, true);
  // p1 was denied by a co-teacher and p2 was requested, between two polls.
  view.show([v1, pending("p2")]);
  assert.equal(view.openState, false);
  assert.equal(view.popupShown, false);
});

test("B4: at the pending cap the oldest is dropped for the new one (3 → 3) and the popup resets", () => {
  const before = [pending("p1"), pending("p2"), pending("p3")];
  const view = mountSettings().show(before);
  view.openPopup(before);
  view.show([pending("p2"), pending("p3"), pending("p4")]);
  assert.equal(view.openState, false);
});

test("B4: a pending link replaced while another is confirmed (fewer pending, one new id) still resets it", () => {
  const before = [pending("p1"), pending("p2")];
  const view = mountSettings().show(before);
  view.openPopup(before);
  // p1 confirmed, p2 denied, p3 requested: 2 pending → 1 pending.
  view.show([link({ id: "p1" }), pending("p3")]);
  assert.equal(view.openState, false);
});

test("B4: pending links that were already listed when the popup opened do not reset it", () => {
  const links = [v1, pending("p1"), pending("p2")];
  const view = mountSettings().show(links);
  view.openPopup(links);
  assert.equal(view.popupShown, true);
  // The same links again, in another order: none of these is a new pending
  // link and none asked again.
  view.show([pending("p2"), v1, pending("p1")]);
  assert.equal(view.popupShown, true);
  view.show([v1, pending("p1"), pending("p2")]);
  assert.equal(view.popupShown, true);
  assert.equal(view.openState, true);
});

// ---- C3: a pending group that asks again resets the popup ----

const LATER = "2026-11-25T09:00:00.000Z";

test("C3: a pending link already listed that comes back with a different updateAt resets the popup — state too", () => {
  const links = [v1, pending("p1"), pending("p2")];
  const view = mountSettings().show(links);
  view.openPopup(links);
  assert.equal(view.popupShown, true);
  // The group of p1 typed the code again: same id, updateAt touched.
  view.show([v1, pending("p1", { updateAt: LATER }), pending("p2")]);
  assert.equal(view.openState, false);
  assert.equal(view.popupShown, false);
  // Both pending cards are still there to act on.
  assert.equal(view.button("Confirm").length, 2);
});

test("C3: the only pending link asking again resets the popup", () => {
  const view = mountSettings().show([pending("p1")]);
  view.openPopup([pending("p1")]);
  view.show([pending("p1", { updateAt: LATER })]);
  assert.equal(view.openState, false);
  assert.equal(view.popupShown, false);
});

test("C3: once reset by a group asking again, the same list does not reset a popup opened afterwards; asking once more does", () => {
  const asked = [v1, pending("p1", { updateAt: LATER })];
  const view = mountSettings().show([v1, pending("p1")]);
  view.openPopup([v1, pending("p1")]);
  view.show(asked);
  assert.equal(view.openState, false);

  view.openPopup(asked);
  assert.equal(view.popupShown, true);
  view.show(asked);
  assert.equal(view.popupShown, true);

  view.show([v1, pending("p1", { updateAt: "2026-11-25T10:00:00.000Z" })]);
  assert.equal(view.openState, false);
  assert.equal(view.popupShown, false);
});

test("C3: changes to verified links never reset the popup — updateAt touched (a switch flipped), with pending links listed", () => {
  const links = [v1, pending("p1")];
  const view = mountSettings().show(links);
  view.openPopup(links);
  view.show([link({ id: "v1", updateAt: LATER }), pending("p1")]);
  assert.equal(view.openState, true);
  view.show([
    link({ id: "v1", updateAt: LATER, allowAi: false, groupName: "renamed" }),
    pending("p1"),
  ]);
  assert.equal(view.openState, true);
  assert.equal(view.popupShown, true);
});

test("C3: a pending link confirmed elsewhere (its updateAt changes as it becomes verified) does not reset the popup", () => {
  const links = [v1, pending("p1"), pending("p2")];
  const view = mountSettings().show(links);
  view.openPopup(links);
  view.show([
    v1,
    link({ id: "p1", lineGroupId: "C-p1", updateAt: LATER }),
    pending("p2"),
  ]);
  assert.equal(view.openState, true);
  assert.equal(view.popupShown, true);
});

test("C3: a group asking again while the popup is closed does not stop it being opened afterwards", () => {
  const view = mountSettings().show([v1, pending("p1")]);
  view.show([v1, pending("p1", { updateAt: LATER })]);
  assert.equal(view.openState, false);
  view.openPopup([v1, pending("p1", { updateAt: LATER })]);
  assert.equal(view.popupShown, true);
});

test("B4: a pending link confirmed or denied elsewhere, or a verified group added or removed, does not reset it", () => {
  const links = [v1, pending("p1"), pending("p2")];
  const view = mountSettings().show(links);
  view.openPopup(links);
  view.show([v1, link({ id: "p1" }), pending("p2")]); // p1 confirmed
  assert.equal(view.openState, true);
  view.show([v1, link({ id: "p1" })]); // p2 denied
  assert.equal(view.openState, true);
  view.show([link({ id: "p1" })]); // v1 disconnected
  assert.equal(view.openState, true);
  view.show([link({ id: "p1" }), link({ id: "v9" })]); // a verified link appears
  assert.equal(view.openState, true);
  assert.equal(view.popupShown, true);
});

test("B4: a pending id that left and comes back later counts as new (compared with the previous list only)", () => {
  const view = mountSettings().show([v1, pending("p1")]);
  view.show([v1]);
  view.openPopup([v1]);
  view.show([v1, pending("p1")]);
  assert.equal(view.openState, false);
});

test("B4: after a reset the teacher can open the popup again, and the next new pending link resets it again", () => {
  const view = mountSettings().show([v1]);
  view.openPopup([v1]);
  view.show([v1, pending("p1")]);
  assert.equal(view.openState, false);

  view.openPopup([v1, pending("p1")]);
  assert.equal(view.popupShown, true);
  // Unrelated refetches leave it open.
  view.show([v1, pending("p1")]);
  assert.equal(view.popupShown, true);

  view.show([v1, pending("p1"), pending("p2")]);
  assert.equal(view.openState, false);
  assert.equal(view.popupShown, false);
});

test("B4: a pending link that arrives while the popup is closed does not stop it being opened afterwards", () => {
  const view = mountSettings().show([v1]);
  view.show([v1, pending("p1")]);
  assert.equal(view.openState, false);
  view.openPopup([v1, pending("p1")]);
  assert.equal(view.popupShown, true);
});

test("B4: the list arriving after mount (undefined → loaded with a pending link) leaves a closed popup closed", () => {
  const view = mountSettings().show(undefined);
  assert.equal(view.popupShown, false);
  view.show([pending("p1")]);
  assert.equal(view.openState, false);
  assert.equal(view.popupShown, false);
});

// ---- B4 / B1: the section becoming disabled (archived subject) resets the popup ----

test("B4: the subject is archived while the popup is open — it is reset, with or without pending links", () => {
  for (const links of [[v1], [v1, pending("p1")], []]) {
    const view = mountSettings().show(links);
    view.openPopup(links);
    assert.equal(view.popupShown, true);
    view.show(links, true);
    assert.equal(view.popupShown, false);
    assert.equal(view.openState, false);
  }
});

test("B4: archived then restored — the popup does not come back, and can be opened again by hand", () => {
  const view = mountSettings().show([v1]);
  view.openPopup([v1]);
  view.show([v1], true);
  view.show([v1], false);
  assert.equal(view.openState, false);
  assert.equal(view.popupShown, false);
  view.openPopup([v1]);
  assert.equal(view.popupShown, true);
});

test("B4: archived and a new pending link in the same refresh, then restored — still closed", () => {
  const view = mountSettings().show([v1]);
  view.openPopup([v1]);
  view.show([v1, pending("p1")], true);
  assert.equal(view.openState, false);
  view.show([v1, pending("p1")], false);
  assert.equal(view.openState, false);
  assert.equal(view.popupShown, false);
});

test("B4: archive toggled back and forth with pending links changing in between never reopens the popup", () => {
  const view = mountSettings().show([v1]);
  view.openPopup([v1]);
  const steps: [LineGroupOnSubject[], boolean][] = [
    [[v1], true],
    [[v1, pending("p1")], true],
    [[v1, pending("p1")], false],
    [[v1, pending("p2")], false],
    [[v1, pending("p2")], true],
    [[v1], false],
  ];
  for (const [links, disabled] of steps) {
    view.show(links, disabled);
    assert.equal(
      view.openState,
      false,
      JSON.stringify([links.length, disabled]),
    );
    assert.equal(view.popupShown, false);
  }
});

test("B4: on an archived subject the popup is not rendered even if its state were forced open", () => {
  const view = mountSettings().show([v1], true);
  const [connect] = view.button("Connect another group");
  assert.equal(connect.props.disabled, true);
  // A script or a re-enabled button calls the handler anyway.
  connect.props.onClick();
  view.show([v1], true);
  assert.equal(view.popupShown, false);
});

test("B4: mounted on an archived subject with pending links — no popup, Cancel and Disconnect still there", () => {
  const view = mountSettings().show([v1, pending("p1")], true);
  assert.equal(view.popupShown, false);
  assert.equal(view.openState, false);
  assert.equal(view.button("Cancel").length, 1);
  assert.equal(view.button("Cancel")[0].props.disabled, false);
  assert.equal(view.button("Confirm")[0].props.disabled, true);
  assert.equal(view.button("Disconnect").length, 1);
});
