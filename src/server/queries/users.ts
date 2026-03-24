import { db } from "@/server/db";

export async function getOrganizationMembers(organizationId: string) {
  return db.user.findMany({
    where: { organizationId },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      payType: true,
      hourlyRate: true,
      annualSalary: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function getActiveEmployees(organizationId: string) {
  return db.user.findMany({
    where: { organizationId, isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });
}

export async function getOrganizationInvitations(organizationId: string) {
  return db.invitation.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      invitedBy: { select: { name: true } },
    },
  });
}

export async function getManagersWithDelegations(organizationId: string) {
  return db.user.findMany({
    where: { organizationId, role: "MANAGER", isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      delegationsReceived: {
        select: { permission: true },
      },
    },
  });
}
