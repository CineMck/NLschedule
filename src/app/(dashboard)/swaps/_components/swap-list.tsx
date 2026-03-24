"use client";

import { respondToSwap, approveSwap, rejectSwap } from "@/server/actions/swaps";
import { format } from "date-fns";
import { SWAP_STATUS_COLORS } from "@/lib/constants";
import type { SwapStatus } from "@prisma/client";
import { useState } from "react";

type SwapRequest = {
  id: string;
  requesterId: string;
  recipientId: string;
  status: SwapStatus;
  reason: string | null;
  createdAt: string;
  requester: { name: string };
  recipient: { name: string };
  requesterShift: { title: string | null; startTime: string; endTime: string };
  recipientShift: { title: string | null; startTime: string; endTime: string } | null;
  reviewedBy: { name: string } | null;
};

function ShiftInfo({ shift }: { shift: { title: string | null; startTime: string; endTime: string } }) {
  return (
    <span className="text-xs text-gray-600">
      {format(new Date(shift.startTime), "EEE, MMM d h:mm a")} -{" "}
      {format(new Date(shift.endTime), "h:mm a")}
      {shift.title && ` (${shift.title})`}
    </span>
  );
}

export function SwapList({
  requests,
  currentUserId,
  isReviewer,
}: {
  requests: SwapRequest[];
  currentUserId: string;
  isReviewer: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRespond(swapId: string, accepted: boolean) {
    setLoading(swapId);
    await respondToSwap(swapId, accepted);
    setLoading(null);
  }

  async function handleApprove(swapId: string) {
    setLoading(swapId);
    await approveSwap(swapId);
    setLoading(null);
  }

  async function handleReject(swapId: string) {
    setLoading(swapId);
    await rejectSwap(swapId);
    setLoading(null);
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
        No swap requests
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Swap Requests</h2>
      {requests.map((req) => (
        <div
          key={req.id}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {req.requester.name} wants to swap with {req.recipient.name}
              </p>
              <div>
                <p className="text-xs text-gray-500">Their shift:</p>
                <ShiftInfo shift={req.requesterShift} />
              </div>
              {req.recipientShift && (
                <div>
                  <p className="text-xs text-gray-500">For shift:</p>
                  <ShiftInfo shift={req.recipientShift} />
                </div>
              )}
              {req.reason && (
                <p className="text-xs text-gray-400">Reason: {req.reason}</p>
              )}
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                SWAP_STATUS_COLORS[req.status]
              }`}
            >
              {req.status.replace("_", " ")}
            </span>
          </div>

          {/* Recipient actions */}
          {req.status === "PENDING" &&
            req.recipientId === currentUserId && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => handleRespond(req.id, true)}
                  disabled={loading === req.id}
                  className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRespond(req.id, false)}
                  disabled={loading === req.id}
                  className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            )}

          {/* Reviewer actions */}
          {req.status === "PENDING_APPROVAL" && isReviewer && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => handleApprove(req.id)}
                disabled={loading === req.id}
                className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-lg disabled:opacity-50"
              >
                Approve Swap
              </button>
              <button
                onClick={() => handleReject(req.id)}
                disabled={loading === req.id}
                className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-lg disabled:opacity-50"
              >
                Reject Swap
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
