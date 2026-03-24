"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";
import type { DelegatedPermission } from "@prisma/client";

export async function grantPermission(
  managerId: string,
  permission: DelegatedPermission
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return { success: false, error: "Only owners can grant permissions" };
  }

  const manager = await db.user.findFirst({
    where: {
      id: managerId,
      organizationId: session.user.organizationId,
      role: "MANAGER",
    },
  });

  if (!manager) {
    return { success: false, error: "Manager not found" };
  }

  await db.managerDelegation.upsert({
    where: { managerId_permission: { managerId, permission } },
    update: {},
    create: {
      managerId,
      permission,
      grantedById: session.user.id,
    },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function revokePermission(
  managerId: string,
  permission: DelegatedPermission
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return { success: false, error: "Only owners can revoke permissions" };
  }

  await db.managerDelegation.deleteMany({
    where: { managerId, permission },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function getManagerDelegations(managerId: string) {
  const delegations = await db.managerDelegation.findMany({
    where: { managerId },
    select: { permission: true },
  });
  return delegations.map((d) => d.permission);
}
