"use client";

import { inviteUser } from "@/server/actions/team";
import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import type { Role } from "@prisma/client";

export function InviteDialog({ userRole }: { userRole: Role }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MANAGER" | "EMPLOYEE">("EMPLOYEE");
  const [result, setResult] = useState<{ code?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await inviteUser(email, role);

    if (res.success && res.data) {
      setResult({ code: res.data.inviteCode });
      setEmail("");
    } else {
      setResult({ error: res.error });
    }
    setLoading(false);
  }

  if (userRole === "EMPLOYEE") return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Invite Member
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Invite Team Member
              </h2>
              <button
                onClick={() => {
                  setOpen(false);
                  setResult(null);
                }}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {result?.code ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium">
                    Invitation created!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Share this invite code:
                  </p>
                  <p className="text-lg font-mono font-bold text-green-900 mt-2">
                    {result.code}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    The invite link:{" "}
                    <span className="font-mono">
                      /signup?code={result.code}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setResult(null);
                  }}
                  className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  Send another invite
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {result?.error && (
                  <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {result.error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="employee@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "MANAGER" | "EMPLOYEE")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    {userRole === "OWNER" && (
                      <option value="MANAGER">Manager</option>
                    )}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Creating..." : "Create Invitation"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
