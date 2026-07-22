import { DashboardView } from "@/components/workspace/dashboard-view";
import { getPrograms } from "@/lib/programs";

export default function DashboardPage() {
  const programs = getPrograms();
  return <DashboardView programs={programs} />;
}
