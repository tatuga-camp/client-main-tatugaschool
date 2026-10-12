import { test } from "node:test";
import assert from "node:assert/strict";
import {
  UploadAbortedError,
  UploadNetworkError,
  uploadFileToSignURL,
} from "./uploadWithRetry";

class FakeXhr {
  static instances: FakeXhr[] = [];
  upload: { onprogress: ((e: ProgressEvent) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status = 0;
  responseText = "";
  aborted = false;
  constructor() {
    FakeXhr.instances.push(this);
  }
  open() {}
  setRequestHeader() {}
  send() {}
  abort() {
    this.aborted = true;
    this.onabort?.();
  }
}

const input = (signal?: AbortSignal) => ({
  signURL: "https://r2/put",
  contentType: "video/mp4",
  file: new Blob(["x"]),
  signal,
  delay: async () => {},
  createXhr: () => new FakeXhr() as unknown as XMLHttpRequest,
});

test("aborting stops the request and is not retried", async () => {
  FakeXhr.instances = [];
  const controller = new AbortController();
  const p = uploadFileToSignURL(input(controller.signal));
  controller.abort();
  await assert.rejects(p, UploadAbortedError);
  assert.equal(FakeXhr.instances.length, 1);
  assert.equal(FakeXhr.instances[0].aborted, true);
});

test("an already-aborted signal never opens a request", async () => {
  FakeXhr.instances = [];
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(uploadFileToSignURL(input(controller.signal)), UploadAbortedError);
  assert.equal(FakeXhr.instances.length, 0);
});

test("aborting during the retry wait stops further attempts", async () => {
  FakeXhr.instances = [];
  const controller = new AbortController();
  const p = uploadFileToSignURL({
    ...input(controller.signal),
    delay: async () => {
      controller.abort();
    },
  });
  FakeXhr.instances[0].onerror?.();
  await assert.rejects(p, UploadAbortedError);
  assert.equal(FakeXhr.instances.length, 1);
});

test("network errors are still retried without a signal", async () => {
  FakeXhr.instances = [];
  const p = uploadFileToSignURL({ ...input(), maxAttempts: 2 });
  FakeXhr.instances[0].onerror?.();
  await new Promise((r) => setImmediate(r));
  FakeXhr.instances[1].onerror?.();
  await assert.rejects(p, UploadNetworkError);
  assert.equal(FakeXhr.instances.length, 2);
});
