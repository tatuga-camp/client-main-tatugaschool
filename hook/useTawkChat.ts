import { useCallback, useSyncExternalStore } from "react";
import { User } from "../interfaces";

const TAWK_TO_PROPERTY_ID = "67dade5ac029cf190fdd8c17";
const TAWK_TO_WIDGET_ID = "1imnf9548";

export type TawkStatus = "idle" | "loading" | "ready" | "error";

// Tawk_API is a window-global singleton, so load state lives at module level
// and every hook instance observes the same store.
let status: TawkStatus = "idle";
const listeners = new Set<() => void>();

function setStatus(next: TawkStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): TawkStatus {
  return status;
}

function getServerSnapshot(): TawkStatus {
  return "idle";
}

function loadAndOpen(user: User, schoolId?: string) {
  setStatus("loading");

  // Callback properties must exist before the embed script executes.
  window.Tawk_API = (window.Tawk_API || {}) as TawkAPIType;
  window.Tawk_API.onLoad = () => {
    window.Tawk_API.setAttributes(
      {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        userid: user.id,
        phone: user.phone,
        provider: user.provider,
      },
      (error) => {
        if (error) console.error("Tawk setAttributes Error:", error);
      },
    );
    if (schoolId) {
      window.Tawk_API.addTags([`School: ${schoolId}`], (error) => {
        if (error) console.error("Tawk tag error:", error);
      });
    }
    // Closing the chat removes the bubble entirely; reopening is menu-only.
    window.Tawk_API.onChatMinimized = () => {
      window.Tawk_API.hideWidget();
    };
    setStatus("ready");
    window.Tawk_API.showWidget();
    window.Tawk_API.maximize();
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://embed.tawk.to/${TAWK_TO_PROPERTY_ID}/${TAWK_TO_WIDGET_ID}`;
  script.charset = "UTF-8";
  script.setAttribute("crossorigin", "*");
  script.onerror = () => {
    script.remove();
    setStatus("error");
  };
  document.body.appendChild(script);
}

function open(user: User, schoolId?: string) {
  if (status === "loading") return;
  if (status === "ready") {
    window.Tawk_API.showWidget();
    window.Tawk_API.maximize();
    return;
  }
  // "idle" or "error" (retry re-injects the script)
  loadAndOpen(user, schoolId);
}

export default function useTawkChat(params: {
  user: User | undefined;
  schoolId?: string;
}) {
  const currentStatus = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const openChat = useCallback(() => {
    if (!params.user) return;
    open(params.user, params.schoolId);
  }, [params.user, params.schoolId]);

  return { openChat, status: currentStatus };
}
