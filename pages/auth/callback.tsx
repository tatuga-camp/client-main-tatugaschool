import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { setAccessToken, setRefreshToken } from "../../utils";

// Landing page for provider sign-in (Google). The server cannot set cookies on
// this origin when it runs on another host, so it hands the tokens over in the
// URL fragment. We store them as our own cookies, scrub the fragment from the
// address bar and history, then continue to where the user was headed.

const WAIT_VERIFY_PATH = "/auth/wait-verify-email";

// Only allow same-origin paths so the fragment cannot be used as an open redirect.
function safePath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

function AuthCallback() {
  const router = useRouter();
  // The effect scrubs the hash it reads, so a second run (React Strict Mode
  // re-runs effects in development) would see no tokens and bounce to
  // sign-in. Handle the hand-off exactly once per mount.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      router.replace("/auth/sign-in");
      return;
    }

    setAccessToken({ access_token: accessToken });
    setRefreshToken({ refresh_token: refreshToken });
    window.history.replaceState(null, "", window.location.pathname);

    const next = safePath(params.get("next")) ?? "/";
    if (next === WAIT_VERIFY_PATH) {
      router.replace(next);
      return;
    }

    // Same priority as the password flow: a stashed returnUrl wins over the
    // server's default destination.
    const returnUrl = safePath(localStorage.getItem("returnUrl"));
    localStorage.removeItem("returnUrl");
    router.replace(returnUrl ?? next);
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-background-color font-Anuphan">
      <LoadingSpinner />
    </div>
  );
}

export default AuthCallback;
