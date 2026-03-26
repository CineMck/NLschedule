"use client";

import { useWeekNavigation } from "@/hooks/use-week-navigation";
import { addDays, format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Copy, LayoutTemplate } from "lucide-react";
import { ShiftCard } from "./shift-card";
import { ShiftFormDialog } from "./shift-form-dialog";
import { TemplateDialog } from "./template-dialog";
import { copyLastWeekSchedule } from "@/server/actions/shifts";
import { useState } from "react";

type Shift = {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string;
  employeeId: string | null;
  isRecurring: boolean;
  recurrenceGroupId: string | null;
  notes: string | null;
  employee: { id: string; name: string } | null;
};

type Employee = {
  id: string;
  name: string;
  role: string;
};

type TimeOffRequest = {
  id: string;
  startDate: string;
  endDate: string;
  employee: { id: string; name: string };
};

type Template = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: { name: string };
  _count: { shifts: number };
};

export function WeekView({
  shifts,
  employees,
  canManage,
  currentUserId,
  timeOffRequests = [],
  templates = [],
}: {
  shifts: Shift[];
  employees: Employee[];
  canManage: boolean;
  currentUserId: string;
  timeOffRequests?: TimeOffRequest[];
  templates?: Template[];
}) {
  const { weekStart, goToPreviousWeek, goToNextWeek, goToToday } =
    useWeekNavigation();
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [copying, setCopying] = useState(false);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  function getShiftsForDay(day: Date) {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.startTime);
      return isSameDay(shiftDate, day);
    });
  }

  function getTimeOffForDay(day: Date) {
    return timeOffRequests.filter((req) => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      return day >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             day <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });
  }

  const COLORS = [
    "bg-blue-100 border-blue-300 text-blue-800",
    "bg-green-100 border-green-300 text-green-800",
    "bg-purple-100 border-purple-300 text-purple-800",
    "bg-orange-100 border-orange-300 text-orange-800",
    "bg-pink-100 border-pink-300 text-pink-800",
    "bg-teal-100 border-teal-300 text-teal-800",
    "bg-indigo-100 border-indigo-300 text-indigo-800",
    "bg-yellow-100 border-yellow-300 text-yellow-800",
  ];

  const employeeColors = new Map<string, string>();
  const uniqueEmployees = [...new Set(shifts.map((s) => s.employeeId).filter(Boolean))];
  uniqueEmployees.forEach((id, i) => {
    if (id) employeeColors.set(id, COLORS[i % COLORS.length]);
  });

  return (
    <div>
      {/* Week navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-lg hover:bg-gray-100 border border-gray-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-gray-100 border border-gray-200"
          >
            Today
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-lg hover:bg-gray-100 border border-gray-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="ml-2 text-sm font-medium text-gray-700">
            {format(weekStart, "MMM d")} -{" "}
            {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setCopying(true);
                await copyLastWeekSchedule(format(weekStart, "yyyy-MM-dd"));
                setCopying(false);
              }}
              disabled={copying}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              {copying ? "Copying..." : "Copy Last Week"}
            </button>
            <button
              onClick={() => setShowTemplateDialog(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <LayoutTemplate className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={() => {
                setEditingShift(null);
                setSelectedDate(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Shift
            </button>
          </div>
        )}
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {days.map((day) => {
          const dayShifts = getShiftsForDay(day);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={day.toISOString()}
              className={`bg-white rounded-lg border ${
                isToday ? "border-primary-300 ring-1 ring-primary-200" : "border-gray-200"
              } min-h-[120px]`}
            >
              <div
                className={`px-3 py-2 border-b text-center ${
                  isToday
                    ? "bg-primary-50 border-primary-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p className="text-xs text-gray-500 uppercase">
                  {format(day, "EEE")}
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isToday ? "text-primary-700" : "text-gray-900"
                  }`}
                >
                  {format(day, "d")}
                </p>
              </div>

              <div className="p-2 space-y-1.5">
                {getTimeOffForDay(day).map((req) => (
                  <div
                    key={`to-${req.id}`}
                    className="px-2 py-1.5 rounded border bg-red-50 border-red-200 text-red-700"
                  >
                    <p className="text-xs font-medium">{req.employee.name}</p>
                    <p className="text-[10px]">Time Off</p>
                  </div>
                ))}
                {dayShifts.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    colorClass={
                      shift.employeeId
                        ? employeeColors.get(shift.employeeId) || COLORS[0]
                        : "bg-gray-100 border-gray-300 text-gray-600"
                    }
                    onClick={() => {
                      if (canManage) {
                        setEditingShift(shift);
                        setShowForm(true);
                      }
                    }}
                    canManage={canManage}
                  />
                ))}

                {canManage && (
                  <button
                    onClick={() => {
                      setEditingShift(null);
                      setSelectedDate(day);
                      setShowForm(true);
                    }}
                    className="w-full py-1 text-xs text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                  >
                    + Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <ShiftFormDialog
          employees={employees}
          shift={editingShift}
          defaultDate={selectedDate}
          onClose={() => {
            setShowForm(false);
            setEditingShift(null);
            setSelectedDate(null);
          }}
        />
      )}

      {showTemplateDialog && (
        <TemplateDialog
          templates={templates}
          weekStartISO={format(weekStart, "yyyy-MM-dd")}
          onClose={() => setShowTemplateDialog(false)}
        />
      )}
    </div>
  );
}
