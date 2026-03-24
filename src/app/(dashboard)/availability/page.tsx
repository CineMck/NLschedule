import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getMyAvailability } from "@/server/actions/availability";
import { AvailabilityGrid } from "./_components/availability-grid";

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const availability = await getMyAvailability();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Availability</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set your available hours for each day of the week
        </p>
      </div>
      <AvailabilityGrid
        availability={JSON.parse(JSON.stringify(availability))}
      />
    </div>
  );
}
