"use client";

import { setAvailability } from "@/server/actions/availability";
import { DAY_LABELS } from "@/lib/constants";
import { TIME_SLOTS } from "@/lib/constants";
import type { DayOfWeek } from "@prisma/client";
import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";

const DAYS: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

type AvailabilityEntry = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

type AvailabilityRecord = {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export function AvailabilityGrid({
  availability,
}: {
  availability: AvailabilityRecord[];
}) {
  const [entries, setEntries] = useState<AvailabilityEntry[]>(
    availability.length > 0
      ? availability.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          isAvailable: a.isAvailable,
        }))
      : DAYS.map((day) => ({
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        }))
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateEntry(
    index: number,
    field: keyof AvailabilityEntry,
    value: string | boolean
  ) {
    const updated = [...entries];
    (updated[index] as Record<string, unknown>)[field] = value;
    setEntries(updated);
    setSaved(false);
  }

  function addEntry(day: DayOfWeek) {
    setEntries([
      ...entries,
      { dayOfWeek: day, startTime: "09:00", endTime: "17:00", isAvailable: true },
    ]);
    setSaved(false);
  }

  function removeEntry(index: number) {
    setEntries(entries.filter((_, i) => i !== index));
    setSaved(false);
  }

  async function handleSave() {
    setLoading(true);
    await setAvailability(entries);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {DAYS.map((day, dayIndex) => {
          const dayEntries = entries
            .map((e, i) => ({ ...e, originalIndex: i }))
            .filter((e) => e.dayOfWeek === day);

          return (
            <div
              key={day}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {DAY_LABELS[dayIndex]}
                </h3>
                <button
                  onClick={() => addEntry(day)}
                  className="text-xs text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add window
                </button>
              </div>

              {dayEntries.length === 0 ? (
                <p className="text-xs text-gray-400">No availability set</p>
              ) : (
                <div className="space-y-2">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.originalIndex}
                      className="flex items-center gap-2 flex-wrap"
                    >
                      <select
                        value={entry.startTime}
                        onChange={(e) =>
                          updateEntry(entry.originalIndex, "startTime", e.target.value)
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-gray-400">to</span>
                      <select
                        value={entry.endTime}
                        onChange={(e) =>
                          updateEntry(entry.originalIndex, "endTime", e.target.value)
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={entry.isAvailable}
                          onChange={(e) =>
                            updateEntry(
                              entry.originalIndex,
                              "isAvailable",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-primary-600"
                        />
                        Available
                      </label>
                      <button
                        onClick={() => removeEntry(entry.originalIndex)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        <Save className="w-4 h-4" />
        {loading ? "Saving..." : saved ? "Saved!" : "Save Availability"}
      </button>
    </div>
  );
}
