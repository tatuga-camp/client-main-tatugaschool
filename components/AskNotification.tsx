import React, { useEffect } from "react";
import { registerServiceWorker } from "../utils/notifications";
import PopupLayout from "./layout/PopupLayout";
import Image from "next/image";
import { SubscribeToPushService } from "../services/push";

function AskNotification() {
  const [isNotification, setIsNotification] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  useEffect(() => {
    registerServiceWorker();
  }, []);

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
          <div className="flex h-96 w-96 flex-col items-center justify-center gap-2 rounded-2xl border bg-white p-3 font-Anuphan">
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
