import { CompareView } from "@/components/workspace/compare-view";
import { getPrograms } from "@/lib/programs";

export default function ComparePage() {
  const programs = getPrograms();
  return <CompareView programs={programs} />;
}
