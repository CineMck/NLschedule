"use client";

import { requestSwap } from "@/server/actions/swaps";
import { format } from "date-fns";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

type Shift = {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string;
};

type Employee = {
  id: string;
  name: string;
};

export function SwapForm({
  myShifts,
  employees,
}: {
  myShifts: Shift[];
  employees: Employee[];
}) {
  const [shiftId, setShiftId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await requestSwap({
      requesterShiftId: shiftId,
      recipientId,
      reason: reason || undefined,
    });

    if (result.success) {
      setMessage({ type: "success", text: "Swap request sent!" });
      setShiftId("");
      setRecipientId("");
      setReason("");
    } else {
      setMessage({ type: "error", text: result.error || "Something went wrong" });
    }
    setLoading(false);
  }

  if (myShifts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
        No upcoming shifts to swap
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Request a Swap
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div
            className={`px-4 py-2 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Shift
          </label>
          <select
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a shift...</option>
            {myShifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {format(new Date(shift.startTime), "EEE, MMM d")} -{" "}
                {format(new Date(shift.startTime), "h:mm a")} to{" "}
                {format(new Date(shift.endTime), "h:mm a")}
                {shift.title ? ` (${shift.title})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Swap With
          </label>
          <select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a coworker...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason (optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Why do you need to swap?"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
          {loading ? "Sending..." : "Request Swap"}
        </button>
      </form>
    </div>
  );
}
