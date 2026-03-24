"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function clockIn(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  // Check for open clock entry
  const openEntry = await db.clockEntry.findFirst({
    where: { employeeId: session.user.id, clockOut: null },
  });

  if (openEntry) {
    return { success: false, error: "You are already clocked in" };
  }

  const now = new Date();

  // Try to find a matching shift (within 15 min grace period)
  const graceMinutes = 15;
  const graceStart = new Date(now.getTime() - graceMinutes * 60 * 1000);
  const graceEnd = new Date(now.getTime() + graceMinutes * 60 * 1000);

  const matchingShift = await db.shift.findFirst({
    where: {
      employeeId: session.user.id,
      startTime: { gte: graceStart, lte: graceEnd },
    },
  });

  await db.clockEntry.create({
    data: {
      employeeId: session.user.id,
      organizationId: session.user.organizationId,
      clockIn: now,
      shiftId: matchingShift?.id || null,
    },
  });

  revalidatePath("/clock");
  return { success: true };
}

export async function clockOut(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const openEntry = await db.clockEntry.findFirst({
    where: { employeeId: session.user.id, clockOut: null },
  });

  if (!openEntry) {
    return { success: false, error: "You are not clocked in" };
  }

  await db.clockEntry.update({
    where: { id: openEntry.id },
    data: { clockOut: new Date() },
  });

  revalidatePath("/clock");
  return { success: true };
}
