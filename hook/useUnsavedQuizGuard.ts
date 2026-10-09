import { useRouter } from "next/router";
import React from "react";
import Swal from "sweetalert2";
import { quizLanguage } from "../data/languages";
import { Language } from "../interfaces";

const ABORT_MESSAGE =
  "Route change aborted by useUnsavedQuizGuard (safe to ignore)";

const pathOf = (url: string) => url.split(/[?#]/)[0];

/**
 * Leaving the quiz editor (link, Back, browser back/forward) while question
 * cards are unsaved: save every valid card first, and only ask the teacher
 * when something still can't be saved. Closing or reloading the tab shows
 * the browser's own prompt.
 */
export default function useUnsavedQuizGuard({
  enabled,
  saveAll,
  language,
}: {
  enabled: boolean;
  /** Saves every card now; resolves with how many still are not saved. */
  saveAll: () => Promise<number>;
  language: Language;
}): {
  allowNextNavigation: () => void;
  /** Leave to `url` the same way (save first, warn if needed) without a cancelled navigation. */
  requestLeave: (url: string) => void;
} {
  const router = useRouter();
  const bypassRef = React.useRef(false);
  const busyRef = React.useRef(false);
  const requestLeaveRef = React.useRef<((url: string) => Promise<void>) | null>(
    null,
  );
  // The routeChangeStart handler is registered once and reads the latest props.
  const enabledRef = React.useRef(enabled);
  const saveAllRef = React.useRef(saveAll);
  const languageRef = React.useRef(language);
  enabledRef.current = enabled;
  saveAllRef.current = saveAll;
  languageRef.current = language;

  React.useEffect(() => {
    const leave = (url: string) => {
      bypassRef.current = true;
      router.push(url).finally(() => {
        bypassRef.current = false;
      });
    };

    const trySaveThenLeave = async (url: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        const remaining = await saveAllRef.current();
        if (remaining === 0) return leave(url);
        const lang = languageRef.current;
        const answer = await Swal.fire({
          icon: "warning",
          title: quizLanguage.unsavedCount(lang, remaining),
          text: quizLanguage.unsavedFixText(lang),
          showCancelButton: true,
          focusCancel: true,
          confirmButtonText: quizLanguage.leaveAnyway(lang),
          cancelButtonText: quizLanguage.keepEditing(lang),
        });
        if (answer.isConfirmed) leave(url);
      } finally {
        busyRef.current = false;
      }
    };

    requestLeaveRef.current = trySaveThenLeave;

    // Fallback for browser back/forward and links the page does not intercept.
    const handleRouteChangeStart = (url: string) => {
      if (!enabledRef.current || bypassRef.current) return;
      // Tab switches only change the query; the page handles those itself.
      if (pathOf(router.asPath) === pathOf(url)) return;
      router.events.emit("routeChangeError");
      void trySaveThenLeave(url);
      // Throwing inside routeChangeStart is the Pages Router idiom to cancel
      // a navigation; Next.js reports it as a routeChangeError.
      throw ABORT_MESSAGE;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => router.events.off("routeChangeStart", handleRouteChangeStart);
  }, [router]);

  React.useEffect(() => {
    if (!enabled) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled]);

  return {
    requestLeave: (url: string) => {
      if (!enabledRef.current) {
        void router.push(url);
        return;
      }
      void requestLeaveRef.current?.(url);
    },
    allowNextNavigation: () => {
      bypassRef.current = true;
      setTimeout(() => {
        bypassRef.current = false;
      }, 3000);
    },
  };
}
