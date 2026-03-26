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
import { InvitationList } from "./_components/invitation-list";

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

      <InvitationList
        invitations={invitations.filter(
          (inv) => !inv.acceptedAt && new Date(inv.expiresAt) > new Date()
        )}
        userRole={session.user.role}
      />
    </div>
  );
}
