import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { isEarlyBirdFreeEnabled } from "@/lib/constants/pricing";
import { computeSeasonPassExpiry, isSeasonPassValid } from "@/lib/auth/season-pass";

export interface UserEntitlement {
  seasonPassActive: boolean;
  seasonPassExpires: string | null;
  stripeCustomerId?: string;
  updatedAt: string;
}

type EntitlementStore = Record<string, UserEntitlement>;

const STORE_PATH = path.join(process.cwd(), "data", "entitlements.json");

async function readStore(): Promise<EntitlementStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as EntitlementStore;
  } catch {
    return {};
  }
}

async function writeStore(store: EntitlementStore): Promise<void> {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function getEntitlement(email: string): Promise<UserEntitlement> {
  const normalized = email.toLowerCase();
  const devEmail = process.env.DEV_SEASON_PASS_EMAIL?.toLowerCase();

  if (devEmail && normalized === devEmail && process.env.NODE_ENV === "development") {
    return {
      seasonPassActive: true,
      seasonPassExpires: computeSeasonPassExpiry(),
      updatedAt: new Date().toISOString(),
    };
  }

  const store = await readStore();
  const record = store[normalized];

  if (isEarlyBirdFreeEnabled()) {
    if (!record || !isSeasonPassValid(record.seasonPassExpires)) {
      return activateSeasonPass(normalized, "early_bird");
    }
    return { ...record, seasonPassActive: true };
  }

  if (!record) {
    return {
      seasonPassActive: false,
      seasonPassExpires: null,
      updatedAt: new Date().toISOString(),
    };
  }

  const active =
    record.seasonPassActive && isSeasonPassValid(record.seasonPassExpires);

  return { ...record, seasonPassActive: active };
}

export async function activateSeasonPass(
  email: string,
  stripeCustomerId?: string,
): Promise<UserEntitlement> {
  const store = await readStore();
  const key = email.toLowerCase();
  const record: UserEntitlement = {
    seasonPassActive: true,
    seasonPassExpires: computeSeasonPassExpiry(),
    stripeCustomerId,
    updatedAt: new Date().toISOString(),
  };
  store[key] = record;
  await writeStore(store);
  return record;
}
