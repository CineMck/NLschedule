import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { canApproveSwaps } from "@/lib/permissions";
import { SwapList } from "./_components/swap-list";
import { SwapForm } from "./_components/swap-form";
import { getActiveEmployees } from "@/server/queries/users";

export default async function SwapsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isReviewer = canApproveSwaps(session.user.role);

  const swapRequests = await db.shiftSwapRequest.findMany({
    where: {
      organizationId: session.user.organizationId,
      OR: [
        { requesterId: session.user.id },
        { recipientId: session.user.id },
        ...(isReviewer ? [{ status: "PENDING_APPROVAL" as const }] : []),
      ],
    },
    include: {
      requester: { select: { name: true } },
      recipient: { select: { name: true } },
      requesterShift: {
        select: { title: true, startTime: true, endTime: true },
      },
      recipientShift: {
        select: { title: true, startTime: true, endTime: true },
      },
      reviewedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const myShifts = await db.shift.findMany({
    where: {
      employeeId: session.user.id,
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: "asc" },
    take: 20,
  });

  const employees = await getActiveEmployees(session.user.organizationId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Shift Swaps</h1>

      {session.user.role !== "OWNER" && (
        <SwapForm
          myShifts={JSON.parse(JSON.stringify(myShifts))}
          employees={employees.filter((e) => e.id !== session.user.id)}
        />
      )}

      <SwapList
        requests={JSON.parse(JSON.stringify(swapRequests))}
        currentUserId={session.user.id}
        isReviewer={isReviewer}
      />
    </div>
  );
}
