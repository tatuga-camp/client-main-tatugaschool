import React, { useEffect } from "react";
import { registerServiceWorker } from "../utils/notifications";
import PopupLayout from "./layout/PopupLayout";
import Image from "next/image";
import { SubscribeToPushService } from "../services/push";
import { useGetUser } from "../react-query";

// Browsers can rotate or invalidate a PushSubscription, and the server
// self-deletes rows whose endpoint returns 410/404. Once permission is
// granted this popup never shows again, so we silently re-send the current
// subscription to the server on visits — at most once per day per user.
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

function shouldSyncPush(userId: string): boolean {
  try {
    const last = window.localStorage.getItem(`push-sync-at:${userId}`);
    return !last || Date.now() - Number(last) > SYNC_INTERVAL_MS;
  } catch {
    return true;
  }
}

function markPushSynced(userId: string): void {
  try {
    window.localStorage.setItem(`push-sync-at:${userId}`, String(Date.now()));
  } catch {
    // localStorage unavailable — sync will just run again next visit
  }
}

function AskNotification() {
  const user = useGetUser();
  const [isNotification, setIsNotification] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  useEffect(() => {
    registerServiceWorker();
  }, []);

  const userId = user.data?.id;
  useEffect(() => {
    if (!userId) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    if (!shouldSyncPush(userId)) return;

    SubscribeToPushService()
      .then(() => markPushSynced(userId))
      .catch((error) =>
        console.error("Push subscription re-sync failed:", error),
      );
  }, [userId]);

  const isNotificationGranted = (): boolean => {
    if (typeof Notification === "undefined") {
      return true;
    }
    return Notification.permission === "granted";
  };

  useEffect(() => {
    setIsNotification(isNotificationGranted());
  }, []);

  const requestNotificationPermission = async (): Promise<void> => {
    document.body.style.overflow = "auto";
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setLoading(true);
        await SubscribeToPushService();
        setLoading(false);
        alert("You granted the notification permission");
        setIsNotification(true);
      } else {
        alert("You denied the notification permission");
        setIsNotification(true);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };
  return (
    <>
      {isNotification ? null : (
        <PopupLayout
          onClose={() => {
            setIsNotification(true);
          }}
        >
          <div className="flex h-max max-h-[90dvh] w-full max-w-96 flex-col mx-4 md:mx-0 md:h-96 items-center justify-center gap-2 rounded-2xl border bg-white p-3 font-Anuphan">
            <div className="relative h-10 w-10">
              <Image
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                src="/favicon.ico"
                alt="logo"
              />
            </div>
            <h1 className="mt-5 text-center text-xl font-semibold">
              You don&apos;t want to miss any updates from us.
            </h1>
            <span className="text-sm text-gray-500">
              Please allow notification
            </span>
            <button
              disabled={loading}
              onClick={requestNotificationPermission}
              className="main-button w-60 rounded-full px-4 py-1 text-white"
            >
              {loading ? "Loading..." : "Yes, Allow!"}
            </button>

            <button
              onClick={() => {
                document.body.style.overflow = "auto";
                setIsNotification(true);
              }}
              className="mt-10 text-xs text-gray-500 underline"
            >
              Maybe Later
            </button>
          </div>
        </PopupLayout>
      )}
    </>
  );
}

export default AskNotification;
