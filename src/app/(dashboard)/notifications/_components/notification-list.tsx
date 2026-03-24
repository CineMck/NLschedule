"use client";

import { markAsRead, markAllAsRead } from "@/server/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import {
  Calendar,
  CalendarOff,
  ArrowLeftRight,
  UserPlus,
  Bell,
  CheckCheck,
} from "lucide-react";
import type { NotificationType } from "@prisma/client";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

const ICON_MAP: Record<NotificationType, React.ElementType> = {
  SCHEDULE_CHANGE: Calendar,
  TIME_OFF_DECISION: CalendarOff,
  SWAP_UPDATE: ArrowLeftRight,
  INVITE: UserPlus,
  SHIFT_REMINDER: Bell,
  DELEGATION_CHANGE: Bell,
};

export function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const hasUnread = notifications.some((n) => !n.isRead);

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        No notifications
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasUnread && (
        <div className="flex justify-end">
          <button
            onClick={() => markAllAsRead()}
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        </div>
      )}

      {notifications.map((notification) => {
        const Icon = ICON_MAP[notification.type] || Bell;

        return (
          <div
            key={notification.id}
            className={`bg-white rounded-lg border p-4 flex items-start gap-3 ${
              notification.isRead
                ? "border-gray-200"
                : "border-primary-200 bg-primary-50/30"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                notification.isRead ? "bg-gray-100" : "bg-primary-100"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  notification.isRead ? "text-gray-500" : "text-primary-600"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {!notification.isRead && (
              <button
                onClick={() => markAsRead(notification.id)}
                className="text-xs text-primary-600 hover:underline whitespace-nowrap"
              >
                Mark read
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
