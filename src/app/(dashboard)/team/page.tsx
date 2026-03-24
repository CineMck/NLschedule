import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  getOrganizationMembers,
  getOrganizationInvitations,
  getManagersWithDelegations,
} from "@/server/queries/users";
import { MemberList } from "./_components/member-list";
import { InviteDialog } from "./_components/invite-dialog";
import { DelegationPanel } from "./_components/delegation-panel";

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "EMPLOYEE") {
    redirect("/schedule");
  }

  const [members, invitations, managers] = await Promise.all([
    getOrganizationMembers(session.user.organizationId),
    getOrganizationInvitations(session.user.organizationId),
    getManagersWithDelegations(session.user.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <InviteDialog userRole={session.user.role} />
      </div>

      <MemberList
        members={JSON.parse(JSON.stringify(members))}
        currentUserId={session.user.id}
        userRole={session.user.role}
      />

      {session.user.role === "OWNER" && managers.length > 0 && (
        <DelegationPanel managers={managers} />
      )}

      {invitations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Invitations
          </h2>
          <div className="space-y-3">
            {invitations
              .filter((inv) => !inv.acceptedAt && new Date(inv.expiresAt) > new Date())
              .map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {inv.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      Role: {inv.role} | Code: {inv.inviteCode} | Invited by{" "}
                      {inv.invitedBy.name}
                    </p>
                  </div>
                  <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
