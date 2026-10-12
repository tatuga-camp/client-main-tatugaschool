import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkAttachmentFile,
  fileMimeType,
  formatBytes,
  kindForMime,
  MB,
  QUIZ_FILE_ACCEPT,
} from "./quizAttachment";

test("fileMimeType normalises the browser type", () => {
  assert.equal(fileMimeType({ name: "a.webm", type: "Audio/WebM;codecs=opus" }), "audio/webm");
});

test("fileMimeType falls back to the extension when the browser gives none", () => {
  assert.equal(fileMimeType({ name: "Voice.M4A", type: "" }), "audio/mp4");
  assert.equal(fileMimeType({ name: "clip.mov", type: "" }), "video/quicktime");
  assert.equal(fileMimeType({ name: "doc.pdf", type: "" }), "application/pdf");
  assert.equal(fileMimeType({ name: "noext", type: "" }), "");
});

test("kindForMime maps the allowed types only", () => {
  assert.equal(kindForMime("image/heic"), "IMAGE");
  assert.equal(kindForMime("application/pdf"), "PDF");
  assert.equal(kindForMime("video/quicktime"), "VIDEO");
  assert.equal(kindForMime("audio/x-m4a"), "AUDIO");
  assert.equal(kindForMime("application/zip"), null);
});

test("checkAttachmentFile enforces 200 MB exactly", () => {
  const at = checkAttachmentFile({ name: "a.mp4", type: "video/mp4", size: 200 * MB }, "file");
  assert.deepEqual(at, { ok: true, kind: "VIDEO", mimeType: "video/mp4" });
  const over = checkAttachmentFile({ name: "a.mp4", type: "video/mp4", size: 200 * MB + 1 }, "file");
  assert.deepEqual(over, { ok: false, reason: "tooLarge", kind: "VIDEO", maxBytes: 200 * MB });
});

test("checkAttachmentFile keeps images at 5 MB", () => {
  const over = checkAttachmentFile({ name: "p.png", type: "image/png", size: 5 * MB + 1 }, "image");
  assert.deepEqual(over, { ok: false, reason: "tooLarge", kind: "IMAGE", maxBytes: 5 * MB });
});

test("checkAttachmentFile respects which picker was used", () => {
  assert.deepEqual(
    checkAttachmentFile({ name: "p.png", type: "image/png", size: 10 }, "file"),
    { ok: false, reason: "unsupported" },
  );
  assert.deepEqual(
    checkAttachmentFile({ name: "a.pdf", type: "application/pdf", size: 10 }, "image"),
    { ok: false, reason: "unsupported" },
  );
});

test("checkAttachmentFile rejects empty and unknown files", () => {
  assert.deepEqual(checkAttachmentFile({ name: "a.pdf", type: "application/pdf", size: 0 }, "file"), { ok: false, reason: "empty" });
  assert.deepEqual(checkAttachmentFile({ name: "a.zip", type: "application/zip", size: 9 }, "file"), { ok: false, reason: "unsupported" });
});

test("formatBytes", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(850 * 1024), "850 KB");
  assert.equal(formatBytes(12.4 * MB), "12.4 MB");
  assert.equal(formatBytes(200 * MB), "200 MB");
});

test("QUIZ_FILE_ACCEPT lists file types and extensions but no images", () => {
  assert.match(QUIZ_FILE_ACCEPT, /application\/pdf/);
  assert.match(QUIZ_FILE_ACCEPT, /\.m4a/);
  assert.doesNotMatch(QUIZ_FILE_ACCEPT, /image/);
});
