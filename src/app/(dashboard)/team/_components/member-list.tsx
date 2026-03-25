"use client";

import { ROLE_LABELS } from "@/lib/constants";
import { deactivateUser, reactivateUser, updateUserPayInfo, updateUserRole } from "@/server/actions/team";
import { useState } from "react";
import type { Role } from "@prisma/client";

type Member = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "MANAGER" | "EMPLOYEE";
  payType: "HOURLY" | "SALARY" | null;
  hourlyRate: number | null;
  annualSalary: number | null;
  isActive: boolean;
};

export function MemberList({
  members,
  currentUserId,
  userRole,
}: {
  members: Member[];
  currentUserId: string;
  userRole: "OWNER" | "MANAGER" | "EMPLOYEE";
}) {
  const [editingPay, setEditingPay] = useState<string | null>(null);
  const [payType, setPayType] = useState<"HOURLY" | "SALARY">("HOURLY");
  const [rate, setRate] = useState("");
  const [editingRole, setEditingRole] = useState<string | null>(null);

  async function handleRoleUpdate(userId: string, newRole: Role) {
    await updateUserRole(userId, newRole);
    setEditingRole(null);
  }

  async function handlePayUpdate(userId: string) {
    await updateUserPayInfo(userId, payType, parseFloat(rate));
    setEditingPay(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                Email
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              {userRole === "OWNER" && (
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                  Pay
                </th>
              )}
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              {userRole === "OWNER" && (
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {member.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                  {member.email}
                </td>
                <td className="px-4 py-3">
                  {userRole === "OWNER" && member.id !== currentUserId && editingRole === member.id ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleUpdate(member.id, e.target.value as Role)}
                      onBlur={() => setEditingRole(null)}
                      autoFocus
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="OWNER">Owner</option>
                      <option value="MANAGER">Manager</option>
                      <option value="EMPLOYEE">Employee</option>
                    </select>
                  ) : (
                    <span
                      onClick={() => {
                        if (userRole === "OWNER" && member.id !== currentUserId) {
                          setEditingRole(member.id);
                        }
                      }}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 ${
                        userRole === "OWNER" && member.id !== currentUserId
                          ? "cursor-pointer hover:bg-primary-100"
                          : ""
                      }`}
                    >
                      {ROLE_LABELS[member.role]}
                    </span>
                  )}
                </td>
                {userRole === "OWNER" && (
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                    {editingPay === member.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={payType}
                          onChange={(e) => setPayType(e.target.value as "HOURLY" | "SALARY")}
                          className="text-xs border rounded px-1 py-0.5"
                        >
                          <option value="HOURLY">Hourly</option>
                          <option value="SALARY">Salary</option>
                        </select>
                        <input
                          type="number"
                          value={rate}
                          onChange={(e) => setRate(e.target.value)}
                          className="w-20 text-xs border rounded px-1 py-0.5"
                          placeholder={payType === "HOURLY" ? "$/hr" : "$/yr"}
                        />
                        <button
                          onClick={() => handlePayUpdate(member.id)}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPay(null)}
                          className="text-xs text-gray-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={() => {
                          if (member.id !== currentUserId) {
                            setEditingPay(member.id);
                            setPayType(member.payType || "HOURLY");
                            setRate(
                              member.hourlyRate
                                ? String(member.hourlyRate)
                                : member.annualSalary
                                  ? String(member.annualSalary)
                                  : ""
                            );
                          }
                        }}
                        className={
                          member.id !== currentUserId
                            ? "cursor-pointer hover:text-primary-600"
                            : ""
                        }
                      >
                        {member.payType === "HOURLY" && member.hourlyRate
                          ? `$${member.hourlyRate}/hr`
                          : member.payType === "SALARY" && member.annualSalary
                            ? `$${Number(member.annualSalary).toLocaleString()}/yr`
                            : "Not set"}
                      </span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      member.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                {userRole === "OWNER" && (
                  <td className="px-4 py-3 text-right">
                    {member.id !== currentUserId && (
                      <button
                        onClick={async () => {
                          if (member.isActive) {
                            await deactivateUser(member.id);
                          } else {
                            await reactivateUser(member.id);
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded ${
                          member.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {member.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
