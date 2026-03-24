import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getPendingTimeOffRequests } from "@/server/queries/time-off";
import { canApproveTimeOff } from "@/lib/permissions";
import { db } from "@/server/db";
import { RequestCard } from "../_components/request-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TimeOffRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const delegations = await db.managerDelegation.findMany({
    where: { managerId: session.user.id },
    select: { permission: true },
  });

  if (
    !canApproveTimeOff(
      session.user.role,
      delegations.map((d) => d.permission)
    )
  ) {
    redirect("/time-off");
  }

  const requests = await getPendingTimeOffRequests(
    session.user.organizationId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/time-off"
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Pending Time Off Requests
        </h1>
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-gray-500 bg-white rounded-xl border border-gray-200 p-6 text-center">
          No pending requests
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestCard
              key={req.id}
              request={JSON.parse(JSON.stringify(req))}
              showReviewActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
