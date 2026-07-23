import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      seasonPassActive: boolean;
      seasonPassExpires: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    seasonPassActive?: boolean;
    seasonPassExpires?: string | null;
  }
}
