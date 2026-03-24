"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { canApproveSwaps } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function requestSwap(data: {
  requesterShiftId: string;
  recipientId: string;
  recipientShiftId?: string;
  reason?: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  // Verify the requester owns the shift
  const shift = await db.shift.findFirst({
    where: { id: data.requesterShiftId, employeeId: session.user.id },
  });
  if (!shift) return { success: false, error: "Shift not found or not yours" };

  await db.shiftSwapRequest.create({
    data: {
      requesterId: session.user.id,
      recipientId: data.recipientId,
      requesterShiftId: data.requesterShiftId,
      recipientShiftId: data.recipientShiftId || null,
      organizationId: session.user.organizationId,
      reason: data.reason || null,
    },
  });

  revalidatePath("/swaps");
  return { success: true };
}

export async function respondToSwap(
  swapId: string,
  accepted: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const swap = await db.shiftSwapRequest.findFirst({
    where: { id: swapId, recipientId: session.user.id, status: "PENDING" },
  });

  if (!swap) return { success: false, error: "Swap request not found" };

  await db.shiftSwapRequest.update({
    where: { id: swapId },
    data: { status: accepted ? "PENDING_APPROVAL" : "REJECTED" },
  });

  revalidatePath("/swaps");
  return { success: true };
}

export async function approveSwap(swapId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  if (!canApproveSwaps(session.user.role)) {
    return { success: false, error: "You don't have permission to approve swaps" };
  }

  const swap = await db.shiftSwapRequest.findFirst({
    where: {
      id: swapId,
      organizationId: session.user.organizationId,
      status: "PENDING_APPROVAL",
    },
    include: { requesterShift: true, recipientShift: true },
  });

  if (!swap) return { success: false, error: "Swap request not found" };

  // Perform the swap
  const updates = [
    db.shift.update({
      where: { id: swap.requesterShiftId },
      data: { employeeId: swap.recipientId },
    }),
  ];

  if (swap.recipientShiftId) {
    updates.push(
      db.shift.update({
        where: { id: swap.recipientShiftId },
        data: { employeeId: swap.requesterId },
      })
    );
  }

  await db.$transaction([
    ...updates,
    db.shiftSwapRequest.update({
      where: { id: swapId },
      data: {
        status: "APPROVED",
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    }),
  ]);

  revalidatePath("/swaps");
  revalidatePath("/schedule");
  return { success: true };
}

export async function rejectSwap(swapId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  if (!canApproveSwaps(session.user.role)) {
    return { success: false, error: "You don't have permission to reject swaps" };
  }

  await db.shiftSwapRequest.update({
    where: {
      id: swapId,
      organizationId: session.user.organizationId,
    },
    data: {
      status: "REJECTED",
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/swaps");
  return { success: true };
}
