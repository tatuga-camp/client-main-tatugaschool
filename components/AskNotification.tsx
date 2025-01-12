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
    return Notification.permission === "granted";
  };

  useEffect(() => {
    setIsNotification(isNotificationGranted());
  }, []);

  const requestNotificationPermission = async (): Promise<void> => {
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
        <PopupLayout onClose={() => {}}>
          <div className="w-96 h-96 font-Anuphan bg-white border rounded-md p-3 flex flex-col gap-2 items-center justify-center">
            <div className="w-10 h-10 relative">
              <Image
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                src="/favicon.ico"
                alt="logo"
              />
            </div>
            <h1 className="text-xl mt-5 font-semibold text-center">
              You don&apos;t want to miss any updates from us.
            </h1>
            <span className="text-sm text-gray-500">
              Please allow notification
            </span>
            <button
              disabled={loading}
              onClick={requestNotificationPermission}
              className="main-button w-60 rounded-full text-white px-4 py-1"
            >
              {loading ? "Loading..." : "Yes, Allow!"}
            </button>

            <button
              onClick={() => setIsNotification(true)}
              className="text-gray-500 text-xs mt-10 underline"
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
