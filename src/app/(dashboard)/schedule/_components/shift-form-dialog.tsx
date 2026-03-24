"use client";

import { createShift, updateShift, deleteShift } from "@/server/actions/shifts";
import { useState } from "react";
import { format } from "date-fns";
import { X, Trash2 } from "lucide-react";

type Employee = {
  id: string;
  name: string;
};

type Shift = {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string;
  employeeId: string | null;
  isRecurring: boolean;
  recurrenceGroupId: string | null;
  notes: string | null;
};

export function ShiftFormDialog({
  employees,
  shift,
  defaultDate,
  onClose,
}: {
  employees: Employee[];
  shift: Shift | null;
  defaultDate: Date | null;
  onClose: () => void;
}) {
  const isEditing = !!shift;

  const defaultDateStr = defaultDate
    ? format(defaultDate, "yyyy-MM-dd")
    : shift
      ? format(new Date(shift.startTime), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");

  const [employeeId, setEmployeeId] = useState(shift?.employeeId || "");
  const [title, setTitle] = useState(shift?.title || "");
  const [date, setDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState(
    shift ? format(new Date(shift.startTime), "HH:mm") : "09:00"
  );
  const [endTime, setEndTime] = useState(
    shift ? format(new Date(shift.endTime), "HH:mm") : "17:00"
  );
  const [notes, setNotes] = useState(shift?.notes || "");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceWeeks, setRecurrenceWeeks] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    let result;
    if (isEditing && shift) {
      result = await updateShift(shift.id, {
        employeeId: employeeId || null,
        title: title || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        notes,
      });
    } else {
      result = await createShift({
        employeeId: employeeId || undefined,
        title: title || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        isRecurring,
        recurrenceWeeks: isRecurring ? recurrenceWeeks : undefined,
        notes: notes || undefined,
      });
    }

    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Something went wrong");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!shift) return;
    if (!confirm("Delete this shift?")) return;

    setLoading(true);
    const result = await deleteShift(shift.id);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Failed to delete");
      setLoading(false);
    }
  }

  async function handleDeleteFuture() {
    if (!shift) return;
    if (!confirm("Delete this and all future recurring shifts?")) return;

    setLoading(true);
    const result = await deleteShift(shift.id, true);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Failed to delete");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Shift" : "Create Shift"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Unassigned</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift Label (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Morning Register"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Repeat weekly</span>
              </label>

              {isRecurring && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Repeat for how many weeks?
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={52}
                    value={recurrenceWeeks}
                    onChange={(e) => setRecurrenceWeeks(parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Shift"
                  : "Create Shift"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete shift"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {isEditing && shift?.isRecurring && shift?.recurrenceGroupId && (
            <button
              type="button"
              onClick={handleDeleteFuture}
              disabled={loading}
              className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete this and all future recurring shifts
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
