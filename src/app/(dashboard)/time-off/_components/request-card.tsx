"use client";

import { cancelTimeOff, approveTimeOff, rejectTimeOff } from "@/server/actions/time-off";
import { format } from "date-fns";
import { TIME_OFF_STATUS_COLORS } from "@/lib/constants";
import type { TimeOffStatus } from "@prisma/client";
import { useState } from "react";

type TimeOffRequest = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: TimeOffStatus;
  reviewedBy: { name: string } | null;
  reviewNote: string | null;
  employee?: { name: string; email: string };
};

export function RequestCard({
  request,
  showActions,
  showReviewActions,
}: {
  request: TimeOffRequest;
  showActions?: boolean;
  showReviewActions?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    await cancelTimeOff(request.id);
    setLoading(false);
  }

  async function handleApprove() {
    setLoading(true);
    await approveTimeOff(request.id);
    setLoading(false);
  }

  async function handleReject() {
    setLoading(true);
    await rejectTimeOff(request.id);
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {request.employee && (
            <p className="text-sm font-medium text-gray-900 mb-1">
              {request.employee.name}
            </p>
          )}
          <p className="text-sm text-gray-700">
            {format(new Date(request.startDate), "MMM d, yyyy")} -{" "}
            {format(new Date(request.endDate), "MMM d, yyyy")}
          </p>
          {request.reason && (
            <p className="text-sm text-gray-500 mt-1">{request.reason}</p>
          )}
          {request.reviewedBy && (
            <p className="text-xs text-gray-400 mt-1">
              Reviewed by {request.reviewedBy.name}
              {request.reviewNote && `: ${request.reviewNote}`}
            </p>
          )}
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            TIME_OFF_STATUS_COLORS[request.status]
          }`}
        >
          {request.status}
        </span>
      </div>

      {showActions && request.status === "PENDING" && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Cancel Request
          </button>
        </div>
      )}

      {showReviewActions && request.status === "PENDING" && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
