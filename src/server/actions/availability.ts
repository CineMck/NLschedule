"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";
import type { DayOfWeek } from "@prisma/client";

type AvailabilityWindow = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export async function setAvailability(
  windows: AvailabilityWindow[]
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  await db.$transaction([
    db.availability.deleteMany({
      where: { employeeId: session.user.id },
    }),
    db.availability.createMany({
      data: windows.map((w) => ({
        employeeId: session.user.id,
        dayOfWeek: w.dayOfWeek,
        startTime: w.startTime,
        endTime: w.endTime,
        isAvailable: w.isAvailable,
      })),
    }),
  ]);

  revalidatePath("/availability");
  return { success: true };
}

export async function getMyAvailability() {
  const session = await auth();
  if (!session?.user) return [];

  return db.availability.findMany({
    where: { employeeId: session.user.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}
