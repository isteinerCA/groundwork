"use client";

import { SessionProvider } from "next-auth/react";
import { WorkspaceProvider } from "@/components/workspace/workspace-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </SessionProvider>
  );
}
