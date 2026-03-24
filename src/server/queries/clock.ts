import { db } from "@/server/db";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

export async function getCurrentClockStatus(userId: string) {
  return db.clockEntry.findFirst({
    where: { employeeId: userId, clockOut: null },
    include: { shift: { select: { title: true, startTime: true, endTime: true } } },
  });
}

export async function getClockHistory(userId: string, weekStart: Date) {
  const start = startOfWeek(weekStart, { weekStartsOn: 0 });
  const end = addDays(endOfWeek(weekStart, { weekStartsOn: 0 }), 1);

  return db.clockEntry.findMany({
    where: {
      employeeId: userId,
      clockIn: { gte: start, lt: end },
    },
    include: {
      shift: { select: { title: true } },
    },
    orderBy: { clockIn: "desc" },
  });
}
