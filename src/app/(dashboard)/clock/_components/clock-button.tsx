"use client";

import { clockIn, clockOut } from "@/server/actions/clock";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function ClockButton({
  isClockedIn,
  clockInTime,
}: {
  isClockedIn: boolean;
  clockInTime: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isClockedIn || !clockInTime) return;

    function updateElapsed() {
      const start = new Date(clockInTime!).getTime();
      const diff = Date.now() - start;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  async function handleClick() {
    setLoading(true);
    setError("");

    const result = isClockedIn ? await clockOut() : await clockIn();

    if (!result.success) {
      setError(result.error || "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {isClockedIn && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Time elapsed</p>
          <p className="text-4xl font-mono font-bold text-gray-900">
            {elapsed}
          </p>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-2xl transition-all ${
          isClockedIn
            ? "bg-red-500 hover:bg-red-600 text-white shadow-red-200"
            : "bg-green-500 hover:bg-green-600 text-white shadow-green-200"
        } shadow-lg disabled:opacity-50`}
      >
        <Clock className="w-6 h-6" />
        {loading
          ? "Processing..."
          : isClockedIn
            ? "Clock Out"
            : "Clock In"}
      </button>

      {!isClockedIn && (
        <p className="text-sm text-gray-400 mt-4">
          You are not currently clocked in
        </p>
      )}
    </div>
  );
}
