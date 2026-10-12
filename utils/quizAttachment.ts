import { QuizAttachmentKind } from "../interfaces";

export const MB = 1024 * 1024;

export const QUIZ_ATTACHMENT_MAX_BYTES: Record<QuizAttachmentKind, number> = {
  IMAGE: 5 * MB,
  PDF: 200 * MB,
  VIDEO: 200 * MB,
  AUDIO: 200 * MB,
};

const FILE_MIME_TYPES: Record<Exclude<QuizAttachmentKind, "IMAGE">, string[]> = {
  PDF: ["application/pdf"],
  VIDEO: ["video/mp4", "video/webm", "video/quicktime"],
  AUDIO: [
    "audio/mpeg",
    "audio/mp4",
    "audio/x-m4a",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/aac",
    "audio/webm",
  ],
};

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  aac: "audio/aac",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
};

/** "Attach file" picker filter: MIME types plus extensions for browsers that report none. */
export const QUIZ_FILE_ACCEPT = [
  ...FILE_MIME_TYPES.PDF,
  ...FILE_MIME_TYPES.VIDEO,
  ...FILE_MIME_TYPES.AUDIO,
  ".pdf",
  ".mp4",
  ".m4v",
  ".webm",
  ".mov",
  ".mp3",
  ".m4a",
  ".wav",
  ".ogg",
  ".oga",
  ".aac",
].join(",");

/** The file's MIME type, normalised; from the extension when the browser gives none. */
export function fileMimeType(file: { name: string; type: string }): string {
  const fromBrowser = file.type.split(";")[0].trim().toLowerCase();
  if (fromBrowser) return fromBrowser;
  const dot = file.name.lastIndexOf(".");
  if (dot < 0) return "";
  return MIME_BY_EXTENSION[file.name.slice(dot + 1).toLowerCase()] ?? "";
}

export function kindForMime(mime: string): QuizAttachmentKind | null {
  const m = mime.split(";")[0].trim().toLowerCase();
  if (!m) return null;
  if (m.startsWith("image/")) return "IMAGE";
  for (const kind of ["PDF", "VIDEO", "AUDIO"] as const) {
    if (FILE_MIME_TYPES[kind].includes(m)) return kind;
  }
  return null;
}

export type AttachmentPicker = "image" | "file";

export type AttachmentCheck =
  | { ok: true; kind: QuizAttachmentKind; mimeType: string }
  | { ok: false; reason: "unsupported" | "empty" }
  | { ok: false; reason: "tooLarge"; kind: QuizAttachmentKind; maxBytes: number };

/** Checks a picked file before any upload request. */
export function checkAttachmentFile(
  file: { name: string; type: string; size: number },
  picker: AttachmentPicker,
): AttachmentCheck {
  const mimeType = fileMimeType(file);
  const kind = kindForMime(mimeType);
  if (!kind || (picker === "image") !== (kind === "IMAGE")) {
    return { ok: false, reason: "unsupported" };
  }
  if (file.size <= 0) return { ok: false, reason: "empty" };
  const maxBytes = QUIZ_ATTACHMENT_MAX_BYTES[kind];
  if (file.size > maxBytes) return { ok: false, reason: "tooLarge", kind, maxBytes };
  return { ok: true, kind, mimeType };
}

/** 0 B, 850 KB, 12.4 MB, 200 MB. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / MB;
  return `${Number.isInteger(Math.round(mb * 10) / 10) ? Math.round(mb) : mb.toFixed(1)} MB`;
}
