"use client";

import { deleteInvitation, resendInvitation } from "@/server/actions/team";
import { useState } from "react";
import { Mail, Trash2 } from "lucide-react";

type Invitation = {
  id: string;
  email: string;
  role: string;
  inviteCode: string;
  invitedBy: { name: string };
};

export function InvitationList({
  invitations,
  userRole,
}: {
  invitations: Invitation[];
  userRole: "OWNER" | "MANAGER" | "EMPLOYEE";
}) {
  const [resending, setResending] = useState<string | null>(null);
  const [message, setMessage] = useState<{ id: string; type: "success" | "error"; text: string } | null>(null);

  async function handleResend(id: string) {
    setResending(id);
    setMessage(null);
    const result = await resendInvitation(id);
    setResending(null);
    if (result.success) {
      setMessage({ id, type: "success", text: "Email resent!" });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ id, type: "error", text: result.error || "Failed to resend" });
    }
  }

  if (invitations.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Pending Invitations
      </h2>
      <div className="space-y-3">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{inv.email}</p>
              <p className="text-xs text-gray-500">
                Role: {inv.role} | Code: {inv.inviteCode} | Invited by {inv.invitedBy.name}
              </p>
              {message?.id === inv.id && (
                <p className={`text-xs mt-1 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {message.text}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 ml-3">
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                Pending
              </span>
              {userRole === "OWNER" && (
                <>
                  <button
                    onClick={() => handleResend(inv.id)}
                    disabled={resending === inv.id}
                    className="text-xs px-2 py-1 rounded text-primary-600 hover:bg-primary-50 disabled:opacity-50"
                    title="Resend invitation email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete invitation for ${inv.email}?`)) {
                        await deleteInvitation(inv.id);
                      }
                    }}
                    className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50"
                    title="Delete invitation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
