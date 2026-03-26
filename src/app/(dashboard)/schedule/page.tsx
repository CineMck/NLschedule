import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getWeekShifts, getEmployeeWeekShifts, getTemplates } from "@/server/queries/shifts";
import { getActiveEmployees } from "@/server/queries/users";
import { getApprovedTimeOffForWeek } from "@/server/queries/time-off";
import { startOfWeek, parseISO } from "date-fns";
import { WeekView } from "./_components/week-view";
import { canManageSchedule } from "@/lib/permissions";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const weekStart = params.week
    ? startOfWeek(parseISO(params.week), { weekStartsOn: 0 })
    : startOfWeek(new Date(), { weekStartsOn: 0 });

  const isManager = canManageSchedule(session.user.role);

  const shifts = isManager
    ? await getWeekShifts(session.user.organizationId, weekStart)
    : await getEmployeeWeekShifts(session.user.id, weekStart);

  const [employees, timeOffRequests, templates] = await Promise.all([
    isManager
      ? getActiveEmployees(session.user.organizationId)
      : Promise.resolve([]),
    getApprovedTimeOffForWeek(session.user.organizationId, weekStart),
    isManager
      ? getTemplates(session.user.organizationId)
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
      <WeekView
        shifts={JSON.parse(JSON.stringify(shifts))}
        employees={employees}
        canManage={isManager}
        currentUserId={session.user.id}
        timeOffRequests={JSON.parse(JSON.stringify(timeOffRequests))}
        templates={JSON.parse(JSON.stringify(templates))}
      />
    </div>
  );
}
