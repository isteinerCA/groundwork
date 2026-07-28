"use client";

import { WorkspaceProvider } from "@/components/workspace/workspace-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
