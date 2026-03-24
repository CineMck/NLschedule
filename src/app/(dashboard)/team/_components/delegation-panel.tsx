"use client";

import { grantPermission, revokePermission } from "@/server/actions/delegation";
import type { DelegatedPermission } from "@prisma/client";
import { useState } from "react";

type Manager = {
  id: string;
  name: string;
  email: string;
  delegationsReceived: { permission: DelegatedPermission }[];
};

const PERMISSION_LABELS: Record<DelegatedPermission, string> = {
  APPROVE_TIME_OFF: "Approve/Reject Time Off",
  INVITE_EMPLOYEES: "Invite Employees",
};

export function DelegationPanel({ managers }: { managers: Manager[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function togglePermission(
    managerId: string,
    permission: DelegatedPermission,
    hasPermission: boolean
  ) {
    const key = `${managerId}-${permission}`;
    setLoading(key);

    if (hasPermission) {
      await revokePermission(managerId, permission);
    } else {
      await grantPermission(managerId, permission);
    }

    setLoading(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Manager Permissions
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Delegate abilities to your managers
      </p>

      <div className="space-y-4">
        {managers.map((manager) => (
          <div
            key={manager.id}
            className="border border-gray-100 rounded-lg p-4"
          >
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">
                {manager.name}
              </p>
              <p className="text-xs text-gray-500">{manager.email}</p>
            </div>

            <div className="space-y-2">
              {(
                Object.keys(PERMISSION_LABELS) as DelegatedPermission[]
              ).map((permission) => {
                const hasPermission = manager.delegationsReceived.some(
                  (d) => d.permission === permission
                );
                const key = `${manager.id}-${permission}`;

                return (
                  <label
                    key={permission}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700">
                      {PERMISSION_LABELS[permission]}
                    </span>
                    <button
                      onClick={() =>
                        togglePermission(manager.id, permission, hasPermission)
                      }
                      disabled={loading === key}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        hasPermission ? "bg-primary-600" : "bg-gray-200"
                      } ${loading === key ? "opacity-50" : ""}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          hasPermission ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
