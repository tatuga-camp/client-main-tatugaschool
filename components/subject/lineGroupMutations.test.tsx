// Services and mutation hooks for LINE group links, driven end to end against a
// stubbed HTTP layer. `axios.create` is replaced before any service module is
// loaded (hence require() instead of import for the app modules), so the calls
// below show the exact request each service sends and how each hook leaves the
// React Query cache.
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

// Load auth before api-service (they import each other; see lineGroupQueries.test.ts).
require("../../services/auth");
const services =
  require("../../services/line-group") as typeof import("../../services/line-group");
const subjectServices =
  require("../../services/subject") as typeof import("../../services/subject");
const hooks =
  require("../../react-query/line-group") as typeof import("../../react-query/line-group");
const subjectHooks =
  require("../../react-query/subject") as typeof import("../../react-query/subject");

const { keyLineGroup } = hooks;

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
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
}

// Runs a hook once (no DOM needed) and hands back what it returned.
function runHook<T>(client: QueryClient, useHook: () => T): T {
  let out: T | undefined;
  function Probe() {
    out = useHook();
    return null;
  }
  renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>,
  );
  return out as T;
}

const silenced = console.error;
beforeEach(() => {
  calls.length = 0;
  respond = async () => ({ data: null });
  console.error = () => {};
});
process.on("exit", () => {
  console.error = silenced;
});

// ---- services: the request each one sends ----

test("GetLineGroupsService: GET /v1/subjects/:subjectId/line-groups, returns the body", async () => {
  const list = [link({ id: "a" }), link({ id: "b" })];
  respond = async () => ({ data: list });
  const out = await services.GetLineGroupsService({ subjectId: "s1" });
  assert.deepEqual(calls, [
    { method: "GET", url: "/v1/subjects/s1/line-groups" },
  ]);
  assert.deepEqual(out, list);
});

test("UpdateLineGroupService: PATCH /v1/subjects/line-groups/:id with only the given switch", async () => {
  respond = async () => ({ data: link({ allowAi: false }) });
  const out = await services.UpdateLineGroupService({
    id: "link-1",
    body: { allowAi: false },
  });
  assert.deepEqual(calls, [
    {
      method: "PATCH",
      url: "/v1/subjects/line-groups/link-1",
      data: { allowAi: false },
    },
  ]);
  assert.equal(out.allowAi, false);
});

test("DisconnectLineGroupService: DELETE /v1/subjects/line-groups/:id, no body", async () => {
  respond = async () => ({ data: link({}) });
  await services.DisconnectLineGroupService({ id: "link-1" });
  assert.deepEqual(calls, [
    { method: "DELETE", url: "/v1/subjects/line-groups/link-1" },
  ]);
});

test("VerifyLineTokenService: still PATCH /v1/subjects/line/verify with { subjectId, token, confirm }", async () => {
  respond = async () => ({ data: link({}) });
  await subjectServices.VerifyLineTokenService({
    body: { subjectId: "s1", token: "tok", confirm: false },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, "PATCH");
  assert.equal(calls[0].url, "/v1/subjects/line/verify");
  assert.deepEqual(calls[0].data, {
    subjectId: "s1",
    token: "tok",
    confirm: false,
  });
});

test("each service rejects with the server's error body (a wrong-owner 403 reaches the caller)", async () => {
  respond = async () => {
    throw httpError(403, "You do not teach this subject");
  };
  const body = {
    statusCode: 403,
    message: "You do not teach this subject",
    error: "Forbidden",
  };
  await assert.rejects(
    () => services.GetLineGroupsService({ subjectId: "other" }),
    (e) => (assert.deepEqual(e, body), true),
  );
  await assert.rejects(
    () => services.UpdateLineGroupService({ id: "x", body: { allowAi: true } }),
    (e) => (assert.deepEqual(e, body), true),
  );
  await assert.rejects(
    () => services.DisconnectLineGroupService({ id: "x" }),
    (e) => (assert.deepEqual(e, body), true),
  );
});

// ---- useUpdateLineGroup ----

test("useUpdateLineGroup: sends just the flipped field and replaces only that link in the cached list", async () => {
  const client = newClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  const otherKey = keyLineGroup.getBySubjectId({ subjectId: "s2" });
  const students = link({ id: "students" });
  const parents = link({ id: "parents", lineGroupId: "Cparents" });
  const pending = link({ id: "pending", isVerify: false, verifyToken: "t" });
  const elsewhere = [link({ id: "students", subjectId: "s2" })];
  client.setQueryData(key, [students, parents, pending]);
  client.setQueryData(otherKey, elsewhere);

  const saved = { ...parents, allowAi: false, updateAt: "later" };
  respond = async () => ({ data: saved });
  const mutation = runHook(client, () => hooks.useUpdateLineGroup());
  await mutation.mutateAsync({ id: "parents", body: { allowAi: false } });

  assert.deepEqual(calls, [
    {
      method: "PATCH",
      url: "/v1/subjects/line-groups/parents",
      data: { allowAi: false },
    },
  ]);
  assert.deepEqual(client.getQueryData(key), [students, saved, pending]);
  // The same group linked to another subject keeps its own switches.
  assert.deepEqual(client.getQueryData(otherKey), elsewhere);
});

test("useUpdateLineGroup: a rejected update leaves the cached list exactly as it was", async () => {
  const client = newClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  const before = [link({ id: "a" }), link({ id: "b" })];
  client.setQueryData(key, before);
  respond = async () => {
    throw httpError(403, "Forbidden");
  };
  const mutation = runHook(client, () => hooks.useUpdateLineGroup());
  await assert.rejects(() =>
    mutation.mutateAsync({ id: "a", body: { allowAssignment: false } }),
  );
  assert.equal(client.getQueryData(key), before);
});

test("useUpdateLineGroup: succeeds without a cached list and does not invent one", async () => {
  const client = newClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  respond = async () => ({ data: link({ id: "a", allowAi: false }) });
  const mutation = runHook(client, () => hooks.useUpdateLineGroup());
  await mutation.mutateAsync({ id: "a", body: { allowAi: false } });
  assert.equal(client.getQueryData(key), undefined);
});

test("useUpdateLineGroup: a link that is no longer in the list is not re-added", async () => {
  const client = newClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  const before = [link({ id: "a" })];
  client.setQueryData(key, before);
  respond = async () => ({ data: link({ id: "gone", allowAi: false }) });
  const mutation = runHook(client, () => hooks.useUpdateLineGroup());
  await mutation.mutateAsync({ id: "gone", body: { allowAi: false } });
  assert.deepEqual(client.getQueryData(key), before);
});

// ---- useDisconnectLineGroup ----

test("useDisconnectLineGroup: removes that one group and leaves the others", async () => {
  const client = newClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  const otherKey = keyLineGroup.getBySubjectId({ subjectId: "s2" });
  const students = link({ id: "students" });
  const parents = link({ id: "parents", lineGroupId: "Cparents" });
  const elsewhere = [link({ id: "students-on-s2", subjectId: "s2" })];
  client.setQueryData(key, [students, parents]);
  client.setQueryData(otherKey, elsewhere);

  respond = async () => ({ data: students });
  const mutation = runHook(client, () => hooks.useDisconnectLineGroup());
  await mutation.mutateAsync({ id: "students" });

  assert.deepEqual(calls, [
    { method: "DELETE", url: "/v1/subjects/line-groups/students" },
  ]);
  assert.deepEqual(client.getQueryData(key), [parents]);
  assert.deepEqual(client.getQueryData(otherKey), elsewhere);
});

test("useDisconnectLineGroup: disconnecting the last group leaves an empty list", async () => {
  const client = newClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  const only = link({ id: "only" });
  client.setQueryData(key, [only]);
  respond = async () => ({ data: only });
  const mutation = runHook(client, () => hooks.useDisconnectLineGroup());
  await mutation.mutateAsync({ id: "only" });
  assert.deepEqual(client.getQueryData(key), []);
});

test("useDisconnectLineGroup: a rejected disconnect (wrong owner / already gone) removes nothing", async () => {
  const client = newClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  const before = [link({ id: "a" }), link({ id: "b" })];
  client.setQueryData(key, before);
  respond = async () => {
    throw httpError(403, "Forbidden");
  };
  const mutation = runHook(client, () => hooks.useDisconnectLineGroup());
  await assert.rejects(
    () => mutation.mutateAsync({ id: "a" }),
    (e: any) => e.statusCode === 403,
  );
  assert.equal(client.getQueryData(key), before);
});

test("useDisconnectLineGroup: a double click sends two requests; the second failing does not bring the group back or drop another", async () => {
  const client = newClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  const a = link({ id: "a" });
  const b = link({ id: "b" });
  client.setQueryData(key, [a, b]);
  let n = 0;
  respond = async () => {
    n += 1;
    if (n > 1) throw httpError(404, "Not found");
    return { data: a };
  };
  const mutation = runHook(client, () => hooks.useDisconnectLineGroup());
  const results = await Promise.allSettled([
    mutation.mutateAsync({ id: "a" }),
    mutation.mutateAsync({ id: "a" }),
  ]);
  assert.equal(calls.length, 2);
  assert.ok(results.some((r) => r.status === "fulfilled"));
  assert.deepEqual(client.getQueryData(key), [b]);
});

// ---- no stale list after a change (in-flight list fetches are cancelled) ----

// Starts a list fetch that stays in flight until `finish` is called with the
// (by then stale) list. Returns the abort signal React Query handed to it.
function startListFetch(client: QueryClient, key: readonly unknown[]) {
  let finish: (list: LineGroupOnSubject[]) => void = () => {};
  const state: { signal?: AbortSignal } = {};
  client
    .fetchQuery({
      queryKey: key,
      staleTime: 0,
      queryFn: ({ signal }) => {
        state.signal = signal;
        return new Promise<LineGroupOnSubject[]>((resolve) => {
          finish = resolve;
        });
      },
    })
    .catch(() => {});
  return { state, finish: (list: LineGroupOnSubject[]) => finish(list) };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

for (const [name, run] of [
  [
    "useUpdateLineGroup",
    (client: QueryClient) =>
      runHook(client, () => hooks.useUpdateLineGroup()).mutateAsync({
        id: "a",
        body: { allowAi: false },
      }),
  ],
  [
    "useDisconnectLineGroup",
    (client: QueryClient) =>
      runHook(client, () => hooks.useDisconnectLineGroup()).mutateAsync({
        id: "a",
      }),
  ],
] as const) {
  const a = link({ id: "a" });
  const b = link({ id: "b", lineGroupId: "Cb" });
  const saved = { ...a, allowAi: false };
  const expected = name === "useUpdateLineGroup" ? [saved, b] : [b];

  test(`${name}: a list fetch already in flight is cancelled before the request is sent, so its stale answer cannot win`, async () => {
    const client = newClient();
    const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
    client.setQueryData(key, [a, b]);
    const fetch = startListFetch(client, key);
    await tick();
    assert.equal(client.getQueryState(key)?.fetchStatus, "fetching");

    let fetchStatusAtRequest: string | undefined;
    respond = async () => {
      fetchStatusAtRequest = client.getQueryState(key)?.fetchStatus;
      return { data: saved };
    };
    await run(client);

    assert.equal(fetchStatusAtRequest, "idle");
    assert.equal(fetch.state.signal?.aborted, true);
    // The old fetch answers late with the list as it was before the change.
    fetch.finish([a, b]);
    await tick();
    assert.deepEqual(client.getQueryData(key), expected);
  });

  test(`${name}: a list fetch that starts while the request is in flight is cancelled before the cache is written`, async () => {
    const client = newClient();
    const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
    client.setQueryData(key, [a, b]);
    let fetch: ReturnType<typeof startListFetch> | undefined;
    respond = async () => {
      fetch = startListFetch(client, key);
      await tick();
      return { data: saved };
    };
    await run(client);

    assert.equal(fetch?.state.signal?.aborted, true);
    assert.equal(client.getQueryState(key)?.fetchStatus, "idle");
    fetch?.finish([a, b]);
    await tick();
    assert.deepEqual(client.getQueryData(key), expected);
  });

  test(`${name}: the list is invalidated after success, and only that subject's list`, async () => {
    const client = newClient();
    const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
    const otherKey = keyLineGroup.getBySubjectId({ subjectId: "s2" });
    client.setQueryData(key, [a, b]);
    client.setQueryData(otherKey, [link({ id: "z", subjectId: "s2" })]);
    respond = async () => ({ data: saved });
    await run(client);
    assert.deepEqual(client.getQueryData(key), expected);
    assert.equal(client.getQueryState(key)?.isInvalidated, true);
    assert.equal(client.getQueryState(otherKey)?.isInvalidated, false);
  });

  test(`${name}: the list is invalidated after a failure too, and another subject's fetch is left running`, async () => {
    const client = newClient();
    const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
    const otherKey = keyLineGroup.getBySubjectId({ subjectId: "s2" });
    const before = [a, b];
    client.setQueryData(key, before);
    client.setQueryData(otherKey, [link({ id: "z", subjectId: "s2" })]);
    const otherFetch = startListFetch(client, otherKey);
    await tick();
    respond = async () => {
      throw httpError(403, "Forbidden");
    };
    await assert.rejects(() => run(client));
    assert.equal(client.getQueryData(key), before);
    assert.equal(client.getQueryState(key)?.isInvalidated, true);
    assert.equal(client.getQueryState(otherKey)?.isInvalidated, false);
    assert.equal(otherFetch.state.signal?.aborted, false);
    assert.equal(client.getQueryState(otherKey)?.fetchStatus, "fetching");
    otherFetch.finish([]);
    await tick();
  });
}

// ---- useVerifyLineToken ----

test("useVerifyLineToken: confirm refreshes that subject's link list only, and no longer writes the subject cache", async () => {
  const client = newClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  const otherKey = keyLineGroup.getBySubjectId({ subjectId: "s2" });
  const subjectKey = ["subject", { id: "s1" }];
  const subject = { id: "s1", title: "Math" };
  client.setQueryData(key, [link({ isVerify: false, verifyToken: "tok" })]);
  client.setQueryData(otherKey, []);
  client.setQueryData(subjectKey, subject);

  respond = async () => ({ data: link({}) });
  const mutation = runHook(client, () => subjectHooks.useVerifyLineToken());
  await mutation.mutateAsync({
    body: { subjectId: "s1", token: "tok", confirm: true },
  });

  assert.deepEqual(calls[0].data, {
    subjectId: "s1",
    token: "tok",
    confirm: true,
  });
  assert.equal(client.getQueryState(key)?.isInvalidated, true);
  assert.equal(client.getQueryState(otherKey)?.isInvalidated, false);
  // A link must never be written where a Subject is expected.
  assert.equal(client.getQueryData(subjectKey), subject);
  assert.equal(client.getQueryState(subjectKey)?.isInvalidated, false);
});

test("useVerifyLineToken: deny (confirm: false) sends the link's token, not the subject id, and refreshes the list", async () => {
  const client = newClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  client.setQueryData(key, [link({ isVerify: false, verifyToken: "tok" })]);
  respond = async () => ({ data: link({ isVerify: false }) });
  const mutation = runHook(client, () => subjectHooks.useVerifyLineToken());
  await mutation.mutateAsync({
    body: { subjectId: "s1", token: "tok", confirm: false },
  });
  assert.deepEqual(calls[0].data, {
    subjectId: "s1",
    token: "tok",
    confirm: false,
  });
  assert.equal(client.getQueryState(key)?.isInvalidated, true);
});

test("useVerifyLineToken: an expired or reused token rejects with the server's 403 and still refreshes the list", async () => {
  const client = newClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  client.setQueryData(key, [link({ isVerify: false, verifyToken: "old" })]);
  respond = async () => {
    throw httpError(403, "Expired line token");
  };
  const mutation = runHook(client, () => subjectHooks.useVerifyLineToken());
  await assert.rejects(
    () =>
      mutation.mutateAsync({
        body: { subjectId: "s1", token: "old", confirm: true },
      }),
    (e: any) => e.message === "Expired line token",
  );
  assert.equal(client.getQueryState(key)?.isInvalidated, true);
});
