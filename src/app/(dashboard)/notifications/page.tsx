import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getAllNotifications } from "@/server/queries/notifications";
import { NotificationList } from "./_components/notification-list";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await getAllNotifications(session.user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <NotificationList
        notifications={JSON.parse(JSON.stringify(notifications))}
      />
    </div>
  );
}
