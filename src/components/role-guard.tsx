"use client";

import type { Role } from "@prisma/client";

export function RoleGuard({
  role,
  allowed,
  children,
}: {
  role: Role;
  allowed: Role[];
  children: React.ReactNode;
}) {
  if (!allowed.includes(role)) return null;
  return <>{children}</>;
}
