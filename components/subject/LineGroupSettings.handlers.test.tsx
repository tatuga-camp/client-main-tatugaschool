// What the controls of LineGroupSettings actually send (spec amendment A1).
// There is no DOM here, so the click and change handlers are taken from the
// elements the component creates while it renders (react/jsx-runtime is wrapped
// to record them) and are then called directly, against a stubbed HTTP layer.
// A disabled attribute alone does not prove a handler is inert: these tests
// call the handler anyway, as a script or a re-enabled control would.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { LineGroupOnSubject } from "../../interfaces";

type Call = { method: string; url: string; data?: unknown };
const calls: Call[] = [];
let respond: (config: Call) => Promise<{ data: unknown }> = async () => ({
  data: null,
});

const axios = require("axios");
const fakeInstance = Object.assign(
  (config: Call) => {
    calls.push(config);
    return respond(config);
  },
  { interceptors: { request: { use() {} }, response: { use() {} } } },
);
axios.create = () => fakeInstance;

// Error popups need a document; record them instead.
const alerts: unknown[] = [];
const Swal = require("sweetalert2");
(Swal.default ?? Swal).fire = (options: unknown) => {
  alerts.push(options);
  return Promise.resolve({});
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
const Switch = require("../common/Switch").default;
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

const pendingLink = (overrides: Partial<LineGroupOnSubject> = {}) =>
  link({
    id: "pending-1",
    lineGroupId: "Cffff0a91f",
    groupName: null,
    isVerify: false,
    verifyToken: "tok",
    verifyExpireAt: "2026-11-26T08:00:00.000Z",
    verifiedAt: null,
    ...overrides,
  });

function textOf(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  return "";
}

function mount(links: LineGroupOnSubject[], disabled: boolean) {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  client.setQueryData(["language"], "en");
  client.setQueryData(keyLineGroup.getBySubjectId({ subjectId: "s1" }), links);
  created = [];
  renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <LineGroupSettings subjectId="s1" disabled={disabled} />
    </QueryClientProvider>,
  );
  const elements = created;
  created = [];
  return {
    client,
    switches: elements.filter((element) => element.type === Switch),
    button: (label: string) =>
      elements.filter(
        (element) =>
          element.type === "button" &&
          textOf(element.props.children).trim() === label,
      ),
  };
}

const settle = async () => {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

const silencedError = console.error;
const silencedLog = console.log;
beforeEach(() => {
  calls.length = 0;
  alerts.length = 0;
  respond = async () => ({ data: null });
  console.error = () => {};
  console.log = () => {};
});
process.on("exit", () => {
  console.error = silencedError;
  console.log = silencedLog;
});

test("the recorder sees the controls: four switches per verified card and the card buttons", () => {
  const ui = mount([link({ id: "a" }), pendingLink()], false);
  assert.equal(ui.switches.length, 4);
  assert.equal(ui.button("Disconnect").length, 1);
  assert.equal(ui.button("Confirm").length, 1);
  assert.equal(ui.button("Cancel").length, 1);
  assert.equal(ui.button("Connect another group").length, 1);
});

test("enabled: flipping a switch sends a PATCH for that link with only that field", async () => {
  const fields = [
    "allowAssignment",
    "allowMorningSummary",
    "allowAnnouncement",
    "allowAi",
  ] as const;
  for (const [index, field] of fields.entries()) {
    calls.length = 0;
    const ui = mount([link({ id: "a" }), link({ id: "b" })], false);
    respond = async () => ({ data: link({ id: "b", [field]: false }) });
    // Switches 4..7 belong to the second card.
    await ui.switches[4 + index].props.setChecked(false);
    assert.deepEqual(calls, [
      {
        method: "PATCH",
        url: "/v1/subjects/line-groups/b",
        data: { [field]: false },
      },
    ]);
  }
});

test("archived subject: calling a switch's handler anyway sends nothing and changes nothing", async () => {
  const before = [link({ id: "a" }), link({ id: "b" })];
  const ui = mount(before, true);
  assert.equal(ui.switches.length, 8);
  assert.ok(ui.switches.every((element) => element.props.disabled === true));
  for (const element of ui.switches) {
    await element.props.setChecked(false);
    await element.props.setChecked(true);
  }
  await settle();
  assert.deepEqual(calls, []);
  assert.equal(
    ui.client.getQueryData(keyLineGroup.getBySubjectId({ subjectId: "s1" })),
    before,
  );
  assert.deepEqual(alerts, []);
});

test("enabled: Confirm on a pending card verifies with that link's token and confirm: true", async () => {
  const ui = mount([pendingLink({ verifyToken: "tok-1" })], false);
  respond = async () => ({ data: link({ id: "pending-1" }) });
  await ui.button("Confirm")[0].props.onClick();
  assert.deepEqual(calls, [
    {
      method: "PATCH",
      url: "/v1/subjects/line/verify",
      data: { token: "tok-1", confirm: true, subjectId: "s1" },
    },
  ]);
});

test("archived subject: calling Confirm's handler anyway sends nothing", async () => {
  const ui = mount([link({ id: "a" }), pendingLink()], true);
  const confirm = ui.button("Confirm");
  assert.equal(confirm.length, 1);
  assert.equal(confirm[0].props.disabled, true);
  await confirm[0].props.onClick();
  await settle();
  assert.deepEqual(calls, []);
  assert.deepEqual(alerts, []);
});

test("archived subject: Cancel on a pending card still denies the link (confirm: false, token intact)", async () => {
  const ui = mount(
    [link({ id: "a" }), pendingLink({ verifyToken: "tok-2" })],
    true,
  );
  const cancel = ui.button("Cancel");
  assert.equal(cancel.length, 1);
  assert.equal(cancel[0].props.disabled, false);
  respond = async () => ({ data: pendingLink() });
  await cancel[0].props.onClick();
  assert.deepEqual(calls, [
    {
      method: "PATCH",
      url: "/v1/subjects/line/verify",
      data: { token: "tok-2", confirm: false, subjectId: "s1" },
    },
  ]);
  assert.equal(
    ui.client.getQueryState(keyLineGroup.getBySubjectId({ subjectId: "s1" }))
      ?.isInvalidated,
    true,
  );
});

test("archived subject: Disconnect is still clickable and Connect another group is not", () => {
  const ui = mount([link({ id: "a" }), link({ id: "b" })], true);
  const disconnect = ui.button("Disconnect");
  assert.equal(disconnect.length, 2);
  for (const element of disconnect) {
    assert.notEqual(element.props.disabled, true);
    assert.equal(typeof element.props.onClick, "function");
  }
  const connect = ui.button("Connect another group");
  assert.equal(connect.length, 1);
  assert.equal(connect[0].props.disabled, true);
});

test("a pending link without a token: neither Confirm nor Cancel sends anything, archived or not", async () => {
  for (const disabled of [false, true]) {
    const ui = mount([pendingLink({ verifyToken: null })], disabled);
    await ui.button("Confirm")[0].props.onClick();
    await ui.button("Cancel")[0].props.onClick();
    await settle();
    assert.deepEqual(calls, []);
  }
});

test("enabled: a rejected switch change (subject archived meanwhile) shows the server's error and leaves the list as it was", async () => {
  const before = [link({ id: "a" })];
  const ui = mount(before, false);
  respond = async () => {
    throw {
      response: {
        data: {
          statusCode: 403,
          message: "Subject is archived",
          error: "Forbidden",
        },
      },
    };
  };
  await ui.switches[3].props.setChecked(false);
  assert.equal(calls.length, 1);
  assert.equal(alerts.length, 1);
  assert.deepEqual(alerts[0], {
    title: "Forbidden",
    text: "Subject is archived",
    icon: "error",
  });
  assert.equal(
    ui.client.getQueryData(keyLineGroup.getBySubjectId({ subjectId: "s1" })),
    before,
  );
});

test("enabled: a rejected Confirm (cap reached, expired code) shows the server's error and refreshes the list", async () => {
  const ui = mount([pendingLink()], false);
  respond = async () => {
    throw {
      response: {
        data: {
          statusCode: 400,
          message: "Line group limit reached",
          error: "Bad Request",
        },
      },
    };
  };
  await ui.button("Confirm")[0].props.onClick();
  assert.equal(calls.length, 1);
  assert.deepEqual(alerts, [
    { title: "Bad Request", text: "Line group limit reached", icon: "error" },
  ]);
  assert.equal(
    ui.client.getQueryState(keyLineGroup.getBySubjectId({ subjectId: "s1" }))
      ?.isInvalidated,
    true,
  );
});
