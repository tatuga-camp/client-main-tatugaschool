import { timeAgo } from "../../../utils/date";

/** "Just now" | "3 minutes ago" | "2 days ago". */
export function timeAgoLabel(iso: string): string {
  const relative = timeAgo({ pastTime: iso });
  return relative === "Just now" ? relative : `${relative} ago`;
}

export function absoluteLabel(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

/** Path + query of a URL, or the raw string when it is not a URL. */
export function pathOf(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

/** "Chrome · Android", "Safari · iOS", "LINE · iOS", "Unknown". */
export function browserLabel(userAgent: string): string {
  const ua = userAgent || "";
  const browser = /Line\//i.test(ua)
    ? "LINE"
    : /Edg\//.test(ua)
      ? "Edge"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Unknown";
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} · ${os}` : browser;
}
