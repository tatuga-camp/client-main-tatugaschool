// Load auth before api-service: the two import each other, and under CommonJS (tsx --test)
// only this order resolves (webpack's ESM build hoists either way).
import "../../services/auth";
import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import {
  keyLineGroup,
  lineGroupsQueryOptions,
} from "../../react-query/line-group";
import { verifyLineTokenMutationOptions } from "../../react-query/subject";

// Same shape as the app-wide defaults in pages/_app.tsx.
function appClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,
        refetchInterval: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
}

test("line groups query: refetches on window focus even while the data is fresh", () => {
  const options = appClient().defaultQueryOptions(
    lineGroupsQueryOptions({ subjectId: "s1" }),
  );
  assert.equal(options.refetchOnWindowFocus, "always");
});

test("line groups query: keeps the app's background polling when no popup is open", () => {
  const client = appClient();
  assert.equal(
    client.defaultQueryOptions(lineGroupsQueryOptions({ subjectId: "s1" }))
      .refetchInterval,
    2 * 60 * 1000,
  );
  assert.equal(
    client.defaultQueryOptions(
      lineGroupsQueryOptions({ subjectId: "s1" }, { refetchInterval: false }),
    ).refetchInterval,
    2 * 60 * 1000,
  );
});

test("line groups query: polls every 15 s while a connect popup is open", () => {
  const options = appClient().defaultQueryOptions(
    lineGroupsQueryOptions({ subjectId: "s1" }, { refetchInterval: 15_000 }),
  );
  assert.equal(options.refetchInterval, 15_000);
});

async function runVerify(mutationFn: () => Promise<any>) {
  const client = appClient();
  const key = keyLineGroup.getBySubjectId({ subjectId: "s1" });
  client.setQueryData(key, []);
  const mutation = client
    .getMutationCache()
    .build(client, verifyLineTokenMutationOptions(client, mutationFn));
  const variables = {
    body: { subjectId: "s1", token: "token", confirm: true },
  };
  await mutation.execute(variables).catch(() => undefined);
  return client.getQueryState(key);
}

test("verify line token: a successful verify marks the link list stale", async () => {
  const state = await runVerify(async () => ({ id: "link-1" }));
  assert.equal(state?.isInvalidated, true);
});

test("verify line token: a rejected verify (expired token) also marks the link list stale", async () => {
  const state = await runVerify(async () => {
    throw { statusCode: 403, message: "Expired line token" };
  });
  assert.equal(state?.isInvalidated, true);
});
