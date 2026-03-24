"use client";

import { formatCurrency } from "@/lib/utils";
import { DollarSign, Users, Clock } from "lucide-react";
import type { PayrollEntry } from "@/server/queries/payroll";

export function CostSummary({
  entries,
  totalCost,
}: {
  entries: PayrollEntry[];
  totalCost: number;
}) {
  const hourlyCount = entries.filter((e) => e.payType === "HOURLY").length;
  const salaryCount = entries.filter((e) => e.payType === "SALARY").length;
  const totalHours = entries.reduce((sum, e) => sum + e.hoursWorked, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <DollarSign className="w-4 h-4" />
          <span className="text-xs font-medium uppercase">Weekly Cost</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(totalCost)}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-medium uppercase">Total Hours</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {totalHours.toFixed(1)}h
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Users className="w-4 h-4" />
          <span className="text-xs font-medium uppercase">Hourly</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{hourlyCount}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Users className="w-4 h-4" />
          <span className="text-xs font-medium uppercase">Salaried</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{salaryCount}</p>
      </div>
    </div>
  );
}
