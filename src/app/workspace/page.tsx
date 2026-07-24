import { DashboardView } from "@/components/workspace/dashboard-view";
import { getPrograms } from "@/lib/programs";

export default function WorkspacePage() {
  const programs = getPrograms();
  return <DashboardView programs={programs} />;
}
