import { db } from "@/server/db";
import { startOfWeek, endOfWeek, addDays, differenceInMinutes } from "date-fns";
import { Decimal } from "@prisma/client/runtime/library";

export type PayrollEntry = {
  userId: string;
  name: string;
  payType: "HOURLY" | "SALARY" | null;
  hoursWorked: number;
  rate: number;
  weeklyCost: number;
};

export async function getWeeklyPayroll(
  organizationId: string,
  weekStart: Date
): Promise<{ entries: PayrollEntry[]; totalCost: number }> {
  const start = startOfWeek(weekStart, { weekStartsOn: 0 });
  const end = addDays(endOfWeek(weekStart, { weekStartsOn: 0 }), 1);

  const employees = await db.user.findMany({
    where: { organizationId, isActive: true, role: { not: "OWNER" } },
    select: {
      id: true,
      name: true,
      payType: true,
      hourlyRate: true,
      annualSalary: true,
    },
  });

  const clockEntries = await db.clockEntry.findMany({
    where: {
      organizationId,
      clockIn: { gte: start, lt: end },
      clockOut: { not: null },
    },
  });

  const hoursMap = new Map<string, number>();
  for (const entry of clockEntries) {
    if (!entry.clockOut) continue;
    const minutes = differenceInMinutes(entry.clockOut, entry.clockIn);
    const current = hoursMap.get(entry.employeeId) || 0;
    hoursMap.set(entry.employeeId, current + minutes / 60);
  }

  const entries: PayrollEntry[] = employees.map((emp) => {
    const hoursWorked = Math.round((hoursMap.get(emp.id) || 0) * 100) / 100;
    let rate = 0;
    let weeklyCost = 0;

    if (emp.payType === "HOURLY" && emp.hourlyRate) {
      rate = new Decimal(emp.hourlyRate).toNumber();
      weeklyCost = Math.round(hoursWorked * rate * 100) / 100;
    } else if (emp.payType === "SALARY" && emp.annualSalary) {
      rate = new Decimal(emp.annualSalary).toNumber();
      weeklyCost = Math.round((rate / 52) * 100) / 100;
    }

    return {
      userId: emp.id,
      name: emp.name,
      payType: emp.payType,
      hoursWorked,
      rate,
      weeklyCost,
    };
  });

  const totalCost = Math.round(
    entries.reduce((sum, e) => sum + e.weeklyCost, 0) * 100
  ) / 100;

  return { entries, totalCost };
}
