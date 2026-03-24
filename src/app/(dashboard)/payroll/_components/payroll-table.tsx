"use client";

import { formatCurrency } from "@/lib/utils";
import type { PayrollEntry } from "@/server/queries/payroll";

export function PayrollTable({ entries }: { entries: PayrollEntry[] }) {
  const totalCost = entries.reduce((sum, e) => sum + e.weeklyCost, 0);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
        No employees to display
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Employee
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Pay Type
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Hours
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Rate
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Weekly Cost
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <tr key={entry.userId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {entry.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {entry.payType === "HOURLY"
                    ? "Hourly"
                    : entry.payType === "SALARY"
                      ? "Salary"
                      : "Not set"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {entry.hoursWorked.toFixed(1)}h
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {entry.payType === "HOURLY"
                    ? `${formatCurrency(entry.rate)}/hr`
                    : entry.payType === "SALARY"
                      ? `${formatCurrency(entry.rate)}/yr`
                      : "-"}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(entry.weeklyCost)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr>
              <td
                colSpan={4}
                className="px-4 py-3 text-sm font-semibold text-gray-900"
              >
                Total
              </td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                {formatCurrency(totalCost)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
