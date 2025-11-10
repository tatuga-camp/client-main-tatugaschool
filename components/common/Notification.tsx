import React from "react";
import {
  useGetNotifications,
  useMarkAllAsReadNotifications,
  useMarkAsReadNotification,
} from "../../react-query";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs"; // Adjusted path
import { Notification as NotificationType } from "../../interfaces";
import { decodeBlurhashToCanvas, timeAgo } from "../../utils";
import { IoNotificationsOffOutline } from "react-icons/io5";
import { defaultBlurHash } from "../../data";
import { useRouter } from "next/router";
const typeMap: Record<string, string> = {
  STUDENT_SUBMISSION: "Submission",
  // Add other types here as needed
  DEFAULT: "Update",
};

type NotificationPanelProps = {
  onClose: () => void; // Function to close the panel
};

function Notification({ onClose }: NotificationPanelProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: notifications, isLoading, isError } = useGetNotifications();

  const markAsRead = useMarkAsReadNotification();
  const markAllAsRead = useMarkAllAsReadNotifications();

  const handleMarkAsRead = (id: string, link: string) => {
    if (!id) return;
    markAsRead.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          onClose();
        },
      },
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    });
  };

  return (
    <div className="fixed left-4 right-4 top-20 z-50 rounded-2xl border border-gray-200 bg-white shadow-xl md:left-auto md:right-5 md:w-full md:max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <button
          onClick={handleMarkAllAsRead}
          className="text-sm text-blue-600 hover:underline"
          disabled={markAllAsRead.isPending}
        >
          Mark all as read
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-[70vh] overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        )}
        {isError && (
          <div className="p-4 text-center text-red-500">
            Error loading notifications.
          </div>
        )}
        {!isLoading && !isError && notifications?.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <IoNotificationsOffOutline size={40} className="mb-2" />
            <span className="font-semibold">No new notifications</span>
            <span className="text-sm">You&apos;re all caught up.</span>
          </div>
        )}
        {!isLoading &&
          !isError &&
          notifications &&
          notifications.length > 0 && (
            <ul>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => {
                    handleMarkAsRead(notification.id, notification.link);
                    router.push(notification.link);
                  }}
                />
              ))}
            </ul>
          )}
      </div>
    </div>
  );
}
type NotificationItemProps = {
  notification: NotificationType;
  onMarkAsRead: () => void;
};

function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const ago = timeAgo({
    pastTime: new Date(notification.createAt).toISOString(),
  });
  const pageType = typeMap[notification.type] || typeMap.DEFAULT;

  return (
    <li
      className={`border-b border-gray-100 transition-colors duration-150 last:border-b-0 ${
        !notification.isRead
          ? "bg-cyan-50 hover:bg-cyan-100" // "BACKGROUND TINT"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <button
        onClick={onMarkAsRead}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        {/* Dot Cue & Avatar */}
        <div className="relative mt-1 shrink-0">
          {!notification.isRead && (
            <span className="absolute -left-1.5 top-1 h-2 w-2 rounded-full bg-blue-500"></span>
          )}
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src={notification.actorImage}
              alt={notification.actorName}
              fill
              sizes="40px"
              quality={50}
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(defaultBlurHash)}
              className="object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow">
          <p className="text-sm text-gray-800">
            <strong className="font-semibold text-gray-900">
              {notification.actorName}
            </strong>{" "}
            {notification.message}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {pageType} • {ago} ago
          </p>
        </div>
      </button>
    </li>
  );
}

export default Notification;
