import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEntitlement } from "@/lib/auth/entitlements";
import {
  loadServerWorkspace,
  saveServerWorkspace,
} from "@/lib/auth/workspace-store";
import type { WorkspaceState } from "@/lib/types/workspace";

async function requireEntitledSession() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }

  const ent = await getEntitlement(session.user.email);
  if (!ent.seasonPassActive) {
    return {
      error: NextResponse.json({ error: "Season pass required." }, { status: 403 }),
    };
  }

  return { session, email: session.user.email };
}

export async function GET() {
  const result = await requireEntitledSession();
  if ("error" in result && result.error) return result.error;

  const { email } = result as { email: string };
  const workspace = await loadServerWorkspace(email);
  return NextResponse.json({ workspace });
}

export async function PUT(request: Request) {
  const result = await requireEntitledSession();
  if ("error" in result && result.error) return result.error;

  const { email } = result as { email: string };

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("workspace" in body)) {
    return NextResponse.json({ error: "Missing workspace payload." }, { status: 400 });
  }

  const workspace = (body as { workspace: WorkspaceState }).workspace;
  if (!workspace.shortlists?.length) {
    return NextResponse.json({ error: "Invalid workspace." }, { status: 400 });
  }

  await saveServerWorkspace(email, workspace);
  return NextResponse.json({ ok: true });
}
