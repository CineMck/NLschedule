import type { Role, DelegatedPermission } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
};

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type DelegationInfo = {
  managerId: string;
  permissions: DelegatedPermission[];
};
