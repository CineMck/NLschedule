"use client";

import { format, differenceInMinutes } from "date-fns";
import { formatDuration } from "@/lib/utils";

type ClockEntry = {
  id: string;
  clockIn: string;
  clockOut: string | null;
  shift: { title: string | null } | null;
};

export function ClockHistory({ entries }: { entries: ClockEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
        No clock entries this week
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">This Week</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                In
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                Out
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                Duration
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                Shift
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => {
              const clockIn = new Date(entry.clockIn);
              const clockOut = entry.clockOut
                ? new Date(entry.clockOut)
                : null;
              const duration = clockOut
                ? differenceInMinutes(clockOut, clockIn)
                : null;

              return (
                <tr key={entry.id}>
                  <td className="px-4 py-2.5 text-sm text-gray-900">
                    {format(clockIn, "EEE, MMM d")}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">
                    {format(clockIn, "h:mm a")}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">
                    {clockOut ? format(clockOut, "h:mm a") : (
                      <span className="text-green-600 font-medium">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">
                    {duration !== null ? formatDuration(duration) : "-"}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-400 hidden sm:table-cell">
                    {entry.shift?.title || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
