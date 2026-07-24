import { redirect } from "next/navigation";

/** Legacy route — workspace replaced dashboard in user-facing copy. */
export default function LegacyDashboardRedirect() {
  redirect("/workspace");
}
