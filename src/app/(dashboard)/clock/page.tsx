import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getCurrentClockStatus, getClockHistory } from "@/server/queries/clock";
import { startOfWeek } from "date-fns";
import { ClockButton } from "./_components/clock-button";
import { ClockHistory } from "./_components/clock-history";

export default async function ClockPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [currentStatus, history] = await Promise.all([
    getCurrentClockStatus(session.user.id),
    getClockHistory(session.user.id, startOfWeek(new Date(), { weekStartsOn: 0 })),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Clock In / Out</h1>
      <ClockButton
        isClockedIn={!!currentStatus}
        clockInTime={currentStatus?.clockIn ? currentStatus.clockIn.toISOString() : null}
      />
      <ClockHistory entries={JSON.parse(JSON.stringify(history))} />
    </div>
  );
}
