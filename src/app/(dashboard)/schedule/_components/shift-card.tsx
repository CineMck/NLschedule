"use client";

import { format } from "date-fns";
import { Repeat } from "lucide-react";

type Shift = {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string;
  employee: { id: string; name: string } | null;
  isRecurring: boolean;
};

export function ShiftCard({
  shift,
  colorClass,
  onClick,
  canManage,
}: {
  shift: Shift;
  colorClass: string;
  onClick: () => void;
  canManage: boolean;
}) {
  const start = new Date(shift.startTime);
  const end = new Date(shift.endTime);

  return (
    <div
      onClick={onClick}
      className={`px-2 py-1.5 rounded border text-xs ${colorClass} ${
        canManage ? "cursor-pointer hover:opacity-80" : ""
      } transition-opacity`}
    >
      <div className="flex items-center gap-1">
        <span className="font-medium truncate">
          {shift.employee?.name || "Unassigned"}
        </span>
        {shift.isRecurring && <Repeat className="w-3 h-3 flex-shrink-0" />}
      </div>
      {shift.title && (
        <p className="truncate opacity-75">{shift.title}</p>
      )}
      <p className="opacity-75">
        {format(start, "h:mma")} - {format(end, "h:mma")}
      </p>
    </div>
  );
}
