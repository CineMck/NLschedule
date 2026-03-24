"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { canApproveTimeOff } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function requestTimeOff(data: {
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (endDate < startDate) {
    return { success: false, error: "End date must be after start date" };
  }

  await db.timeOffRequest.create({
    data: {
      employeeId: session.user.id,
      organizationId: session.user.organizationId,
      startDate,
      endDate,
      reason: data.reason || null,
    },
  });

  revalidatePath("/time-off");
  return { success: true };
}

export async function approveTimeOff(
  requestId: string,
  note?: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

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
    return { success: false, error: "You don't have permission to approve time off" };
  }

  await db.timeOffRequest.update({
    where: {
      id: requestId,
      organizationId: session.user.organizationId,
      status: "PENDING",
    },
    data: {
      status: "APPROVED",
      reviewedById: session.user.id,
      reviewedAt: new Date(),
      reviewNote: note || null,
    },
  });

  revalidatePath("/time-off");
  return { success: true };
}

export async function rejectTimeOff(
  requestId: string,
  note?: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

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
    return { success: false, error: "You don't have permission to reject time off" };
  }

  await db.timeOffRequest.update({
    where: {
      id: requestId,
      organizationId: session.user.organizationId,
      status: "PENDING",
    },
    data: {
      status: "REJECTED",
      reviewedById: session.user.id,
      reviewedAt: new Date(),
      reviewNote: note || null,
    },
  });

  revalidatePath("/time-off");
  return { success: true };
}

export async function cancelTimeOff(requestId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  await db.timeOffRequest.update({
    where: {
      id: requestId,
      employeeId: session.user.id,
      status: "PENDING",
    },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/time-off");
  return { success: true };
}
