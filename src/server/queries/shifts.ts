import { db } from "@/server/db";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

export async function getWeekShifts(
  organizationId: string,
  weekStart: Date
) {
  const start = startOfWeek(weekStart, { weekStartsOn: 0 });
  const end = endOfWeek(weekStart, { weekStartsOn: 0 });

  return db.shift.findMany({
    where: {
      organizationId,
      startTime: { gte: start },
      endTime: { lte: addDays(end, 1) },
    },
    include: {
      employee: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getEmployeeWeekShifts(
  employeeId: string,
  weekStart: Date
) {
  const start = startOfWeek(weekStart, { weekStartsOn: 0 });
  const end = endOfWeek(weekStart, { weekStartsOn: 0 });

  return db.shift.findMany({
    where: {
      employeeId,
      startTime: { gte: start },
      endTime: { lte: addDays(end, 1) },
    },
    include: {
      employee: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
  });
}
