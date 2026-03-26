"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { nanoid } from "nanoid";
import { canInviteEmployees } from "@/lib/permissions";
import { sendInviteEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";
import type { Role, PayType } from "@prisma/client";

async function getUserDelegations(userId: string) {
  const delegations = await db.managerDelegation.findMany({
    where: { managerId: userId },
    select: { permission: true },
  });
  return delegations.map((d) => d.permission);
}

export async function inviteUser(
  email: string,
  role: "OWNER" | "MANAGER" | "EMPLOYEE"
): Promise<ActionResult<{ inviteCode: string }>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  // Only owners can invite other owners or managers
  if ((role === "OWNER" || role === "MANAGER") && session.user.role !== "OWNER") {
    return { success: false, error: "Only owners can invite owners and managers" };
  }

  const delegations = await getUserDelegations(session.user.id);

  if (!canInviteEmployees(session.user.role, delegations)) {
    return { success: false, error: "You don't have permission to invite users" };
  }

  const inviteCode = nanoid(8);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await db.invitation.create({
    data: {
      email,
      role,
      inviteCode,
      organizationId: session.user.organizationId,
      invitedById: session.user.id,
      expiresAt,
    },
  });

  // Send invite email
  try {
    const organization = await db.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { name: true },
    });

    await sendInviteEmail({
      to: email,
      inviteCode,
      role,
      organizationName: organization?.name || "your organization",
      inviterName: session.user.name || "A team member",
    });
  } catch (emailError) {
    // Email sending failed but invitation was still created
    console.error("Failed to send invite email:", emailError);
  }

  revalidatePath("/team");
  return { success: true, data: { inviteCode } };
}

export async function deactivateUser(userId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return { success: false, error: "Only owners can deactivate users" };
  }

  if (userId === session.user.id) {
    return { success: false, error: "You cannot deactivate yourself" };
  }

  await db.user.update({
    where: { id: userId, organizationId: session.user.organizationId },
    data: { isActive: false },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function reactivateUser(userId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return { success: false, error: "Only owners can reactivate users" };
  }

  await db.user.update({
    where: { id: userId, organizationId: session.user.organizationId },
    data: { isActive: true },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function updateUserPayInfo(
  userId: string,
  payType: PayType,
  rate: number
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return { success: false, error: "Only owners can update pay info" };
  }

  await db.user.update({
    where: { id: userId, organizationId: session.user.organizationId },
    data: {
      payType,
      hourlyRate: payType === "HOURLY" ? rate : null,
      annualSalary: payType === "SALARY" ? rate : null,
    },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return { success: false, error: "Only owners can delete users" };
  }

  if (userId === session.user.id) {
    return { success: false, error: "You cannot delete yourself" };
  }

  // Delete all related records in a transaction
  await db.$transaction(async (tx) => {
    await tx.notification.deleteMany({ where: { userId } });
    await tx.availability.deleteMany({ where: { employeeId: userId } });
    await tx.clockEntry.deleteMany({ where: { employeeId: userId } });
    await tx.shiftSwapRequest.deleteMany({
      where: { OR: [{ requesterId: userId }, { recipientId: userId }, { reviewedById: userId }] },
    });
    await tx.timeOffRequest.deleteMany({
      where: { OR: [{ employeeId: userId }, { reviewedById: userId }] },
    });
    await tx.shift.updateMany({
      where: { employeeId: userId },
      data: { employeeId: null },
    });
    await tx.shift.deleteMany({ where: { createdById: userId } });
    await tx.managerDelegation.deleteMany({
      where: { OR: [{ managerId: userId }, { grantedById: userId }] },
    });
    await tx.invitation.deleteMany({ where: { invitedById: userId } });
    await tx.user.delete({ where: { id: userId, organizationId: session.user.organizationId } });
  });

  revalidatePath("/team");
  return { success: true };
}

export async function updateUserRole(
  userId: string,
  role: Role
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return { success: false, error: "Only owners can change roles" };
  }

  if (userId === session.user.id) {
    return { success: false, error: "You cannot change your own role" };
  }

  await db.user.update({
    where: { id: userId, organizationId: session.user.organizationId },
    data: { role },
  });

  revalidatePath("/team");
  return { success: true };
}
