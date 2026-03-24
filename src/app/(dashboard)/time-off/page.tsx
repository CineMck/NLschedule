import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getMyTimeOffRequests } from "@/server/queries/time-off";
import { TimeOffForm } from "./_components/time-off-form";
import { RequestCard } from "./_components/request-card";
import Link from "next/link";
import { canApproveTimeOff } from "@/lib/permissions";
import { db } from "@/server/db";

export default async function TimeOffPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const requests = await getMyTimeOffRequests(session.user.id);

  const delegations = await db.managerDelegation.findMany({
    where: { managerId: session.user.id },
    select: { permission: true },
  });

  const canReview = canApproveTimeOff(
    session.user.role,
    delegations.map((d) => d.permission)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Time Off</h1>
        <div className="flex gap-2">
          {canReview && (
            <Link
              href="/time-off/requests"
              className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              Review Requests
            </Link>
          )}
        </div>
      </div>

      <TimeOffForm />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">My Requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500 bg-white rounded-xl border border-gray-200 p-6 text-center">
            No time off requests yet
          </p>
        ) : (
          requests.map((req) => (
            <RequestCard
              key={req.id}
              request={JSON.parse(JSON.stringify(req))}
              showActions={true}
            />
          ))
        )}
      </div>
    </div>
  );
}
