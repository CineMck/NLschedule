import { db } from "@/server/db";

export async function getMyTimeOffRequests(userId: string) {
  return db.timeOffRequest.findMany({
    where: { employeeId: userId },
    include: {
      reviewedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingTimeOffRequests(organizationId: string) {
  return db.timeOffRequest.findMany({
    where: { organizationId, status: "PENDING" },
    include: {
      employee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getApprovedTimeOffForWeek(
  organizationId: string,
  weekStart: Date
) {
  const { startOfWeek, endOfWeek } = await import("date-fns");
  const start = startOfWeek(weekStart, { weekStartsOn: 0 });
  const end = endOfWeek(weekStart, { weekStartsOn: 0 });

  return db.timeOffRequest.findMany({
    where: {
      organizationId,
      status: "APPROVED",
      startDate: { lte: end },
      endDate: { gte: start },
    },
    include: {
      employee: { select: { id: true, name: true } },
    },
  });
}

export async function getAllTimeOffRequests(organizationId: string) {
  return db.timeOffRequest.findMany({
    where: { organizationId },
    include: {
      employee: { select: { name: true } },
      reviewedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
