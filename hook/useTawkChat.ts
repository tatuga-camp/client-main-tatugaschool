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
let loggedInUserId: string | null = null;
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

// Tawk sets the hash at slightly different moments depending on how the chat
// was maximized (menu, bubble click, mobile), and pushState-based sets fire no
// hashchange event — a single check misses it in production builds. Sweep for
// a short window after each maximize instead.
let stripSweepTimers: number[] = [];
function sweepTawkHash() {
  stripSweepTimers.forEach((timer) => clearTimeout(timer));
  stripSweepTimers = [0, 150, 400, 800, 1500, 2500].map((ms) =>
    window.setTimeout(stripTawkHash, ms),
  );
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
  window.Tawk_API.onChatMaximized = sweepTawkHash;
  // Catch location.hash-style sets too, whenever they fire.
  // (Duplicate adds of the same function reference are no-ops.)
  window.addEventListener("hashchange", stripTawkHash);
  window.Tawk_API.onLoad = () => {
    // Immediate dashboard identity for this session. NOTE: these anonymous
    // calls require Secure Mode to be DISABLED on the Tawk property — with
    // it enabled they fail with UNAUTHORIZED_API_CALL (identity would then
    // have to come solely from the login effect below).
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
  // "idle" or "error" (retry re-injects the script)
  load(user, schoolId);
}

export default function useTawkChat(params: {
  user: User | undefined;
  schoolId?: string;
  login?: { userId: string; hash: string };
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
    // if (window.origin.includes("localhost:")) return;
    if (status === "idle") {
      load(params.user, params.schoolId);
    }
  }, [params.user, params.schoolId]);

  // Log the visitor into Tawk so the same account gets the same conversation
  // across sessions/devices (onLoad's setAttributes only labels the current
  // browser session). Runs once per userId after the widget is ready. login
  // reconnects the session, so attributes/tags are re-applied afterwards to
  // keep the dashboard identity on the logged-in visitor too.
  useEffect(() => {
    if (currentStatus !== "ready") return;
    if (!params.user || !params.login) return;
    if (loggedInUserId === params.login.userId) return;
    loggedInUserId = params.login.userId;
    const user = params.user;
    const schoolId = params.schoolId;
    window.Tawk_API.login(
      {
        hash: params.login.hash,
        userId: params.login.userId,
        name: {
          first: user.firstName,
          last: user.lastName,
        },
        email: user.email,
      },
      (error) => {
        if (error) {
          console.error("Tawk login error:", error);
          return;
        }
        window.Tawk_API.setAttributes(
          {
            userid: user.id,
            phone: user.phone,
            provider: user.provider,
          },
          (attrError) => {
            if (attrError)
              console.error("Tawk setAttributes Error:", attrError);
          },
        );
        if (schoolId) {
          window.Tawk_API.addTags([`School: ${schoolId}`], (tagError) => {
            if (tagError) console.error("Tawk tag error:", tagError);
          });
        }
      },
    );
  }, [currentStatus, params.user, params.login, params.schoolId]);

  const openChat = useCallback(() => {
    if (!params.user) return;
    open(params.user, params.schoolId);
  }, [params.user, params.schoolId]);

  return { openChat, status: currentStatus };
}
