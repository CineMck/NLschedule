import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@/server/actions/profile";
import { ProfileForm } from "./_components/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const result = await getProfile();
  if (!result.success || !result.data) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your personal information
        </p>
      </div>
      <ProfileForm profile={result.data} />
    </div>
  );
}
