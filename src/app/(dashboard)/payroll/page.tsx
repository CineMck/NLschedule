import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getWeeklyPayroll } from "@/server/queries/payroll";
import { startOfWeek, parseISO } from "date-fns";
import { PayrollTable } from "./_components/payroll-table";
import { CostSummary } from "./_components/cost-summary";

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role !== "OWNER") {
    redirect("/schedule");
  }

  const params = await searchParams;
  const weekStart = params.week
    ? startOfWeek(parseISO(params.week), { weekStartsOn: 0 })
    : startOfWeek(new Date(), { weekStartsOn: 0 });

  const payroll = await getWeeklyPayroll(
    session.user.organizationId,
    weekStart
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
      <CostSummary entries={payroll.entries} totalCost={payroll.totalCost} />
      <PayrollTable entries={payroll.entries} />
    </div>
  );
}
