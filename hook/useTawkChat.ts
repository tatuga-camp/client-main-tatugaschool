import { useCallback, useEffect, useSyncExternalStore } from "react";
import { User } from "../interfaces";

const TAWK_TO_PROPERTY_ID = "67dade5ac029cf190fdd8c17";
const TAWK_TO_WIDGET_ID = "1imnf9548";

export type TawkStatus = "idle" | "loading" | "ready" | "error";

// Tawk_API is a window-global singleton, so load state lives at module level
// and every hook instance observes the same store. The script loads on page
// visit (hidden) so Tawk's dashboard counts the visitor; the widget only
// becomes visible when the user asks for it.
let status: TawkStatus = "idle";
let pendingOpen = false;
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

// Tawk pushes a #max-widget URL hash when the chat maximizes (its back-button
// minimize hook). Strip it so the app URL stays clean: replaceState keeps the
// Next.js router's history state intact and fires no hashchange, so Tawk
// doesn't react to the cleanup.
function stripTawkHash() {
  if (window.location.hash === "#max-widget") {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );
  }
}

function load(user: User, schoolId?: string) {
  setStatus("loading");

  // Callback properties must exist before the embed script executes —
  // handlers assigned after load (e.g. inside onLoad) are not honored.
  window.Tawk_API = (window.Tawk_API || {}) as TawkAPIType;
  // Closing/minimizing the chat removes the bubble entirely; reopening is menu-only.
  window.Tawk_API.onChatMinimized = () => {
    window.Tawk_API.hideWidget();
  };
  // ...except when an admin replies while the widget is hidden: bring the
  // bubble back (with Tawk's unread indicator) so the user notices.
  window.Tawk_API.onChatMessageAgent = () => {
    window.Tawk_API.showWidget();
  };
  window.Tawk_API.onChatMaximized = stripTawkHash;
  // The hash can be set a moment after onChatMaximized fires; catch it too.
  // (Duplicate adds of the same function reference are no-ops.)
  window.addEventListener("hashchange", stripTawkHash);
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
    setStatus("ready");
    if (pendingOpen) {
      pendingOpen = false;
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
    } else {
      // Visitor stays tracked; only the UI is hidden until asked for.
      window.Tawk_API.hideWidget();
    }
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
  if (status === "ready") {
    window.Tawk_API.showWidget();
    window.Tawk_API.maximize();
    return;
  }
  pendingOpen = true;
  if (status === "loading") return; // will open in onLoad
  // "idle" (e.g. localhost, where auto-load is skipped) or "error" (retry)
  load(user, schoolId);
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

  // Load hidden on page visit so the visitor shows up in the Tawk dashboard.
  // Skipped on localhost to keep dev sessions out of visitor stats; an
  // explicit Chat Support click still loads it there.
  useEffect(() => {
    if (!params.user) return;
    if (window.origin.includes("localhost:")) return;
    if (status === "idle") {
      load(params.user, params.schoolId);
    }
  }, [params.user, params.schoolId]);

  const openChat = useCallback(() => {
    if (!params.user) return;
    open(params.user, params.schoolId);
  }, [params.user, params.schoolId]);

  return { openChat, status: currentStatus };
}
