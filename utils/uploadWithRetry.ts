/**
 * Upload a file to a presigned URL with automatic retry on network-level
 * failures. Mobile connections (especially Android over LTE) drop mid-upload
 * often enough that a single attempt produces a bare "Network Error" for
 * students; HTTP-level rejections (e.g. an expired or mismatched signature)
 * are NOT retried because they will fail the same way every time.
 */

export class UploadHttpError extends Error {
  constructor(
    public status: number,
    public responseText: string,
  ) {
    super(
      `Upload rejected by storage (HTTP ${status}). ${responseText.slice(0, 300)}`.trim(),
    );
    this.name = "UploadHttpError";
  }
}

export class UploadNetworkError extends Error {
  constructor(public attempts: number) {
    super(
      `Upload failed after ${attempts} attempts because the connection was interrupted. Please check your internet connection and try again.`,
    );
    this.name = "UploadNetworkError";
  }
}

export class UnreadableFileError extends Error {
  constructor(public fileName: string) {
    super(
      `Could not read "${fileName}". The file may have changed or moved since it was selected. Please select it again.`,
    );
    this.name = "UnreadableFileError";
  }
}

export type UploadFileToSignURLInput = {
  signURL: string;
  contentType: string;
  file: Blob;
  onProgress?: (percent: number, event: ProgressEvent) => void;
  maxAttempts?: number;
  createXhr?: () => XMLHttpRequest;
  delay?: (ms: number) => Promise<void>;
};

const defaultDelay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function attemptUpload(
  input: UploadFileToSignURLInput,
): Promise<{ message: "success" }> {
  return new Promise((resolve, reject) => {
    const xhr = input.createXhr ? input.createXhr() : new XMLHttpRequest();
    xhr.open("PUT", input.signURL, true);
    xhr.setRequestHeader("Content-Type", input.contentType);

    if (input.onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          input.onProgress!(percentComplete, event);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ message: "success" });
      } else {
        reject(new UploadHttpError(xhr.status, xhr.responseText ?? ""));
      }
    };

    xhr.onerror = () => reject(new UploadNetworkError(1));
    xhr.ontimeout = () => reject(new UploadNetworkError(1));

    xhr.send(input.file);
  });
}

export async function uploadFileToSignURL(
  input: UploadFileToSignURLInput,
): Promise<{ message: "success" }> {
  const maxAttempts = input.maxAttempts ?? 3;
  const delay = input.delay ?? defaultDelay;

  for (let attempt = 1; ; attempt++) {
    try {
      return await attemptUpload(input);
    } catch (error) {
      if (!(error instanceof UploadNetworkError)) {
        throw error;
      }
      if (attempt >= maxAttempts) {
        console.error(`Upload file fail after ${attempt} attempts`);
        throw new UploadNetworkError(attempt);
      }
      await delay(1000 * attempt);
    }
  }
}

/**
 * Android Chrome backs picked files with content-provider URIs that can go
 * stale between selection and upload (the tab is backgrounded during the
 * picker, the provider syncs, ...), which aborts the request as a network
 * error. Copying the bytes into memory right after selection makes the
 * upload — and any retry — immune to that. Files above the cap are returned
 * as-is to avoid holding huge videos in memory.
 */
export const MAX_SNAPSHOT_BYTES = 100 * 1024 * 1024; // 100 MB

export async function snapshotFileForUpload(file: Blob): Promise<Blob> {
  if (file.size > MAX_SNAPSHOT_BYTES) {
    return file;
  }
  try {
    const buffer = await file.arrayBuffer();
    return new Blob([buffer], { type: file.type });
  } catch {
    const name = file instanceof File ? file.name : "file";
    throw new UnreadableFileError(name);
  }
}
