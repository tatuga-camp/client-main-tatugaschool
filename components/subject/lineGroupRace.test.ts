// A list refetch racing a switch flip or a disconnect (spec amendment A8), with
// the list mounted the way a screen mounts it: a live QueryObserver using the
// real query options and the real service. Unlike a hand-written queryFn, the
// real one never reads the abort signal, so these tests show that a cancelled
// fetch's late answer is dropped anyway, and that the list is read again from
// the server once the change has settled.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  QueryClient,
  QueryClientProvider,
  QueryObserver,
} from "@tanstack/react-query";
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

// Load auth before api-service (they import each other; see lineGroupQueries.test.ts).
require("../../services/auth");
const hooks =
  require("../../react-query/line-group") as typeof import("../../react-query/line-group");

const { keyLineGroup, lineGroupsQueryOptions } = hooks;

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

const httpError = (statusCode: number, message: string) => ({
  response: { data: { statusCode, message, error: "Forbidden" } },
});

function newClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function runHook<T>(client: QueryClient, useHook: () => T): T {
  let out: T | undefined;
  function Probe() {
    out = useHook();
    return null;
  }
  renderToStaticMarkup(
    React.createElement(
      QueryClientProvider,
      { client },
      React.createElement(Probe),
    ),
  );
  return out as T;
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
async function until(condition: () => boolean, what: string) {
  for (let i = 0; i < 200; i++) {
    if (condition()) return;
    await tick();
  }
  assert.fail(`timed out waiting for ${what}`);
}

type Deferred = {
  resolve: (list: LineGroupOnSubject[]) => void;
  reject: (error: unknown) => void;
};

// Every GET of the list stays in flight until the test answers it.
function deferLists(other: (config: Call) => Promise<{ data: unknown }>) {
  const gets: Deferred[] = [];
  respond = (config) => {
    if (config.method !== "GET") return other(config);
    return new Promise((resolve, reject) => {
      gets.push({ resolve: (list) => resolve({ data: list }), reject });
    });
  };
  return gets;
}

// Mounts the list like a screen does and loads it once.
async function mountList(
  client: QueryClient,
  gets: Deferred[],
  initial: LineGroupOnSubject[],
) {
  const observer = new QueryObserver(
    client,
    lineGroupsQueryOptions({ subjectId: "s1" }),
  );
  const unsubscribe = observer.subscribe(() => {});
  await until(() => gets.length === 1, "the first list request");
  gets[0].resolve(initial);
  await until(
    () => client.getQueryData(key) !== undefined,
    "the list to be cached",
  );
  return { observer, unsubscribe };
}

const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
const a = link({ id: "a" });
const b = link({ id: "b", lineGroupId: "Cb" });
const c = link({ id: "c", lineGroupId: "Cc" });
const saved = { ...a, allowAi: false };

const silenced = console.error;
beforeEach(() => {
  calls.length = 0;
  respond = async () => ({ data: null });
  console.error = () => {};
});
process.on("exit", () => {
  console.error = silenced;
});

for (const [name, run, afterChange, serverAfter] of [
  [
    "useUpdateLineGroup",
    (client: QueryClient) =>
      runHook(client, () => hooks.useUpdateLineGroup()).mutateAsync({
        id: "a",
        body: { allowAi: false },
      }),
    [saved, b],
    [saved, b, c],
  ],
  [
    "useDisconnectLineGroup",
    (client: QueryClient) =>
      runHook(client, () => hooks.useDisconnectLineGroup()).mutateAsync({
        id: "a",
      }),
    [b],
    [b, c],
  ],
] as const) {
  const changeMethod = name === "useUpdateLineGroup" ? "PATCH" : "DELETE";

  test(`${name} on a mounted list: a refetch in flight answers late with the old list and is ignored; the list is then read again from the server`, async () => {
    const client = newClient();
    const gets = deferLists(async () => ({ data: saved }));
    const { observer, unsubscribe } = await mountList(client, gets, [a, b]);

    // A poll / focus refetch goes out and is still in flight...
    observer.refetch().catch(() => {});
    await until(() => gets.length === 2, "the racing refetch");

    // ...when the teacher makes the change.
    const mutation = run(client);
    await until(() => gets.length === 3, "the refetch after the change");
    assert.deepEqual(client.getQueryData(key), afterChange);

    // The racing refetch answers now, with the list as it was before.
    gets[1].resolve([a, b]);
    await tick();
    await tick();
    assert.deepEqual(client.getQueryData(key), afterChange);

    // The refetch made after the change holds what the server has now.
    gets[2].resolve([...serverAfter]);
    await mutation;
    assert.deepEqual(client.getQueryData(key), serverAfter);
    assert.deepEqual(
      calls.map((call) => call.method),
      ["GET", "GET", changeMethod, "GET"],
    );
    assert.equal(client.getQueryState(key)?.fetchStatus, "idle");
    unsubscribe();
    client.clear();
  });

  test(`${name} on a mounted list: after a rejected change the list is read again and shows the server's list`, async () => {
    const client = newClient();
    const gets = deferLists(async () => {
      throw httpError(403, "Subject is archived");
    });
    const { unsubscribe } = await mountList(client, gets, [a, b]);

    const mutation = run(client);
    const outcome = mutation.then(
      () => "fulfilled",
      (error: any) => error?.message,
    );
    await until(() => gets.length === 2, "the refetch after the failure");
    // Nothing was written while the outcome was unknown.
    assert.deepEqual(client.getQueryData(key), [a, b]);
    // Meanwhile a co-teacher had disconnected group b.
    gets[1].resolve([a]);
    assert.equal(await outcome, "Subject is archived");
    assert.deepEqual(client.getQueryData(key), [a]);
    assert.deepEqual(
      calls.map((call) => call.method),
      ["GET", changeMethod, "GET"],
    );
    unsubscribe();
    client.clear();
  });

  test(`${name} on a mounted list: a failing refetch after a saved change does not turn the change into an error or undo it`, async () => {
    const client = newClient();
    const gets = deferLists(async () => ({ data: saved }));
    const { unsubscribe } = await mountList(client, gets, [a, b]);

    const mutation = run(client);
    await until(() => gets.length === 2, "the refetch after the change");
    gets[1].reject(httpError(500, "Internal server error"));
    await assert.doesNotReject(() => mutation);
    assert.deepEqual(client.getQueryData(key), afterChange);
    unsubscribe();
    client.clear();
  });

  test(`${name}: with the list not loaded yet (first load still in flight) the change goes through and the first load is not written over it`, async () => {
    const client = newClient();
    const gets = deferLists(async () => ({ data: saved }));
    const observer = new QueryObserver(
      client,
      lineGroupsQueryOptions({ subjectId: "s1" }),
    );
    const unsubscribe = observer.subscribe(() => {});
    await until(() => gets.length === 1, "the first list request");

    const mutation = run(client);
    // The first load is cancelled before the cache write; the list is asked
    // for again once the change has settled.
    await until(() => gets.length === 2, "the refetch after the change");
    gets[0].resolve([a, b]);
    await tick();
    await tick();
    assert.equal(client.getQueryData(key), undefined);
    gets[1].resolve([...afterChange]);
    await mutation;
    assert.deepEqual(client.getQueryData(key), afterChange);
    unsubscribe();
    client.clear();
  });
}

// ---- several changes at once, against a small model of the server ----

test("two switches flipped on two groups at the same time: slow, stale list answers never win and the cache ends equal to the server", async () => {
  const client = newClient();
  let server: LineGroupOnSubject[] = [a, b];
  const wait = async (ticks: number) => {
    for (let i = 0; i < ticks; i++) await tick();
  };
  respond = async (config) => {
    if (config.method === "GET") {
      // The list is read when the request arrives and delivered much later.
      const snapshot = server.map((item) => ({ ...item }));
      await wait(6);
      return { data: snapshot };
    }
    const id = config.url.split("/").pop();
    await wait(id === "a" ? 1 : 3);
    server = server.map((item) =>
      item.id === id
        ? { ...item, ...(config.data as Partial<LineGroupOnSubject>) }
        : item,
    );
    return { data: server.find((item) => item.id === id) };
  };

  const observer = new QueryObserver(
    client,
    lineGroupsQueryOptions({ subjectId: "s1" }),
  );
  const unsubscribe = observer.subscribe(() => {});
  await until(
    () => client.getQueryData(key) !== undefined,
    "the list to be cached",
  );

  // A poll is in flight (it read the server before either change)...
  observer.refetch().catch(() => {});
  await tick();
  // ...and each card has its own mutation, as on the settings screen.
  const first = runHook(client, () => hooks.useUpdateLineGroup());
  const second = runHook(client, () => hooks.useUpdateLineGroup());
  await Promise.all([
    first.mutateAsync({ id: "a", body: { allowAi: false } }),
    second.mutateAsync({ id: "b", body: { allowAssignment: false } }),
  ]);
  await until(
    () => client.getQueryState(key)?.fetchStatus === "idle",
    "the last refetch",
  );
  await wait(10);

  assert.equal(server[0].allowAi, false);
  assert.equal(server[1].allowAssignment, false);
  assert.deepEqual(client.getQueryData(key), server);
  unsubscribe();
  client.clear();
});

test("a switch flipped and another group disconnected at the same time: the cache ends equal to the server", async () => {
  const client = newClient();
  let server: LineGroupOnSubject[] = [a, b, c];
  const wait = async (ticks: number) => {
    for (let i = 0; i < ticks; i++) await tick();
  };
  respond = async (config) => {
    if (config.method === "GET") {
      const snapshot = server.map((item) => ({ ...item }));
      await wait(5);
      return { data: snapshot };
    }
    const id = config.url.split("/").pop();
    if (config.method === "DELETE") {
      await wait(1);
      const removed = server.find((item) => item.id === id);
      server = server.filter((item) => item.id !== id);
      return { data: removed };
    }
    await wait(4);
    server = server.map((item) =>
      item.id === id
        ? { ...item, ...(config.data as Partial<LineGroupOnSubject>) }
        : item,
    );
    return { data: server.find((item) => item.id === id) };
  };

  const observer = new QueryObserver(
    client,
    lineGroupsQueryOptions({ subjectId: "s1" }),
  );
  const unsubscribe = observer.subscribe(() => {});
  await until(
    () => client.getQueryData(key) !== undefined,
    "the list to be cached",
  );

  const update = runHook(client, () => hooks.useUpdateLineGroup());
  const disconnect = runHook(client, () => hooks.useDisconnectLineGroup());
  await Promise.all([
    update.mutateAsync({ id: "a", body: { allowAnnouncement: false } }),
    disconnect.mutateAsync({ id: "b" }),
  ]);
  await until(
    () => client.getQueryState(key)?.fetchStatus === "idle",
    "the last refetch",
  );
  await wait(10);

  assert.deepEqual(
    server.map((item) => item.id),
    ["a", "c"],
  );
  assert.equal(server[0].allowAnnouncement, false);
  assert.deepEqual(client.getQueryData(key), server);
  unsubscribe();
  client.clear();
});
