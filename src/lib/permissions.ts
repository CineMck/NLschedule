import type { Role, DelegatedPermission } from "@prisma/client";

export function canManageSchedule(role: Role): boolean {
  return role === "OWNER" || role === "MANAGER";
}

export function canViewPayroll(role: Role): boolean {
  return role === "OWNER";
}

export function canApproveTimeOff(
  role: Role,
  delegations: DelegatedPermission[]
): boolean {
  return role === "OWNER" || delegations.includes("APPROVE_TIME_OFF");
}

export function canInviteEmployees(
  role: Role,
  delegations: DelegatedPermission[]
): boolean {
  return role === "OWNER" || delegations.includes("INVITE_EMPLOYEES");
}

export function canManageDelegation(role: Role): boolean {
  return role === "OWNER";
}

export function canManageTeam(role: Role): boolean {
  return role === "OWNER" || role === "MANAGER";
}

export function canApproveSwaps(role: Role): boolean {
  return role === "OWNER" || role === "MANAGER";
}
